"""Presentation Analysis Engine (Milestone 4, Module 7).

Two-part pipeline:
1. Filler word detection -- deterministic regex count, not AI-graded, since
   this should be exact and repeatable (same rationale as fixed formulas
   elsewhere in the platform).
2. Confidence / Clarity / Engagement scoring -- LLM-graded from the
   transcript, temperature 0 for consistency.

Only meaningful for spoken (audio) turns -- typed turns have no delivery to
assess, so callers should skip this for typed input.
"""

import re
from typing import List, Tuple

from langchain_groq import ChatGroq

from schemas.presentation import PresentationMetrics

FILLER_PATTERNS = [
    r"\bum+\b", r"\buh+\b", r"\bah+\b", r"\ber+\b",
    r"\blike\b", r"\byou know\b", r"\bsort of\b", r"\bkind of\b",
    r"\bi mean\b", r"\bbasically\b", r"\bactually\b", r"\bso yeah\b",
]
_FILLER_REGEX = re.compile("|".join(FILLER_PATTERNS), re.IGNORECASE)


def _count_filler_words(transcript: str) -> Tuple[int, List[str]]:
    matches = _FILLER_REGEX.findall(transcript)
    cleaned = [m.strip() for m in matches if m.strip()]
    return len(cleaned), cleaned


SYSTEM_PROMPT = """You are a presentation coach evaluating the DELIVERY of a
spoken debate turn -- not the argument's logic (that's scored separately).

You will be given the transcript and how many filler words it contained.

Score 0-100 on:
- confidence_score: Does it sound assured and steady, or hesitant/uncertain?
- clarity_score: Is the delivery clear and easy to follow when spoken aloud?
- engagement_score: Is it dynamic and engaging, or flat and monotone-reading?

A high filler-word count should generally lower confidence and clarity, but
judge holistically -- a short confident statement with 1 filler word can
still score well.

feedback: one or two sentences of specific, actionable delivery advice
(not about the argument's content, only about HOW it was delivered).
"""

_llm = None


def _get_structured_llm():
    global _llm
    if _llm is None:
        base = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.0)
        _llm = base.with_structured_output(PresentationMetrics)
    return _llm


def analyze_presentation(transcript: str) -> PresentationMetrics:
    filler_count, filler_words = _count_filler_words(transcript)

    llm = _get_structured_llm()
    result = llm.invoke(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Transcript: {transcript}\nFiller words counted: {filler_count}"},
        ]
    )
    if not isinstance(result, PresentationMetrics):
        result = PresentationMetrics(**result)

    # Overwrite the LLM's filler fields with our deterministic count -- more
    # reliable than trusting the model to count accurately itself.
    result.filler_word_count = filler_count
    result.filler_words_found = filler_words
    return result