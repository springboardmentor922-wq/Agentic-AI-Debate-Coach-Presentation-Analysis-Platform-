from sqlalchemy import func
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.db.mongodb import fallacy_analysis_collection
from app.models.debate_session import DebateSession
from app.models.debate_turn_score import DebateTurnScore
from app.models.recommendation_history import RecommendationHistory
from app.models.user_profile import UserProfile
from app.schemas.recommendation import RecommendationResult, SkillGapAnalysis

SKILL_LABELS = {
    "clarity": "Communication Skills",
    "evidence_strength": "Evidence Usage",
    "rebuttal_quality": "Rebuttal Skills",
    "logical_consistency": "Logical Consistency",
    "argument_quality_score": "Argument Structure",
}


def _compute_skill_gap(db: Session, user_id: int) -> tuple[SkillGapAnalysis, dict[str, float]]:
    """Deterministic — no LLM call. Averages this user's scores across ALL their sessions."""
    session_ids = [s.id for s in db.query(DebateSession.id).filter(DebateSession.user_id == user_id).all()]
    if not session_ids:
        return SkillGapAnalysis(improvement_trend="insufficient_data"), {}

    avg_row = db.query(
        func.avg(DebateTurnScore.clarity),
        func.avg(DebateTurnScore.evidence_strength),
        func.avg(DebateTurnScore.rebuttal_quality),
        func.avg(DebateTurnScore.logical_consistency),
        func.avg(DebateTurnScore.argument_quality_score),
    ).filter(DebateTurnScore.session_id.in_(session_ids)).first()

    if not avg_row or avg_row[0] is None:
        return SkillGapAnalysis(improvement_trend="insufficient_data"), {}

    scores = dict(zip(SKILL_LABELS.keys(), avg_row))
    scores = {k: v for k, v in scores.items() if v is not None}
    if not scores:
        return SkillGapAnalysis(improvement_trend="insufficient_data"), {}

    sorted_skills = sorted(scores.items(), key=lambda kv: kv[1])
    weakest = [SKILL_LABELS[k] for k, _ in sorted_skills[:2]]
    strongest = [SKILL_LABELS[k] for k, _ in sorted_skills[-2:]]

    # Trend: compare first-half vs second-half session average, only if enough history exists.
    trend = "insufficient_data"
    if len(session_ids) >= 4:
        midpoint = len(session_ids) // 2
        earlier_avg = db.query(func.avg(DebateTurnScore.debate_performance_score)).filter(
            DebateTurnScore.session_id.in_(session_ids[:midpoint])
        ).scalar()
        later_avg = db.query(func.avg(DebateTurnScore.debate_performance_score)).filter(
            DebateTurnScore.session_id.in_(session_ids[midpoint:])
        ).scalar()
        if earlier_avg is not None and later_avg is not None:
            trend = "improving" if later_avg > earlier_avg else "declining" if later_avg < earlier_avg else "stable"

    return (
        SkillGapAnalysis(strongest_skills=strongest, weakest_skills=weakest, improvement_trend=trend),
        scores,
    )


async def _get_recurring_fallacies(user_id: int) -> list[str]:
    """Reuses existing fallacy_analysis_collection — no new fallacy detection call."""
    cursor = fallacy_analysis_collection.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$result.fallacy_type", "count": {"$sum": 1}}},
        {"$match": {"_id": {"$ne": None}}},
        {"$sort": {"count": -1}},
        {"$limit": 3},
    ])
    return [doc["_id"] async for doc in cursor if doc["_id"]]


def _get_llm() -> ChatGroq:
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set.")
    return ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, temperature=0.3)


SYSTEM_PROMPT = """You are an experienced debate coach writing a personalized coaching plan for a \
learner, based on their computed skill data — not raw transcripts. You will be given their strongest \
and weakest skills, average scores, recurring fallacies, experience level, preferred topics, and \
improvement trend.

Generate:
- personalized_feedback: one entry per weak/notable skill area, each with current_performance,
  why_improvement_needed, practical_advice, and expected_benefit — specific to the data given, never generic.
- learning_path: a 4-week roadmap, each week with one goal and 2-3 concrete activities, building
  from the weakest skills toward full simulations.
- practice_recommendations: concrete practice activities tied to the specific weak skills identified.
- recommended_topics: 3-5 debate topics, informed by preferred topics and experience level, ordered
  by increasing difficulty.
- coaching_summary: strengths, weaknesses, priority_focus (top 2 areas), and next_steps.

Rules:
- Never invent scores or history not given to you.
- Be specific to the data provided — do not give generic "practice more" advice.
- If the learner is new (insufficient_data trend, no prior scores), generate beginner-friendly,
  encouraging recommendations rather than pointing out weaknesses that can't be measured yet.
"""

_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        ("human", "Learner data:\n{learner_summary}"),
    ]
)


async def generate_recommendations(db: Session, user_id: int, session_id: int | None = None) -> RecommendationResult:
    """Gathers existing analysis data (Postgres score averages, Mongo fallacy history, user
    profile) and generates one structured coaching plan via a single LLM call. No scores are
    recalculated — all inputs are already-computed outputs from other services."""

    skill_gap, raw_scores = _compute_skill_gap(db, user_id)
    skill_gap.recurring_fallacies = await _get_recurring_fallacies(user_id)

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    experience_level = profile.experience_level.value if profile else "beginner"
    preferred_topics = profile.preferred_topics if profile and profile.preferred_topics else []
    preferred_topic_titles = [t.title for t in preferred_topics] if preferred_topics else []

    # Avoid repeating the same priority focus as last time, per your "avoid repeated recommendations" requirement.
    last_recommendation = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.user_id == user_id)
        .order_by(RecommendationHistory.created_at.desc())
        .first()
    )
    previous_focus = last_recommendation.priority_focus_summary if last_recommendation else "none yet"

    learner_summary = (
        f"Experience level: {experience_level}\n"
        f"Strongest skills: {', '.join(skill_gap.strongest_skills) or 'not enough data yet'}\n"
        f"Weakest skills: {', '.join(skill_gap.weakest_skills) or 'not enough data yet'}\n"
        f"Average scores: {raw_scores or 'none yet'}\n"
        f"Recurring fallacies: {', '.join(skill_gap.recurring_fallacies) or 'none detected'}\n"
        f"Improvement trend: {skill_gap.improvement_trend}\n"
        f"Preferred topics: {', '.join(preferred_topic_titles) or 'none set'}\n"
        f"Previous coaching priority (avoid repeating verbatim): {previous_focus}\n"
    )

    llm = _get_llm()
    structured_llm = llm.with_structured_output(RecommendationResult)
    chain = _prompt | structured_llm
    result: RecommendationResult = chain.invoke({"learner_summary": learner_summary})
    result.skill_gap_analysis = skill_gap  # ensure the deterministic data wins over any LLM drift

    # Persist — Postgres: lightweight history record; MongoDB: full report.
    history_record = RecommendationHistory(
        user_id=user_id,
        session_id=session_id,
        priority_focus_summary=",".join(result.coaching_summary.priority_focus)[:500],
    )
    db.add(history_record)
    db.commit()

    return result