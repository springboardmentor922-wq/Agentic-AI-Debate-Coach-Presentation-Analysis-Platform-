"""
Presentation Analysis Engine (Module 7 / Milestone 3, Parts 3-4).

Speech metrics (pace, filler-word usage) are computed deterministically from
the real transcript + measured duration — no ML training required for
these. Confidence/clarity/engagement scoring is delegated to the LLM
provider fallback chain (app/services/llm_provider.py), following the same
pattern as fallacy_agent.py, with a deterministic rule-based scorer used if
every provider is unavailable (app/services/deterministic_analysis.py).
"""
import logging
import re

from app.schemas.debate_simulation import SpeechMetrics, PresentationScore
from app.services.llm_provider import get_structured_result, AllProvidersUnavailableError
from app.services import deterministic_analysis as det

logger = logging.getLogger(__name__)

FILLER_WORDS = ["um", "uh", "like", "you know", "sort of", "kind of", "basically", "actually", "literally", "i mean"]

PRESENTATION_SYSTEM_PROMPT = """You are an elite presentation and communication coach.
Given a speech transcript and its measured delivery metrics (words per minute,
filler word count, duration), score the speaker's delivery from 0-100 on:
- confidence_score: vocal/verbal confidence as implied by phrasing and structure
- clarity_score: how clear and easy to follow the language is
- engagement_score: how likely this would hold an audience's attention
- pacing_score: score 100 for pacing in the ideal 130-160 wpm range, penalizing
  distance from that range (too fast reads as rushed, too slow as hesitant)
- fluency_score: smoothness of delivery — penalize filler words, repetition, false starts
- pronunciation_score: a text-based proxy (word choice complexity, sentence flow) since
  no phonetic audio analysis is performed — be conservative and explain this limitation
  is baked into the score if it materially affects confidence in the number
- grammar_score: grammatical correctness of the transcript
- persuasion_score: rhetorical persuasiveness of the argument as delivered
overall_score is the mean of confidence/clarity/engagement/pacing (0-100, one decimal place).
Also provide:
- strengths: 2-4 short, specific things the speaker did well
- weaknesses: 2-4 short, specific things that held the delivery back
- improvement_suggestions: 2-4 concrete, actionable next steps
- feedback: 2-3 sentences of specific, actionable overall feedback
Be objective and consistent (temperature 0)."""


def compute_speech_metrics(transcript: str, duration_seconds: float) -> SpeechMetrics:
    words = re.findall(r"\b[\w']+\b", transcript.lower())
    word_count = len(words)
    minutes = max(duration_seconds / 60, 1 / 60)
    wpm = round(word_count / minutes, 1)

    text_lower = transcript.lower()
    filler_counts: dict[str, int] = {}
    total_fillers = 0
    for phrase in FILLER_WORDS:
        count = len(re.findall(rf"\b{re.escape(phrase)}\b", text_lower))
        if count:
            filler_counts[phrase] = count
            total_fillers += count

    return SpeechMetrics(
        words_per_minute=wpm,
        filler_word_count=total_fillers,
        filler_words=filler_counts,
        duration_seconds=round(duration_seconds, 1),
        word_count=word_count,
    )


async def score_presentation(transcript: str, metrics: SpeechMetrics) -> PresentationScore:
    """Falls back through the LLM provider chain, and finally to a
    deterministic scorer that computes confidence/clarity/engagement/pacing
    directly from the transcript and metrics, so a real transcript never
    produces an all-zero score."""
    try:
        return await get_structured_result(
            system_prompt=PRESENTATION_SYSTEM_PROMPT,
            human_prompt=(
                "Transcript:\n{transcript}\n\n"
                "Measured metrics: {wpm} words/minute, {fillers} filler words, "
                "{duration}s duration, {word_count} words total."
            ),
            variables={
                "transcript": transcript,
                "wpm": metrics.words_per_minute,
                "fillers": metrics.filler_word_count,
                "duration": metrics.duration_seconds,
                "word_count": metrics.word_count,
            },
            output_schema=PresentationScore,
            temperature=0.0,
        )
    except AllProvidersUnavailableError:
        logger.warning("score_presentation: all LLM providers unavailable, using deterministic fallback")
        return det.score_presentation_deterministic(transcript, metrics)
    except Exception:
        logger.exception("score_presentation: unexpected error, using deterministic fallback")
        return det.score_presentation_deterministic(transcript, metrics)
