"""
Speech-to-text using Local Faster-Whisper only.

This implementation performs all transcription locally.
No OpenAI API key or cloud service is required.

The frontend and API endpoints remain unchanged.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass

from app.core.config import settings

logger = logging.getLogger(__name__)

_local_model = None
_local_model_lock = asyncio.Lock()


@dataclass
class TranscriptionResult:
    text: str
    engine: str  # always "local"
    fallback_reason: str | None = None


class TranscriptionUnavailableError(Exception):
    """Raised when local transcription fails."""


async def _get_local_model():
    """
    Loads the Faster-Whisper model only once and reuses it.
    """
    global _local_model

    if _local_model is not None:
        return _local_model

    async with _local_model_lock:
        if _local_model is None:
            from faster_whisper import WhisperModel

            def _load():
                return WhisperModel(
                    settings.LOCAL_WHISPER_MODEL,
                    device="cpu",
                    compute_type="int8",
                )

            _local_model = await asyncio.to_thread(_load)

    return _local_model


async def preload_local_model() -> None:
    """
    Preloads the Faster-Whisper model during FastAPI startup.
    """
    try:
        await _get_local_model()
        logger.info(
            "Local Whisper model preloaded (%s)",
            settings.LOCAL_WHISPER_MODEL,
        )
    except Exception:
        logger.exception("Failed to preload Local Whisper model")


async def _transcribe_local(file_path: str) -> str:
    model = await _get_local_model()

    def _run():
        segments, _ = model.transcribe(file_path)

        return " ".join(
            segment.text.strip()
            for segment in segments
        ).strip()

    return await asyncio.to_thread(_run)


async def transcribe_file(file_path: str) -> TranscriptionResult:
    """
    Transcribes an audio file using Local Faster-Whisper.
    """

    try:
        text = await _transcribe_local(file_path)

        return TranscriptionResult(
            text=text,
            engine="local",
            fallback_reason=None,
        )

    except Exception as exc:
        logger.exception("Local Whisper transcription failed")

        raise TranscriptionUnavailableError(
            "Local Whisper failed to transcribe this audio."
        ) from exc