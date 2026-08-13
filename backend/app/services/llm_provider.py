"""
LLM Provider Abstraction (Milestone 2 fix).

Every AI service in this project (fallacy_agent, chatbot_engine,
presentation_service, learning_plan_service, counterargument_service) used
to import `ChatOpenAI` directly, which meant the whole platform went dark
the moment the OpenAI account ran out of quota.

This module centralizes LLM access behind one function, `get_structured_result`,
which:

  1. Tries the primary provider configured via `settings.LLM_PROVIDER`
     ("openai" or "anthropic").
  2. If that raises for ANY reason (quota, auth, network, timeout), tries
     the fallback provider configured via `settings.LLM_FALLBACK_PROVIDER`
     (set to "" to disable).
  3. If both fail (or neither is configured/available), raises
     `AllProvidersUnavailableError` so callers can drop down to the
     deterministic, rule-based analysis engine
     (app/services/deterministic_analysis.py) instead of returning empty
     placeholders.

No application architecture changes are required to add a new provider:
just add a branch to `_build_chat_model` and, if needed, a new pip
dependency.
"""
from __future__ import annotations

import logging
from typing import Any, TypeVar

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class AllProvidersUnavailableError(Exception):
    """Raised when every configured LLM provider fails for a given call."""


def _build_chat_model(provider: str, temperature: float):
    """Instantiate a LangChain chat model for the given provider name.

    Returns None if the provider isn't configured (missing API key), isn't
    recognized, or fails to initialize for any reason (e.g. a bad model
    name, a missing optional dependency, or a misconfigured client option)
    so callers can gracefully skip it and try the next provider in the
    chain instead of the whole request blowing up with a 500.

    Never logs the API key itself — only whether one is present and, on
    failure, the exception type/message (which never contains the key).
    """
    provider = (provider or "").strip().lower()

    if provider == "groq":
        if not settings.GROQ_API_KEY:
            return None
        try:
            from langchain_groq import ChatGroq  # type: ignore[import-not-found]

            return ChatGroq(
                model=settings.GROQ_MODEL,
                temperature=temperature,
                api_key=settings.GROQ_API_KEY,
                timeout=settings.GROQ_TIMEOUT,
                max_retries=1,
            )
        except Exception as exc:  # noqa: BLE001 - never let a bad client config kill the request
            logger.warning("Failed to initialize Groq: %s", exc)
            return None

    if provider == "openai":
        if not settings.OPENAI_API_KEY:
            return None
        try:
            from langchain_openai import ChatOpenAI  # type: ignore[import-not-found]

            return ChatOpenAI(
                model=settings.OPENAI_MODEL,
                temperature=temperature,
                api_key=settings.OPENAI_API_KEY,
                timeout=settings.OPENAI_TIMEOUT,
                max_retries=1,
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to initialize OpenAI: %s", exc)
            return None

    if provider == "anthropic":
        if not settings.ANTHROPIC_API_KEY:
            return None
        try:
            from langchain_anthropic import ChatAnthropic  # type: ignore[import-not-found]

            return ChatAnthropic(
                model=settings.ANTHROPIC_MODEL,
                temperature=temperature,
                api_key=settings.ANTHROPIC_API_KEY,
                timeout=settings.ANTHROPIC_TIMEOUT,
                max_retries=1,
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to initialize Anthropic: %s", exc)
            return None

    if provider:
        logger.warning("Unknown LLM provider configured: %r", provider)
    return None


def _provider_chain() -> list[str]:
    """Ordered, de-duplicated list of providers to try: primary then fallback."""
    chain = []
    if settings.LLM_PROVIDER:
        chain.append(settings.LLM_PROVIDER.strip().lower())
    if settings.LLM_FALLBACK_PROVIDER:
        fb = settings.LLM_FALLBACK_PROVIDER.strip().lower()
        if fb and fb not in chain:
            chain.append(fb)
    return chain


async def get_structured_result(
    *,
    system_prompt: str,
    human_prompt: str,
    variables: dict[str, Any],
    output_schema: type[T],
    temperature: float = 0.0,
) -> T:
    """
    Runs a structured-output LLM call through the provider fallback chain.

    Raises `AllProvidersUnavailableError` if every configured provider fails,
    so the caller can fall back to deterministic rule-based analysis.
    """
    last_error: Exception | None = None
    tried_any = False

    for provider in _provider_chain():
        llm = _build_chat_model(provider, temperature)
        if llm is None:
            continue
        tried_any = True
        try:
            structured_llm = llm.with_structured_output(output_schema)
            prompt = ChatPromptTemplate.from_messages(
                [("system", system_prompt), ("human", human_prompt)]
            )
            chain = prompt | structured_llm
            result = await chain.ainvoke(variables)
            return result
        except Exception as exc:  # noqa: BLE001 - deliberately broad: any provider failure falls through
            last_error = exc
            logger.warning("LLM provider '%s' failed, trying next provider: %s", provider, exc)
            continue

    if not tried_any:
        logger.warning("No LLM provider is configured (no API keys set).")
    raise AllProvidersUnavailableError(
        f"All configured LLM providers failed. Last error: {last_error}"
    )


async def get_text_result_with_history(
    *,
    messages: list[tuple[str, str]],
    variables: dict[str, Any],
    temperature: float = 0.4,
) -> str:
    """Same fallback chain as `get_text_result`, but for multi-turn conversations
    where the caller has already assembled a full (role, content) message list
    (e.g. the AI Mentor's running conversation history) rather than a single
    system+human pair."""
    from langchain_core.output_parsers import StrOutputParser

    last_error: Exception | None = None
    tried_any = False

    for provider in _provider_chain():
        llm = _build_chat_model(provider, temperature)
        if llm is None:
            continue
        tried_any = True
        try:
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm | StrOutputParser()
            return await chain.ainvoke(variables)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            logger.warning("LLM provider '%s' failed, trying next provider: %s", provider, exc)
            continue

    if not tried_any:
        logger.warning("No LLM provider is configured (no API keys set).")
    raise AllProvidersUnavailableError(
        f"All configured LLM providers failed. Last error: {last_error}"
    )


async def stream_text_result_with_history(
    *,
    messages: list[tuple[str, str]],
    variables: dict[str, Any],
    temperature: float = 0.4,
):
    """Token-by-token streaming variant of get_text_result_with_history, used
    by the global chatbot so replies render progressively in the UI instead
    of appearing all at once. Yields (chunk_text, is_final_fallback) tuples.

    If every provider fails, yields the deterministic-fallback text is NOT
    produced here (callers don't have the fallback text) — callers should
    catch AllProvidersUnavailableError and stream their own fallback text
    in word-sized chunks instead, so even the fallback path still *feels*
    like streaming rather than one silent pause + dump.
    """
    last_error: Exception | None = None
    tried_any = False

    for provider in _provider_chain():
        llm = _build_chat_model(provider, temperature)
        if llm is None:
            continue
        tried_any = True
        try:
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | llm
            got_any_chunk = False
            async for chunk in chain.astream(variables):
                piece = getattr(chunk, "content", None)
                if piece:
                    got_any_chunk = True
                    yield piece
            if got_any_chunk:
                return
            raise RuntimeError("Provider produced no streamed content")
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            logger.warning("LLM provider '%s' failed while streaming, trying next provider: %s", provider, exc)
            continue

    if not tried_any:
        logger.warning("No LLM provider is configured (no API keys set).")
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
    """Same fallback chain as `get_structured_result`, but for plain text output
    (used for the AI opponent's free-form rebuttal)."""
    from langchain_core.output_parsers import StrOutputParser

    last_error: Exception | None = None
    tried_any = False

    for provider in _provider_chain():
        llm = _build_chat_model(provider, temperature)
        if llm is None:
            continue
        tried_any = True
        try:
            prompt = ChatPromptTemplate.from_messages(
                [("system", system_prompt), ("human", human_prompt)]
            )
            chain = prompt | llm | StrOutputParser()
            return await chain.ainvoke(variables)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            logger.warning("LLM provider '%s' failed, trying next provider: %s", provider, exc)
            continue

    if not tried_any:
        logger.warning("No LLM provider is configured (no API keys set).")
    raise AllProvidersUnavailableError(
        f"All configured LLM providers failed. Last error: {last_error}"
    )