"""
Milestone 4 — Coach Review System.

Every completed learner debate is automatically pushed into this queue by
routers/debate_live.py::finish_debate — coaches never see fake demo entries,
only real completed sessions with their real AI-generated score.
"""
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.database import (
    debate_sessions_collection,
    session_transcripts_collection,
    debate_feedback_reports_collection,
    fallacy_reports_collection,
    presentation_analysis_collection,
    performance_scores_collection,
    coach_assignments_collection,
)
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserRole
from app.schemas.coach_review import CoachReviewOut, CoachReviewSubmit, CoachAssignmentCreate, CoachAssignmentOut
from app.services import coach_review_service, skill_gap_service
from app.routers.coaching_plans import generate_and_store_plan
from app.routers.notifications import create_notification

router = APIRouter(prefix="/api/v1/coach", tags=["Coach Review System"])


async def _my_learner_ids(coach_id: str) -> list[str]:
    return [a["learner_id"] async for a in coach_assignments_collection.find({"coach_id": coach_id})]


@router.get("/review-queue", response_model=list[CoachReviewOut])
async def get_review_queue(
    status: str | None = Query(default=None),
    unassigned_only: bool = Query(default=False),
    current_user: dict = Depends(require_roles(UserRole.debate_coach)),
):
    return await coach_review_service.list_queue(coach_id=current_user["id"], status=status, unassigned_only=unassigned_only)


@router.get("/review/{review_id}")
async def get_review_detail(review_id: str, current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    """Full detail for one review: coach summary + real transcript + real AI report."""
    review = await coach_review_service.get_review(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    transcript = await session_transcripts_collection.find_one({"session_id": review["session_id"]})
    report = await debate_feedback_reports_collection.find_one({"session_id": review["session_id"]})
    fallacies = [
        doc async for doc in fallacy_reports_collection.find(
            {"session_id": review["session_id"], "report.fallacy_detected": True}
        )
    ]

    return {
        "review": review,
        "transcript": transcript.get("turns", []) if transcript else [],
        "ai_report": report.get("report") if report else None,
        "fallacies_detected": [f["report"] for f in fallacies],
    }


@router.post("/review/{review_id}/claim", response_model=CoachReviewOut)
async def claim_review(review_id: str, current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    review = await coach_review_service.claim_review(review_id, current_user["id"])
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.post("/review/{review_id}/submit", response_model=CoachReviewOut)
async def submit_review(
    review_id: str, payload: CoachReviewSubmit, current_user: dict = Depends(require_roles(UserRole.debate_coach))
):
    existing = await coach_review_service.get_review(review_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Review not found")

    review = await coach_review_service.submit_review(review_id, current_user["id"], payload.model_dump())

    await create_notification(
        user_id=review["learner_id"],
        type_="coach_feedback",
        title="Your coach reviewed your debate",
        message=f'Your coach left feedback on "{review["topic"]}".',
        related_session_id=review["session_id"],
    )

    # Regenerate the learner's coaching plan so it reflects the coach's real
    # notes/recommended exercises, not just the original AI evidence.
    try:
        await generate_and_store_plan(review["learner_id"], review["session_id"])
    except Exception:
        # Never let a coaching-plan regeneration failure block the review
        # submission itself — the review is the source of truth either way.
        pass

    return review


@router.get("/assigned-learners", response_model=list[CoachAssignmentOut])
async def get_assigned_learners(current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    return await coach_review_service.assigned_learners(current_user["id"])


@router.post("/assigned-learners", response_model=CoachAssignmentOut)
async def add_assigned_learner(
    payload: CoachAssignmentCreate, current_user: dict = Depends(require_roles(UserRole.debate_coach))
):
    await coach_review_service.assign_learner(current_user["id"], payload.learner_id)
    learners = await coach_review_service.assigned_learners(current_user["id"])
    match = next((l for l in learners if l["learner_id"] == payload.learner_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Learner not found")
    return match


# =========================================================================
# Assigned Debates & Debate Sessions — real session records for my roster,
# distinct from the review queue: this is the raw debate history, not the
# coach-review workflow state.
# =========================================================================
@router.get("/assigned-debates")
async def assigned_debates(current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    learner_ids = await _my_learner_ids(current_user["id"])
    if not learner_ids:
        return []
    cursor = debate_sessions_collection.find({"owner_id": {"$in": learner_ids}}).sort("created_at", -1).limit(100)
    out = []
    async for s in cursor:
        out.append(
            {
                "id": str(s["_id"]),
                "learner_id": s.get("owner_id"),
                "topic": s.get("topic"),
                "debate_format": s.get("debate_format"),
                "status": s.get("status"),
                "created_at": s.get("created_at"),
            }
        )
    return out


# =========================================================================
# Fallacy Reports — real fallacy detections across my roster.
# =========================================================================
@router.get("/fallacy-reports")
async def coach_fallacy_reports(current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    learner_ids = await _my_learner_ids(current_user["id"])
    if not learner_ids:
        return []
    cursor = fallacy_reports_collection.find(
        {"user_id": {"$in": learner_ids}, "report.fallacy_detected": True}
    ).sort("created_at", -1).limit(100)
    out = []
    async for f in cursor:
        out.append({"id": str(f["_id"]), "user_id": f["user_id"], "created_at": f.get("created_at"), **f["report"]})
    return out


# =========================================================================
# Presentation Reviews — real presentation analyses across my roster.
# =========================================================================
@router.get("/presentation-reviews")
async def coach_presentation_reviews(current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    learner_ids = await _my_learner_ids(current_user["id"])
    if not learner_ids:
        return []
    cursor = presentation_analysis_collection.find({"user_id": {"$in": learner_ids}}).sort("created_at", -1).limit(100)
    out = []
    async for p in cursor:
        out.append(
            {
                "id": str(p["_id"]),
                "user_id": p["user_id"],
                "topic": p.get("topic"),
                "audio_filename": p.get("audio_filename"),
                "created_at": p.get("created_at"),
                "speech_metrics": p.get("speech_metrics"),
                "presentation_score": p.get("presentation_score"),
            }
        )
    return out


# =========================================================================
# Coaching Plans — reviews I've already coached that included concrete
# recommendations (exercises / learning-plan notes) — the real "plan" I
# gave that learner, not a separate fabricated planning tool.
# =========================================================================
@router.get("/coaching-plans")
async def coaching_plans(current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    cursor = coach_review_service.coach_reviews_collection.find(
        {
            "coach_id": current_user["id"],
            "$or": [
                {"recommended_exercises": {"$exists": True, "$ne": []}},
                {"recommended_learning_plan_notes": {"$ne": None}},
            ],
        }
    ).sort("updated_at", -1)
    return [await coach_review_service._serialize(doc) async for doc in cursor]


# =========================================================================
# Performance Analytics — real trend across my roster (avg score per week).
# =========================================================================
@router.get("/performance-analytics")
async def coach_performance_analytics(current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    learner_ids = await _my_learner_ids(current_user["id"])
    if not learner_ids:
        return {"average_score": None, "trend": [], "per_learner": []}

    scores = [s async for s in performance_scores_collection.find({"user_id": {"$in": learner_ids}}).sort("created_at", 1)]
    average_score = round(sum(s["score"] for s in scores) / len(scores), 2) if scores else None

    trend: dict[str, list[float]] = {}
    for s in scores:
        day = (s.get("created_at") or "")[:10]
        trend.setdefault(day, []).append(s["score"])
    trend_points = [{"date": day, "average": round(sum(v) / len(v), 2)} for day, v in sorted(trend.items())][-10:]

    per_learner = []
    for lid in learner_ids:
        learner_scores = [s["score"] for s in scores if s["user_id"] == lid]
        if learner_scores:
            per_learner.append({"learner_id": lid, "average_score": round(sum(learner_scores) / len(learner_scores), 2), "session_count": len(learner_scores)})

    return {"average_score": average_score, "trend": trend_points, "per_learner": per_learner}


# =========================================================================
# Skill Gap Analysis — real average of the 5 named sub-scores across my
# roster's debate feedback reports (argument_quality, evidence_usage,
# logical_consistency, rebuttal_effectiveness, communication_skills).
# =========================================================================
@router.get("/skill-gap")
async def coach_skill_gap(
    learner_id: str | None = None,
    department: str | None = None,
    current_user: dict = Depends(require_roles(UserRole.debate_coach)),
):
    roster_ids = await _my_learner_ids(current_user["id"])
    target_ids = await skill_gap_service.resolve_learner_ids(roster_ids, learner_id, department)
    return await skill_gap_service.compute_skill_gap(target_ids)


# =========================================================================
# Reports — real debate feedback reports across my roster.
# =========================================================================
@router.get("/reports")
async def coach_reports(current_user: dict = Depends(require_roles(UserRole.debate_coach))):
    learner_ids = await _my_learner_ids(current_user["id"])
    if not learner_ids:
        return []
    cursor = debate_feedback_reports_collection.find({"user_id": {"$in": learner_ids}}).sort("created_at", -1).limit(100)
    out = []
    async for r in cursor:
        report = r.get("report", {})
        out.append(
            {
                "id": str(r["_id"]),
                "session_id": r["session_id"],
                "user_id": r["user_id"],
                "overall_rating": report.get("overall_rating"),
                "final_summary": report.get("final_summary"),
                "created_at": r.get("created_at"),
            }
        )
    return out
