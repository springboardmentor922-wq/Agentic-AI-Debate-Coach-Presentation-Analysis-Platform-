from app.schemas.performance_score import CategoryScore, PerformanceScoreResult, PerformanceSummary
from app.schemas.scoring import ArgumentScore
from app.schemas.analysis import FallacyDetectionResult
from app.schemas.argument_analysis import ArgumentAnalysisResult
from app.services.counterargument_generation import CounterargumentResult
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings

WEIGHTS = {
    "argument_quality": 0.30,
    "evidence_usage": 0.20,
    "logical_consistency": 0.20,
    "rebuttal_effectiveness": 0.15,
    "communication_skills": 0.15,
}


def compute_turn_performance_score(
    fallacy_result: FallacyDetectionResult,
    score_result: ArgumentScore,
    argument_analysis: ArgumentAnalysisResult | None,
    counterargument_result: CounterargumentResult | None,
    presentation_metrics: dict | None = None,
) -> PerformanceScoreResult:
    """Pure aggregation — no LLM call. Reuses scores already produced by
    argument_scoring, fallacy_detection, argument_analysis, and counterargument_generation
    for this single turn."""

    # Argument Quality: prefer the LLM's own strength assessment; fall back to clarity if unavailable.
    if argument_analysis and argument_analysis.argument_strength:
        argument_quality = CategoryScore(
            score=argument_analysis.argument_strength.score,
            feedback=argument_analysis.argument_strength.reason,
        )
    else:
        argument_quality = CategoryScore(score=score_result.clarity, feedback="Estimated from clarity score.", missing=True)

    # Evidence Usage: evidence_strength from the existing ArgumentScore rubric.
    evidence_usage = CategoryScore(score=score_result.evidence_strength, feedback="Based on evidence strength scoring.")

    # Logical Consistency: existing logical_consistency score, penalized if a fallacy was detected this turn.
    logic_score = score_result.logical_consistency
    if fallacy_result.fallacy_detected:
        logic_score = max(0, logic_score - 2)

    # Feedback text: use the first detected fallacy's explanation if any were found, otherwise
    # fall back to the general reasoning-quality feedback — matches the current
    # FallacyDetectionResult shape (fallacies: list[FallacyItem], not a single flat fallacy).
    if fallacy_result.fallacies:
        logic_feedback = fallacy_result.fallacies[0].explanation
    else:
        logic_feedback = fallacy_result.reasoning_analysis.feedback

    logical_consistency = CategoryScore(score=logic_score, feedback=logic_feedback)

    # Rebuttal Effectiveness: existing rebuttal_quality score.
    rebuttal_effectiveness = CategoryScore(score=score_result.rebuttal_quality, feedback="Based on rebuttal quality scoring.")

    # Communication Skills: clarity score, blended with speech metrics when available (audio turns).
    comm_score = score_result.clarity
    comm_feedback = "Based on textual clarity."
    if presentation_metrics:
        comm_score = (comm_score + presentation_metrics.get("confidence_score", comm_score) / 10) / 2
        comm_feedback = "Based on textual clarity and delivery metrics (pace, filler words)."
    communication_skills = CategoryScore(score=comm_score, feedback=comm_feedback)

    debate_performance_score = round(
        (
            argument_quality.score * WEIGHTS["argument_quality"]
            + evidence_usage.score * WEIGHTS["evidence_usage"]
            + logical_consistency.score * WEIGHTS["logical_consistency"]
            + rebuttal_effectiveness.score * WEIGHTS["rebuttal_effectiveness"]
            + communication_skills.score * WEIGHTS["communication_skills"]
        )
        * 10,  # normalize 0-10 weighted avg to 0-100
        1,
    )

    # Critical Thinking: argument quality + logic + rebuttal + counterargument depth + evidence, evenly weighted.
    counter_quality = 7.0  # neutral default if counterargument generation failed this turn
    if counterargument_result:
        counter_quality = min(10, len(counterargument_result.challenge_questions) * 2)
    critical_thinking_score = round(
        (
            argument_quality.score + logical_consistency.score + rebuttal_effectiveness.score
            + counter_quality + evidence_usage.score
        )
        / 5
        * 10,
        1,
    )

    return PerformanceScoreResult(
        argument_quality=argument_quality,
        evidence_usage=evidence_usage,
        logical_consistency=logical_consistency,
        rebuttal_effectiveness=rebuttal_effectiveness,
        communication_skills=communication_skills,
        debate_performance_score=debate_performance_score,
        critical_thinking_score=critical_thinking_score,
    )


_SUMMARY_SYSTEM_PROMPT = """You are a debate coach writing a concise end-of-session performance \
summary based on the numeric scores provided — not on raw transcript text. Given category scores \
and feedback notes, write:
- strengths: 2-3 short bullet points on what the debater did well
- improvements: 2-3 short bullet points on weak areas
- recommendations: 2-3 concise, actionable coaching suggestions

Be specific to the scores given, not generic. Never invent details not implied by the scores."""

_summary_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", _SUMMARY_SYSTEM_PROMPT),
        ("human", "Session category scores and feedback:\n{score_breakdown}"),
    ]
)


def generate_performance_summary(score_breakdown_text: str) -> PerformanceSummary:
    """The one LLM call in this feature — fired once per completed session, not per turn."""
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set.")
    llm = ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, temperature=0.3)
    structured_llm = llm.with_structured_output(PerformanceSummary)
    chain = _summary_prompt | structured_llm
    return chain.invoke({"score_breakdown": score_breakdown_text})