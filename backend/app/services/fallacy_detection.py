import logging

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.schemas.analysis import (
    FallacyDetectionResult,
    ReasoningAnalysis,
    CredibilityAssessment,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an elite debate coach and logic auditor. Analyze the given argument text \
for logical fallacies, reasoning quality, and credibility.

Fallacies to check for, with brief definitions:
- Ad Hominem: attacking the person instead of their argument.
- Straw Man: misrepresenting an opponent's argument to make it easier to attack.
- Slippery Slope: claiming one small step will inevitably lead to extreme consequences, without justification.
- False Dilemma: presenting only two options when more exist.
- Appeal to Authority: claiming something is true only because an authority figure says so.
- Circular Reasoning: the conclusion is just a restatement of the premise.
- Hasty Generalization: drawing a broad conclusion from insufficient evidence.
- Red Herring: introducing an irrelevant point to distract from the actual argument.

Rules for fallacy detection:
- Only flag a fallacy if it's clearly present — do not force a match. Return an empty fallacies list if none exist.
- A single argument may contain more than one fallacy; list each separately.
- Quote offending_text exactly as it appears in the input.
- confidence_score reflects your certainty this is a genuine fallacy (0.0-1.0), not the argument's overall quality.
- Be constructive and specific in correction_suggestion — help the debater argue better, don't just criticize.

Rules for reasoning_analysis:
- Evaluate logical flow, internal consistency, unsupported assumptions, contradictions, and completeness.
- quality must be exactly one of: "Weak", "Moderate", "Strong".

Rules for credibility_assessment:
- Evaluate evidence quality, factual support, and source reliability if any sources are referenced.
- Never invent facts, statistics, or sources that weren't in the input.
- If no evidence was provided at all, say so plainly in credibility_feedback rather than guessing.
- score reflects how well-supported the argument is (0 = no support at all, 10 = rigorously evidenced).
"""

_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        ("human", "Analyze this debate statement for fallacies, reasoning quality, and credibility:\n\n{text}"),
    ]
)


def _get_llm() -> ChatGroq:
    if not settings.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to backend/.env before calling the fallacy detection service."
        )
    return ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0,
    )


def _fallback_result() -> FallacyDetectionResult:
    """Returned when the LLM call or parsing fails, so a debate turn is never
    blocked by an analysis failure."""
    return FallacyDetectionResult(
        fallacies=[],
        reasoning_analysis=ReasoningAnalysis(
            quality="Moderate",
            feedback="Automated reasoning analysis was unavailable for this turn.",
        ),
        credibility_assessment=CredibilityAssessment(
            score=5,
            feedback="Credibility could not be assessed for this turn due to a system issue.",
        ),
    )


def analyze_for_fallacy(text: str) -> FallacyDetectionResult:
    if not text or not text.strip():
        logger.info("analyze_for_fallacy called with empty text; skipping LLM call.")
        return _fallback_result()

    try:
        llm = _get_llm()
        structured_llm = llm.with_structured_output(FallacyDetectionResult)
        chain = _prompt | structured_llm
        result: FallacyDetectionResult = chain.invoke({"text": text})
        return result
    except Exception as exc:
        logger.error("Fallacy detection failed: %s", exc, exc_info=True)
        return _fallback_result()