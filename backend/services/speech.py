"""Transcribes recorded debate audio to text using Groq's hosted Whisper API
(free tier -- no paid OpenAI credits required)."""

import os

from groq import Groq

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    return _client


def transcribe_audio(file_path: str) -> str:
    client = _get_client()
    with open(file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=audio_file,
        )
    return (transcript.text or "").strip()