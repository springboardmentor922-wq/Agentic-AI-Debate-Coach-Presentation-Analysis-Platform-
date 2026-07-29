"""
Speech-to-text with automatic failover.

Primary path: OpenAI's hosted Whisper endpoint.
Fallback path: a local faster-whisper model, used automatically whenever the
OpenAI call fails for any reason (missing key, 429 quota, 401 auth, timeout,
network error, or any other exception) so that the upload pipeline can never
be blocked by OpenAI account/billing issues.

Nothing here raises out to the router as a raw exception — callers get a
TranscriptionResult with `.text` and `.engine` ("openai" | "local") so the
API layer can report which engine actually produced the transcript.
"""
from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass

from openai import AsyncOpenAI, APIError, APIStatusError, APIConnectionError, APITimeoutError

from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazily-loaded local model — importing/loading faster-whisper is not free,
# so we only pay for it the first time a local transcription is actually
# needed (i.e. the first time OpenAI fails).
_local_model = None
_local_model_lock = asyncio.Lock()


@dataclass
class TranscriptionResult:
    text: str
    engine: str  # "openai" or "local"
    fallback_reason: str | None = None  # set when engine == "local"


class TranscriptionUnavailableError(Exception):
    """Raised only if BOTH OpenAI and the local fallback fail."""


def _openai_client() -> AsyncOpenAI | None:
    if not settings.OPENAI_API_KEY:
        return None
    # Explicit short timeout + no retries: if the hosted Whisper endpoint is
    # slow/unreachable (quota, network, etc.) we want to fail fast and drop
    # to the local model quickly, rather than hanging on the SDK's default
    # (multi-minute) timeout and blocking the whole upload pipeline.
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY, timeout=8.0, max_retries=0)


async def _transcribe_openai(file_path: str) -> str:
    client = _openai_client()
    if client is None:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    with open(file_path, "rb") as f:
        result = await client.audio.transcriptions.create(
            model=settings.OPENAI_WHISPER_MODEL,
            file=f,
        )
    return result.text


async def _get_local_model():
    """Loads the faster-whisper model once and reuses it across requests."""
    global _local_model
    if _local_model is not None:
        return _local_model
    async with _local_model_lock:
        if _local_model is None:
            from faster_whisper import WhisperModel

            def _load():
                # "base" is a good accuracy/speed/RAM tradeoff for CPU-only
                # demo/dev machines. Override via LOCAL_WHISPER_MODEL if needed.
                return WhisperModel(
                    settings.LOCAL_WHISPER_MODEL,
                    device="cpu",
                    compute_type="int8",
                )

            _local_model = await asyncio.to_thread(_load)
    return _local_model


async def preload_local_model() -> None:
    """Loads and caches the local fallback model ahead of time (called from
    the FastAPI startup event) so the first real fallback transcription
    doesn't have to pay the load cost inline. Safe to call multiple times —
    `_get_local_model` is idempotent."""
    try:
        await _get_local_model()
        logger.info("Local Whisper fallback model preloaded (%s)", settings.LOCAL_WHISPER_MODEL)
    except Exception:
        logger.exception("Failed to preload local Whisper fallback model")


async def _transcribe_local(file_path: str) -> str:
    model = await _get_local_model()

    def _run():
        segments, _info = model.transcribe(file_path)
        return " ".join(seg.text.strip() for seg in segments).strip()

    return await asyncio.to_thread(_run)


async def transcribe_file(file_path: str) -> TranscriptionResult:
    """
    Transcribes an audio file on disk.

    Tries OpenAI Whisper first (when configured). On ANY failure — missing
    key, 429 insufficient_quota, 401, timeout, connection error, or any other
    exception — automatically falls back to a local faster-whisper model and
    returns its result instead, tagging which engine was actually used.
    """
    openai_error: Exception | None = None

    if settings.OPENAI_API_KEY:
        try:
            text = await _transcribe_openai(file_path)
            return TranscriptionResult(text=text, engine="openai")
        except (APIStatusError, APIConnectionError, APITimeoutError, APIError) as exc:
            openai_error = exc
            logger.warning("OpenAI Whisper failed, falling back to local model: %s", exc)
        except Exception as exc:  # belt-and-suspenders: never let this crash the request
            openai_error = exc
            logger.warning("OpenAI Whisper failed unexpectedly, falling back to local model: %s", exc)
    else:
        openai_error = RuntimeError("OPENAI_API_KEY not configured")

    try:
        text = await _transcribe_local(file_path)
        reason = _describe_openai_error(openai_error) if openai_error else None
        return TranscriptionResult(text=text, engine="local", fallback_reason=reason)
    except Exception as local_exc:
        logger.error("Local Whisper fallback also failed: %s", local_exc)
        raise TranscriptionUnavailableError(
            "Both OpenAI Whisper and the local fallback model failed to transcribe this file."
        ) from local_exc


def _describe_openai_error(exc: Exception) -> str:
    status = getattr(exc, "status_code", None)
    if status == 429:
        return "Whisper quota exceeded. Local transcription was used successfully."
    if status == 401:
        return "OpenAI API key invalid or missing. Local transcription was used successfully."
    if isinstance(exc, (APIConnectionError, APITimeoutError)):
        return "OpenAI Whisper was unreachable (network/timeout). Local transcription was used successfully."
    return "OpenAI Whisper was unavailable. Local transcription was used successfully."
