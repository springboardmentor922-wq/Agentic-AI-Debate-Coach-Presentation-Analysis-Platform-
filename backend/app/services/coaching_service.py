"""
Recommendation & Coaching Engine (Module 10), Milestone 3 Part 7: replaces
static coaching text with dynamic AI recommendations derived from a
debater's *actual* analyzed turns/fallacy history/presentation metrics for
a given session. Every observation must be traceable to a real input
signal — the prompt is deliberately fed the concrete evidence rather than
asked to invent generic advice. Falls back through the LLM provider chain
and finally to a deterministic generator that still reads the real
evidence dict, so this can never 500 or return empty/generic filler.
"""
import logging

from app.schemas.debate_simulation import CoachingFeedback
from app.services.llm_provider import get_structured_result, AllProvidersUnavailableError

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert, encouraging-but-honest debate and communication coach.
You will be given real evidence about one debate session: the debater's
turns, any fallacies detected in them, argument analysis scores, and (if
available) speech/presentation metrics like pace and filler words.

Produce coaching feedback GROUNDED ONLY in this evidence:
- observations: specific, evidence-based statements about patterns you can
  actually see in the data (e.g. "You interrupt your argument before
  completing evidence" if evidence_strength_score is consistently low, or
  "Your rebuttal timing is slow" if turns show long gaps/hedging). Do not
  invent patterns not supported by the evidence provided.
- strengths: genuine strengths visible in the evidence
- priority_focus: the single highest-impact thing to work on next, one sentence
- tone: one word describing the feedback's tone (e.g. "constructive")

Never output generic filler advice unconnected to the evidence given."""


def _deterministic_feedback(evidence: dict) -> CoachingFeedback:
    """Fallback used only if every LLM provider is unavailable. Still reads
    the real evidence dict (argument scores, fallacies, presentation metrics)
    rather than returning generic filler."""
    observations: list[str] = []
    strengths: list[str] = []

    scores = evidence.get("argument_scores") or evidence.get("scores") or {}
    evidence_strength = scores.get("evidence_strength_score")
    logical_consistency = scores.get("logical_consistency_score")
    clarity = scores.get("clarity_score")

    if evidence_strength is not None:
        if evidence_strength < 5:
            observations.append(
                f"Your evidence strength score averaged {evidence_strength}/10 — claims need more concrete backing."
            )
        else:
            strengths.append(f"Evidence strength averaged a solid {evidence_strength}/10 across your turns.")

    if logical_consistency is not None:
        if logical_consistency < 5:
            observations.append(
                f"Logical consistency averaged {logical_consistency}/10 — watch for gaps between evidence and conclusions."
            )
        else:
            strengths.append(f"Logical consistency averaged {logical_consistency}/10 — your reasoning stayed coherent.")

    if clarity is not None and clarity >= 6.5:
        strengths.append(f"Clarity averaged {clarity}/10 — your points came across clearly.")

    fallacy_types = evidence.get("fallacy_types") or evidence.get("recent_fallacy_types") or []
    if fallacy_types:
        observations.append(f"'{fallacy_types[0]}' was flagged in this session — worth reviewing.")

    presentation = evidence.get("presentation") or {}
    if presentation.get("filler_word_count", 0) and presentation.get("word_count"):
        ratio = presentation["filler_word_count"] / max(presentation["word_count"], 1)
        if ratio > 0.03:
            observations.append("Filler word usage was on the higher side — practice pausing instead of filling silence.")

    if not observations:
        observations.append("No specific weak patterns stood out strongly in this session's evidence.")
    if not strengths:
        strengths.append("You completed the session, which is valuable practice regardless of score.")

    priority_focus = (
        "Focus on adding stronger, more specific evidence to your claims."
        if evidence_strength is not None and evidence_strength < 5
        else "Focus on tightening the logical link between your evidence and conclusions."
        if logical_consistency is not None and logical_consistency < 5
        else "Keep reinforcing your current strengths while adding variety to your evidence sources."
    )

    return CoachingFeedback(
        observations=observations,
        strengths=strengths,
        priority_focus=priority_focus,
        tone="constructive",
    )


async def generate_coaching_feedback(evidence: dict) -> CoachingFeedback:
    try:
        return await get_structured_result(
            system_prompt=SYSTEM_PROMPT,
            human_prompt="Session evidence (JSON):\n{evidence}",
            variables={"evidence": evidence},
            output_schema=CoachingFeedback,
            temperature=0.3,
        )
    except AllProvidersUnavailableError:
        logger.warning("generate_coaching_feedback: all LLM providers unavailable, using deterministic fallback")
        return _deterministic_feedback(evidence)
    except Exception:
        logger.exception("generate_coaching_feedback: unexpected error, using deterministic fallback")
        return _deterministic_feedback(evidence)
