"""
LLM Provider Abstraction with enhanced error handling and fallback.

Architecture:
- Multi-provider support with automatic fallback
- Retry logic with exponential backoff for transient errors
- Comprehensive error handling for quota, rate limits, and timeouts
- Token usage optimization with configurable temperature and max tokens
- Streaming support for real-time responses
- All providers configured via settings

Provider Chain:
1. Primary provider (OPENAI by default)
2. Fallback provider (ANTHROPIC by default)
3. Additional fallbacks if configured
4. Deterministic fallback as last resort
"""

from __future__ import annotations

import importlib
import logging
import asyncio
from typing import Any, TypeVar, AsyncGenerator, Optional
from functools import wraps
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class AllProvidersUnavailableError(Exception):
    """Raised when every configured LLM provider fails for a given call."""
    pass


class ProviderRateLimitError(Exception):
    """Raised when a provider returns a rate limit error."""
    pass


class ProviderQuotaError(Exception):
    """Raised when a provider returns a quota exceeded error."""
    pass


# --- Retry Configuration ---
def with_retry(func):
    """Decorator for retry logic on transient errors."""
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((
            ProviderRateLimitError,
            asyncio.TimeoutError,
        )),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    return wrapper


def _build_chat_model(provider: str, temperature: float):
    """
    Instantiate a LangChain chat model for the given provider name.
    
    Args:
        provider: Provider name (openai, anthropic)
        temperature: Temperature for text generation
    
    Returns:
        Chat model instance or None if provider not configured
    """
    provider = (provider or "").strip().lower()

    if provider == "openai":
        if not settings.OPENAI_API_KEY:
            logger.debug("OpenAI API key not configured")
            return None
        try:
            module = importlib.import_module("langchain_openai")
            ChatOpenAI = getattr(module, "ChatOpenAI")
            return ChatOpenAI(
                model=settings.OPENAI_MODEL,
                temperature=temperature,
                api_key=settings.OPENAI_API_KEY,
                timeout=settings.OPENAI_TIMEOUT,
                max_retries=2,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                # Handle rate limits and quota errors
                model_kwargs={
                    "response_format": {"type": "text"},
                },
            )
        except ImportError as e:
            logger.warning(f"langchain_openai not installed: {e}")
            return None
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI: {e}")
            return None

    if provider == "anthropic":
        if not settings.ANTHROPIC_API_KEY:
            logger.debug("Anthropic API key not configured")
            return None
        try:
            module = importlib.import_module("langchain_anthropic")
            ChatAnthropic = getattr(module, "ChatAnthropic")
            return ChatAnthropic(
                model=settings.ANTHROPIC_MODEL,
                temperature=temperature,
                api_key=settings.ANTHROPIC_API_KEY,
                timeout=settings.ANTHROPIC_TIMEOUT,
                max_retries=2,
                max_tokens=settings.ANTHROPIC_MAX_TOKENS,
            )
        except ImportError as e:
            logger.warning(f"langchain_anthropic not installed: {e}")
            return None
        except Exception as e:
            logger.warning(f"Failed to initialize Anthropic: {e}")
            return None

    if provider:
        logger.warning(f"Unknown LLM provider configured: {provider!r}")
    return None


def _provider_chain() -> list[str]:
    """
    Build ordered, deduplicated list of providers to try.
    
    Returns:
        List of provider names in order of preference
    """
    chain = []
    
    # Primary provider
    if settings.LLM_PROVIDER:
        chain.append(settings.LLM_PROVIDER.strip().lower())
    
    # Fallback provider
    if settings.LLM_FALLBACK_PROVIDER:
        fb = settings.LLM_FALLBACK_PROVIDER.strip().lower()
        if fb and fb not in chain:
            chain.append(fb)
    
    # Additional fallbacks (if configured)
    # Always try OpenAI as last resort if configured and not already in chain
    if "openai" not in chain and settings.OPENAI_API_KEY:
        chain.append("openai")
    
    # Try Anthropic as last resort if configured
    if "anthropic" not in chain and settings.ANTHROPIC_API_KEY:
        chain.append("anthropic")
    
    logger.debug(f"Provider chain: {chain}")
    return chain


def _handle_provider_error(provider: str, error: Exception) -> Optional[Exception]:
    """
    Handle provider-specific errors and return appropriate exception.
    
    Args:
        provider: Provider name
        error: Original exception
    
    Returns:
        Exception to raise or None if error should be handled silently
    """
    error_str = str(error).lower()
    
    # OpenAI specific errors
    if provider == "openai":
        # Rate limit errors (429)
        if "rate limit" in error_str or "ratelimit" in error_str:
            logger.warning(f"OpenAI rate limit exceeded: {error}")
            return ProviderRateLimitError(f"OpenAI rate limit: {error}")
        
        # Quota errors (429)
        if "quota" in error_str or "insufficient_quota" in error_str:
            logger.warning(f"OpenAI quota exceeded: {error}")
            return ProviderQuotaError(f"OpenAI quota exceeded: {error}")
        
        # Authentication errors
        if "auth" in error_str or "api key" in error_str:
            logger.warning(f"OpenAI authentication failed: {error}")
            return error
    
    # Anthropic specific errors
    if provider == "anthropic":
        # Rate limit errors
        if "rate" in error_str or "limit" in error_str:
            logger.warning(f"Anthropic rate limit exceeded: {error}")
            return ProviderRateLimitError(f"Anthropic rate limit: {error}")
        
        # Quota errors
        if "quota" in error_str or "credit" in error_str:
            logger.warning(f"Anthropic quota exceeded: {error}")
            return ProviderQuotaError(f"Anthropic quota exceeded: {error}")
    
    # Generic timeout errors
    if isinstance(error, asyncio.TimeoutError):
        logger.warning(f"Provider {provider} timed out")
        return asyncio.TimeoutError(f"Provider {provider} timed out")
    
    # Generic connection errors
    if "connection" in error_str or "network" in error_str:
        logger.warning(f"Provider {provider} connection error: {error}")
        return error
    
    return error


@with_retry
async def _call_with_retry(llm, prompt, variables, provider: str):
    """
    Call LLM with retry logic for transient errors.
    
    Args:
        llm: LLM instance
        prompt: Chat prompt template
        variables: Variables for template
        provider: Provider name for logging
    
    Returns:
        LLM response
    """
    try:
        chain = prompt | llm
        result = await asyncio.wait_for(
            chain.ainvoke(variables),
            timeout=60
        )
        return result
    except Exception as e:
        handled_error = _handle_provider_error(provider, e)
        if isinstance(handled_error, (ProviderRateLimitError, ProviderQuotaError)):
            # Re-raise for retry
            raise handled_error
        # For other errors, raise the original
        raise e


async def get_structured_result(
    *,
    system_prompt: str,
    human_prompt: str,
    variables: dict[str, Any],
    output_schema: type[T],
    temperature: float = 0.0,
) -> T:
    """
    Runs a structured-output LLM call with provider fallback.
    
    Args:
        system_prompt: System prompt for the LLM
        human_prompt: Human prompt template
        variables: Variables for template substitution
        output_schema: Pydantic model for structured output
        temperature: Temperature for generation (0.0-1.0)
    
    Returns:
        Structured output as Pydantic model
    
    Raises:
        AllProvidersUnavailableError: If all providers fail
    """
    last_error: Exception | None = None
    tried_any = False

    for provider in _provider_chain():
        llm = _build_chat_model(provider, temperature)
        if llm is None:
            continue
        
        tried_any = True
        logger.info(f"Trying structured output with provider: {provider}")
        
        try:
            # Create structured output chain
            structured_llm = llm.with_structured_output(output_schema)
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", human_prompt),
            ])
            chain = prompt | structured_llm
            
            # Call with retry
            result = await _call_with_retry(
                chain, prompt, variables, provider
            )
            
            logger.info(f"Provider {provider} succeeded")
            return result
            
        except ProviderQuotaError as e:
            logger.warning(f"Provider {provider} quota exceeded, trying next: {e}")
            last_error = e
            continue
            
        except ProviderRateLimitError as e:
            logger.warning(f"Provider {provider} rate limited, trying next: {e}")
            last_error = e
            continue
            
        except asyncio.TimeoutError as e:
            logger.warning(f"Provider {provider} timed out, trying next: {e}")
            last_error = e
            continue
            
        except Exception as e:
            logger.warning(f"Provider {provider} failed: {e}", exc_info=True)
            last_error = e
            continue

    if not tried_any:
        logger.warning("No LLM provider is configured (no API keys set).")
        raise AllProvidersUnavailableError(
            "No LLM providers configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env"
        )
    
    raise AllProvidersUnavailableError(
        f"All configured LLM providers failed. Last error: {last_error}"
    )


async def get_text_result_with_history(
    *,
    messages: list[tuple[str, str]],
    variables: dict[str, Any],
    temperature: float = 0.4,
) -> str:
    """
    Same fallback chain for multi-turn conversations.
    
    Args:
        messages: List of (role, content) message tuples
        variables: Variables for template substitution
        temperature: Temperature for generation (0.0-1.0)
    
    Returns:
        Text response from LLM
    
    Raises:
        AllProvidersUnavailableError: If all providers fail
    """
    last_error: Exception | None = None
    tried_any = False

    for provider in _provider_chain():
        llm = _build_chat_model(provider, temperature)
        if llm is None:
            continue
        
        tried_any = True
        logger.info(f"Trying text result with history using provider: {provider}")
        
        try:
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm | StrOutputParser()
            
            # Call with retry
            result = await _call_with_retry(
                chain, prompt, variables, provider
            )
            
            logger.info(f"Provider {provider} succeeded")
            return result
            
        except ProviderQuotaError as e:
            logger.warning(f"Provider {provider} quota exceeded, trying next: {e}")
            last_error = e
            continue
            
        except ProviderRateLimitError as e:
            logger.warning(f"Provider {provider} rate limited, trying next: {e}")
            last_error = e
            continue
            
        except asyncio.TimeoutError as e:
            logger.warning(f"Provider {provider} timed out, trying next: {e}")
            last_error = e
            continue
            
        except Exception as e:
            logger.warning(f"Provider {provider} failed: {e}", exc_info=True)
            last_error = e
            continue

    if not tried_any:
        logger.warning("No LLM provider is configured (no API keys set).")
        raise AllProvidersUnavailableError(
            "No LLM providers configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env"
        )
    
    raise AllProvidersUnavailableError(
        f"All configured LLM providers failed. Last error: {last_error}"
    )


async def stream_text_result_with_history(
    *,
    messages: list[tuple[str, str]],
    variables: dict[str, Any],
    temperature: float = 0.4,
) -> AsyncGenerator[str, None]:
    """
    Token-by-token streaming variant with provider fallback.
    
    Args:
        messages: List of (role, content) message tuples
        variables: Variables for template substitution
        temperature: Temperature for generation (0.0-1.0)
    
    Yields:
        Text chunks as they are generated
    
    Raises:
        AllProvidersUnavailableError: If all providers fail
    """
    last_error: Exception | None = None
    tried_any = False

    for provider in _provider_chain():
        llm = _build_chat_model(provider, temperature)
        if llm is None:
            continue
        
        tried_any = True
        logger.info(f"Trying streaming with provider: {provider}")
        
        try:
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm
            
            got_any_chunk = False
            
            # Stream the response
            async for chunk in chain.astream(variables):
                piece = getattr(chunk, "content", None)
                if piece:
                    got_any_chunk = True
                    yield piece
            
            if got_any_chunk:
                logger.info(f"Provider {provider} streaming succeeded")
                return
            
            # If no chunks were received, try next provider
            logger.warning(f"Provider {provider} produced no streamed content")
            raise RuntimeError("Provider produced no streamed content")
            
        except ProviderQuotaError as e:
            logger.warning(f"Provider {provider} quota exceeded, trying next: {e}")
            last_error = e
            continue
            
        except ProviderRateLimitError as e:
            logger.warning(f"Provider {provider} rate limited, trying next: {e}")
            last_error = e
            continue
            
        except asyncio.TimeoutError as e:
            logger.warning(f"Provider {provider} timed out while streaming, trying next: {e}")
            last_error = e
            continue
            
        except Exception as e:
            logger.warning(f"Provider {provider} failed while streaming: {e}", exc_info=True)
            last_error = e
            continue

    if not tried_any:
        logger.warning("No LLM provider is configured (no API keys set).")
        raise AllProvidersUnavailableError(
            "No LLM providers configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env"
        )
    
    raise AllProvidersUnavailableError(
        f"All configured LLM providers failed. Last error: {last_error}"
    )


async def get_text_result(
    *,
    system_prompt: str,
    human_prompt: str,
    variables: dict[str, Any],
    temperature: float = 0.4,
) -> str:
    """
    Same fallback chain for plain text output.
    
    Args:
        system_prompt: System prompt for the LLM
        human_prompt: Human prompt template
        variables: Variables for template substitution
        temperature: Temperature for generation (0.0-1.0)
    
    Returns:
        Text response from LLM
    
    Raises:
        AllProvidersUnavailableError: If all providers fail
    """
    last_error: Exception | None = None
    tried_any = False

    for provider in _provider_chain():
        llm = _build_chat_model(provider, temperature)
        if llm is None:
            continue
        
        tried_any = True
        logger.info(f"Trying text result with provider: {provider}")
        
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", human_prompt),
            ])
            chain = prompt | llm | StrOutputParser()
            
            # Call with retry
            result = await _call_with_retry(
                chain, prompt, variables, provider
            )
            
            logger.info(f"Provider {provider} succeeded")
            return result
            
        except ProviderQuotaError as e:
            logger.warning(f"Provider {provider} quota exceeded, trying next: {e}")
            last_error = e
            continue
            
        except ProviderRateLimitError as e:
            logger.warning(f"Provider {provider} rate limited, trying next: {e}")
            last_error = e
            continue
            
        except asyncio.TimeoutError as e:
            logger.warning(f"Provider {provider} timed out, trying next: {e}")
            last_error = e
            continue
            
        except Exception as e:
            logger.warning(f"Provider {provider} failed: {e}", exc_info=True)
            last_error = e
            continue

    if not tried_any:
        logger.warning("No LLM provider is configured (no API keys set).")
        raise AllProvidersUnavailableError(
            "No LLM providers configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env"
        )
    
    raise AllProvidersUnavailableError(
        f"All configured LLM providers failed. Last error: {last_error}"
    )


# --- Deterministic Fallback ---
def get_deterministic_response(
    system_prompt: str,
    human_prompt: str,
    variables: dict[str, Any],
) -> str:
    """
    Deterministic fallback when all LLM providers are unavailable.
    
    This provides a meaningful response even when no LLM is available.
    
    Args:
        system_prompt: System prompt (ignored in deterministic mode)
        human_prompt: Human prompt template
        variables: Variables for template substitution
    
    Returns:
        Deterministic response
    """
    # Extract the user's message from variables
    user_message = variables.get("message", variables.get("user_text", ""))
    
    # Simple deterministic response based on message content
    response = f"I understand you're asking about: {user_message[:50]}..."
    
    # Add context-specific responses
    if "fallacy" in user_message.lower():
        response += " I can help you identify logical fallacies in arguments."
    elif "argument" in user_message.lower():
        response += " Let me help you analyze and improve your argument structure."
    elif "presentation" in user_message.lower():
        response += " I can provide feedback on your presentation skills."
    elif "coach" in user_message.lower():
        response += " I'm here to help you with coaching and performance improvement."
    elif "learning" in user_message.lower():
        response += " I can help you with learning resources and practice exercises."
    elif "admin" in user_message.lower() or "system" in user_message.lower():
        response += " I can provide system status and administration information."
    
    response += " Note: Currently using deterministic fallback. Configure your LLM API keys for full AI-powered responses."
    
    return response