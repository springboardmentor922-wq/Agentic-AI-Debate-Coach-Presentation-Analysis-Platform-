"""Deterministic presentation analysis used when analysing a spoken transcript."""

import re
from collections import Counter

FILLER_WORDS = {"um", "uh", "like", "actually", "basically", "literally", "you know"}
TRANSITIONS = {"first", "second", "finally", "however", "therefore", "because", "for example", "in conclusion"}


def _score(value: float) -> float:
    return round(max(0, min(10, value)), 1)


def analyze_presentation(transcript: str, duration_seconds: int | None = None) -> dict:
    """Return explainable delivery metrics for a presentation transcript."""
    words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", transcript.lower())
    word_count = len(words)
    normalized = " ".join(words)
    fillers = sum(len(re.findall(rf"\b{re.escape(term)}\b", normalized)) for term in FILLER_WORDS)
    transition_count = sum(len(re.findall(rf"\b{re.escape(term)}\b", normalized)) for term in TRANSITIONS)
    sentences = [item.strip() for item in re.split(r"[.!?]+", transcript) if item.strip()]
    average_sentence_length = round(word_count / len(sentences), 1) if sentences else 0
    words_per_minute = round(word_count / (duration_seconds / 60), 1) if duration_seconds else None

    filler_rate = (fillers / word_count * 100) if word_count else 0
    clarity = _score(9 - max(0, average_sentence_length - 18) * 0.18 - filler_rate * 0.12)
    structure = _score(5.5 + min(transition_count, 5) * 0.9 + (0.5 if len(sentences) >= 3 else 0))
    pacing = _score(7.0 if words_per_minute is None else 10 - min(abs(words_per_minute - 135) / 18, 6))
    confidence = _score(8.8 - filler_rate * 0.22)
    overall = _score((clarity + structure + pacing + confidence) / 4)

    suggestions = []
    if fillers:
        suggestions.append("Replace filler words with a short pause before your next point.")
    if transition_count < 2:
        suggestions.append("Signpost your ideas with transitions such as 'first', 'however', and 'in conclusion'.")
    if words_per_minute and words_per_minute > 165:
        suggestions.append("Slow down slightly and pause after each key claim so the audience can follow it.")
    elif words_per_minute and words_per_minute < 95:
        suggestions.append("Increase your pace slightly to keep the delivery energetic and within time.")
    if average_sentence_length > 22:
        suggestions.append("Break long sentences into one claim, one reason, and one example.")
    if not suggestions:
        suggestions.append("Your delivery is balanced; rehearse with a timer to keep this consistency.")

    common_fillers = [word for word, _ in Counter(re.findall(r"\b(?:um|uh|like|actually|basically|literally)\b", normalized)).most_common(3)]
    return {
        "overall_score": overall,
        "metrics": {"clarity": clarity, "structure": structure, "pacing": pacing, "confidence": confidence},
        "word_count": word_count,
        "duration_seconds": duration_seconds,
        "words_per_minute": words_per_minute,
        "filler_word_count": fillers,
        "common_fillers": common_fillers,
        "transition_count": transition_count,
        "average_sentence_length": average_sentence_length,
        "suggestions": suggestions,
    }
