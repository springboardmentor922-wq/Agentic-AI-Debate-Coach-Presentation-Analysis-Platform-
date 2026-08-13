import re

from groq import Groq

from app.core.config import settings
from app.schemas.presentation import PresentationMetrics

FILLER_WORDS = [
    "um", "uh", "like", "you know", "sort of", "kind of",
    "basically", "actually", "literally", "i mean",
]

_filler_pattern = re.compile(
    r"\b(" + "|".join(re.escape(w) for w in FILLER_WORDS) + r")\b",
    re.IGNORECASE,
)


def _get_groq_client() -> Groq:
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set.")
    return Groq(api_key=settings.GROQ_API_KEY)


def transcribe_audio(file_path: str) -> tuple[str, float]:
    """Returns (transcript_text, duration_seconds). Uses Groq's hosted Whisper —
    no local model, no GPU needed, same API key you already use for chat."""
    client = _get_groq_client()
    with open(file_path, "rb") as f:
        result = client.audio.transcriptions.create(
            file=f,
            model="whisper-large-v3-turbo",
            response_format="verbose_json",
        )
    return result.text, result.duration


def compute_presentation_metrics(transcript: str, duration_seconds: float) -> PresentationMetrics:
    words = transcript.split()
    word_count = len(words)
    wpm = round(word_count / (duration_seconds / 60), 1) if duration_seconds > 0 else 0.0

    filler_count = len(_filler_pattern.findall(transcript))
    filler_density = round(filler_count / word_count, 3) if word_count > 0 else 0.0

    # Heuristic: pacing centered on 140 wpm (a natural conversational pace),
    # penalized by filler density. Not a "real" confidence score — tune later.
    pacing_score = max(1.0 - abs(wpm - 140) / 140, 0.0) if wpm else 0.0
    filler_score = max(1.0 - filler_density * 5, 0.0)
    confidence_score = round((pacing_score * 0.5 + filler_score * 0.5) * 100, 1)

    return PresentationMetrics(
        transcript=transcript,
        duration_seconds=round(duration_seconds, 1),
        word_count=word_count,
        wpm=wpm,
        filler_count=filler_count,
        filler_density=filler_density,
        confidence_score=confidence_score,
    )