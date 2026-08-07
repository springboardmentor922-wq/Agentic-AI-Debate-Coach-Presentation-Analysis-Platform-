"""
LLM Provider Abstraction using Google Gemini.

All AI services in the platform (mentor, chatbot, debate opponent,
argument analyzer, presentation analysis, coaching, learning plans,
counterarguments, etc.) call this module.

If Gemini is unavailable, the existing deterministic fallback inside each
service continues to work automatically.
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
    """Raised whenever Gemini cannot produce a response."""


def _build_chat_model(temperature: float = 0.4):
    """
    Builds a Gemini chat model.

    Returns None when no API key exists so the existing deterministic
    fallback in the services is used automatically.
    """

    if not settings.GEMINI_API_KEY:
        return None

    from langchain_google_genai import ChatGoogleGenerativeAI

    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
        convert_system_message_to_human=True,
        max_retries=1,      # Prevent long retry loops
    )


async def get_structured_result(
    *,
    system_prompt: str,
    human_prompt: str,
    variables: dict[str, Any],
    output_schema: type[T],
    temperature: float = 0.0,
) -> T:
    """
    Structured-output generation using Gemini.
    """

    llm = _build_chat_model(temperature)

    if llm is None:
        logger.warning("Gemini API key not configured.")

        raise AllProvidersUnavailableError(
            "Gemini API key not configured."
        )
     
    try:
        structured_llm = llm.with_structured_output(output_schema)

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", human_prompt),
            ]
        )

        chain = prompt | structured_llm

        result = await chain.ainvoke(variables)

        return result

    except Exception as exc:
        logger.exception(
            "Gemini structured generation failed: %s",
            exc,
        )

        raise AllProvidersUnavailableError(
            f"Gemini failed: {exc}"
        )
async def get_text_result_with_history(
    *,
    messages: list[tuple[str, str]],
    variables: dict[str, Any],
    temperature: float = 0.4,
) -> str:
    """
    Multi-turn conversation using Gemini.
    """

    import time
    from langchain_core.output_parsers import StrOutputParser

    llm = _build_chat_model(temperature)

    if llm is None:
        logger.warning("Gemini API key not configured.")

        raise AllProvidersUnavailableError(
            "Gemini API key not configured."
        )

    try:
        prompt = ChatPromptTemplate.from_messages(messages)

        chain = prompt | llm | StrOutputParser()

        start = time.perf_counter()

        result = await chain.ainvoke(variables)

        logger.info(
            "Gemini conversation completed in %.2f seconds",
            time.perf_counter() - start,
        )

        return result

    except Exception as exc:
        logger.exception(
            "Gemini conversation failed: %s",
            exc,
        )

        raise AllProvidersUnavailableError(
            f"Gemini failed: {exc}"
        )
async def stream_text_result_with_history(
    *,
    messages: list[tuple[str, str]],
    variables: dict[str, Any],
    temperature: float = 0.4,
):
    """
    Streaming conversation using Gemini.
    Used by the chatbot to stream responses token-by-token.
    """

    llm = _build_chat_model(temperature)

    if llm is None:
        logger.warning("Gemini API key not configured.")

        raise AllProvidersUnavailableError(
            "Gemini API key not configured."
        )

    try:
        prompt = ChatPromptTemplate.from_messages(messages)

        chain = prompt | llm

        got_any_chunk = False

        async for chunk in chain.astream(variables):
            piece = getattr(chunk, "content", None)

            if piece:
                got_any_chunk = True
                yield piece

        if not got_any_chunk:
            raise RuntimeError(
                "Gemini produced no streamed content."
            )

    except Exception as exc:
        logger.exception(
            "Gemini streaming failed: %s",
            exc,
        )

        raise AllProvidersUnavailableError(
            f"Gemini failed: {exc}"
        )

async def get_text_result(
    *,
    system_prompt: str,
    human_prompt: str,
    variables: dict[str, Any],
    temperature: float = 0.4,
) -> str:
    """
    Plain text generation using Gemini.
    Used for debate opponent, mentor replies, coaching, etc.
    """

    import time
    from langchain_core.output_parsers import StrOutputParser

    llm = _build_chat_model(temperature)

    if llm is None:
        logger.warning("Gemini API key not configured.")

        raise AllProvidersUnavailableError(
            "Gemini API key not configured."
        )

    try:
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", human_prompt),
            ]
        )

        chain = prompt | llm | StrOutputParser()

        start = time.perf_counter()

        result = await chain.ainvoke(variables)

        logger.info(
            "Gemini text generation completed in %.2f seconds",
            time.perf_counter() - start,
        )

        return result

    except Exception as exc:
        logger.exception(
            "Gemini text generation failed: %s",
            exc,
        )

        raise AllProvidersUnavailableError(
            f"Gemini failed: {exc}"
        )