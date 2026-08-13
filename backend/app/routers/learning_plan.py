"""
Personalized Learning Plan endpoints (Milestone 3, Part 8), plus dynamic
coaching feedback (Part 7). Generated fresh after every debate from the
learner's real recorded evidence and stored in MongoDB with progress
tracking.
"""
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import (
    learning_plans_collection,
    coach_feedback_collection,
    debate_feedback_reports_collection,
    fallacy_reports_collection,
    argument_analysis_collection,
    presentation_analysis_collection,
    debate_sessions_collection,
)
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserRole
from app.schemas.debate_simulation import (
    LearningPlanOut,
    LearningPlanProgressUpdate,
    CoachFeedbackOut,
)
from app.services.learning_plan_service import generate_learning_plan
from app.services.coaching_service import generate_coaching_feedback
from app.routers.notifications import create_notification

router = APIRouter(prefix="/api/v1", tags=["Learning Plan & Coaching (Milestone 3)"])


async def _gather_evidence(user_id: str, session_id: str | None) -> dict:
    """Pulls the real, persisted evidence a learner has generated so far — used
    by both the coaching engine and the learning-plan generator so neither
    ever has to invent facts about the learner."""
    reports = [doc async for doc in debate_feedback_reports_collection.find({"user_id": user_id}).sort("updated_at", -1).limit(5)]
    fallacies = [doc async for doc in fallacy_reports_collection.find({"user_id": user_id, "report.fallacy_detected": True}).sort("created_at", -1).limit(20)]
    presentations = [doc async for doc in presentation_analysis_collection.find({"user_id": user_id}).sort("created_at", -1).limit(3)]

    session_turns = None
    if session_id:
        session_turns = [doc async for doc in argument_analysis_collection.find({"user_id": user_id, "session_id": session_id})]

    return {
        "recent_feedback_reports": [r["report"] for r in reports],
        "recent_fallacies": [{"type": f["report"].get("fallacy_type"), "severity": f["report"].get("severity")} for f in fallacies],
        "recent_presentation_scores": [
            {"speech_metrics": p["speech_metrics"], "presentation_score": p["presentation_score"]} for p in presentations
        ],
        "current_session_turns": [t["analysis"] for t in session_turns] if session_turns else None,
    }


# --------------------------------------------------------------------------
# Part 7 — Coaching Engine
# --------------------------------------------------------------------------

@router.post("/coaching/generate", response_model=CoachFeedbackOut)
async def generate_coaching(session_id: str | None = None, current_user: dict = Depends(require_roles(UserRole.learner))):
    evidence = await _gather_evidence(current_user["id"], session_id)
    feedback = await generate_coaching_feedback(evidence)

    now = datetime.now(timezone.utc).isoformat()
    doc = {"session_id": session_id, "user_id": current_user["id"], "feedback": feedback.model_dump(), "created_at": now}
    result = await coach_feedback_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return CoachFeedbackOut(**doc)


@router.get("/coaching/latest", response_model=CoachFeedbackOut | None)
async def latest_coaching(current_user: dict = Depends(get_current_user)):
    doc = await coach_feedback_collection.find_one({"user_id": current_user["id"]}, sort=[("created_at", -1)])
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    return CoachFeedbackOut(**doc)


# --------------------------------------------------------------------------
# Part 8 — Personalized Learning Plan
# --------------------------------------------------------------------------

@router.post("/learning-plan/generate", response_model=LearningPlanOut)
async def generate_plan(session_id: str | None = None, current_user: dict = Depends(require_roles(UserRole.learner))):
    evidence = await _gather_evidence(current_user["id"], session_id)
    plan = await generate_learning_plan(evidence)

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "user_id": current_user["id"],
        "based_on_session_id": session_id,
        "plan": plan.model_dump(),
        "progress": {},
        "created_at": now,
        "updated_at": now,
    }
    result = await learning_plans_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)

    await create_notification(
        user_id=current_user["id"], type_="learning_milestone",
        title="New learning plan ready",
        message="Your personalized 4-week learning plan has been generated.",
        related_session_id=session_id,
    )
    return LearningPlanOut(**doc)


@router.get("/learning-plan", response_model=LearningPlanOut | None)
async def get_latest_plan(current_user: dict = Depends(get_current_user)):
    doc = await learning_plans_collection.find_one({"user_id": current_user["id"]}, sort=[("created_at", -1)])
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    return LearningPlanOut(**doc)


@router.patch("/learning-plan/{plan_id}/progress", response_model=LearningPlanOut)
async def update_progress(plan_id: str, payload: LearningPlanProgressUpdate, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(plan_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid plan id")

    doc = await learning_plans_collection.find_one({"_id": oid})
    if not doc or doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Learning plan not found")

    now = datetime.now(timezone.utc).isoformat()
    await learning_plans_collection.update_one(
        {"_id": oid},
        {"$set": {f"progress.{payload.task_key}": payload.completed, "updated_at": now}},
    )
    doc = await learning_plans_collection.find_one({"_id": oid})
    doc["id"] = str(doc["_id"])
    return LearningPlanOut(**doc)
