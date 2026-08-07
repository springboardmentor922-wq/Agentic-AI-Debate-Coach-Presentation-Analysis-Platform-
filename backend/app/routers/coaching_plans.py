"""
Coaching Plans (Milestone 4). A real, trackable entity distinct from the
Personalized Learning Plan (routers/learning_plan.py) — weekly exercises
with deadlines, measurable objectives, and completion status, generated
from AI analysis evidence combined with any coach/educator review notes.

Visibility follows the platform-wide rule: a learner sees only their own
plans; their assigned Debate Coach, any Educator, and Administrators can
see plans for learners under their purview.
"""
from datetime import datetime, timedelta

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.database import (
    coaching_plans_collection,
    coach_reviews_collection,
    coach_assignments_collection,
    debate_feedback_reports_collection,
    fallacy_reports_collection,
    presentation_analysis_collection,
    users_collection,
)
from app.core.deps import get_current_user, require_roles
from app.schemas.user import UserRole
from app.schemas.debate_simulation import CoachingPlanOut, CoachingPlanProgressUpdate
from app.services.coaching_plan_service import generate_coaching_plan

router = APIRouter(prefix="/api/v1/coaching-plans", tags=["Coaching Plans (Milestone 4)"])


async def _gather_evidence(user_id: str, session_id: str | None) -> dict:
    """Same evidence sources as the Learning Plan generator, plus whatever
    the learner's most recent coach/educator review actually said — so the
    plan can genuinely incorporate human feedback, not just AI output."""
    reports = [
        doc
        async for doc in debate_feedback_reports_collection.find({"user_id": user_id})
        .sort("updated_at", -1)
        .limit(5)
    ]
    fallacies = [
        doc
        async for doc in fallacy_reports_collection.find(
            {"user_id": user_id, "report.fallacy_detected": True}
        )
        .sort("created_at", -1)
        .limit(20)
    ]
    presentations = [
        doc async for doc in presentation_analysis_collection.find({"user_id": user_id}).sort("created_at", -1).limit(3)
    ]

    review_query = {"learner_id": user_id, "status": {"$in": ["reviewed", "educator_approved"]}}
    if session_id:
        review_query["session_id"] = session_id
    latest_review = await coach_reviews_collection.find_one(review_query, sort=[("updated_at", -1)])

    coach_notes = None
    source = "ai_analysis"
    if latest_review:
        coach_notes = {
            "coach_comments": latest_review.get("coach_comments"),
            "recommended_exercises": latest_review.get("recommended_exercises") or [],
            "recommended_learning_plan_notes": latest_review.get("recommended_learning_plan_notes"),
            "educator_comments": latest_review.get("educator_comments"),
        }
        source = "educator_review" if latest_review.get("status") == "educator_approved" else "coach_review"
        if latest_review.get("coach_comments") and latest_review.get("educator_comments"):
            source = "combined"

    return {
        "recent_feedback_reports": [r["report"] for r in reports],
        "recent_fallacies": [
            {"type": f["report"].get("fallacy_type"), "severity": f["report"].get("severity")} for f in fallacies
        ],
        "recent_presentation_scores": [
            {"speech_metrics": p["speech_metrics"], "presentation_score": p["presentation_score"]}
            for p in presentations
        ],
        "coach_notes": coach_notes,
    }, source


def _attach_tracking_state(plan_dict: dict, created_at: str) -> list[dict]:
    """Turns the LLM/deterministic-generated week list into the persisted,
    trackable shape — computing a real deadline per week (created_at +
    week*7 days) and initializing completion to False."""
    base_date = datetime.fromisoformat(created_at)
    weeks_state = []
    for week in plan_dict["weeks"]:
        deadline = (base_date + timedelta(days=7 * week["week"])).isoformat()
        weeks_state.append(
            {
                "week": week["week"],
                "focus": week["focus"],
                "objective": week["objective"],
                "exercises": [
                    {"title": ex["title"], "description": ex.get("description", ""), "deadline": deadline, "completed": False}
                    for ex in week["exercises"]
                ],
            }
        )
    return weeks_state


def _completion_percent(weeks_state: list[dict]) -> float:
    total = sum(len(w["exercises"]) for w in weeks_state)
    if not total:
        return 0.0
    done = sum(1 for w in weeks_state for ex in w["exercises"] if ex["completed"])
    return round(100 * done / total, 1)


async def generate_and_store_plan(user_id: str, session_id: str | None = None) -> dict:
    """Reusable entry point — called directly by the learner via POST
    /generate, and automatically from the coach-review and educator-approve
    endpoints so a plan regenerates whenever new human feedback lands."""
    evidence, source = await _gather_evidence(user_id, session_id)
    plan = await generate_coaching_plan(evidence)

    now = datetime.utcnow().isoformat()
    plan_dict = plan.model_dump()
    weeks_state = _attach_tracking_state(plan_dict, now)

    doc = {
        "user_id": user_id,
        "based_on_session_id": session_id,
        "source": source,
        "weeks": weeks_state,
        "objectives": plan_dict["objectives"],
        "summary": plan_dict["summary"],
        "status": "active",
        "completion_percent": 0.0,
        "created_at": now,
        "updated_at": now,
    }
    result = await coaching_plans_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


@router.post("/generate", response_model=CoachingPlanOut)
async def generate_plan(session_id: str | None = None, current_user: dict = Depends(require_roles(UserRole.learner))):
    doc = await generate_and_store_plan(current_user["id"], session_id)
    return CoachingPlanOut(**doc)


async def _can_view(current_user: dict, learner_id: str) -> bool:
    if current_user["role"] == UserRole.learner:
        return current_user["id"] == learner_id
    if current_user["role"] == UserRole.administrator or current_user["role"] == UserRole.educator:
        return True
    if current_user["role"] == UserRole.debate_coach:
        return await coach_assignments_collection.find_one({"coach_id": current_user["id"], "learner_id": learner_id}) is not None
    return False


@router.get("", response_model=list[CoachingPlanOut])
async def list_plans(
    learner_id: str | None = Query(default=None, description="Required for coach/educator/admin; ignored for learners"),
    current_user: dict = Depends(get_current_user),
):
    target_id = current_user["id"] if current_user["role"] == UserRole.learner else learner_id
    if not target_id:
        raise HTTPException(status_code=400, detail="learner_id is required for this role")
    if not await _can_view(current_user, target_id):
        raise HTTPException(status_code=403, detail="Not authorized to view this learner's coaching plans")

    cursor = coaching_plans_collection.find({"user_id": target_id}).sort("created_at", -1)
    out = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        out.append(CoachingPlanOut(**doc))
    return out


@router.get("/latest", response_model=CoachingPlanOut | None)
async def latest_plan(current_user: dict = Depends(require_roles(UserRole.learner))):
    doc = await coaching_plans_collection.find_one({"user_id": current_user["id"]}, sort=[("created_at", -1)])
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    return CoachingPlanOut(**doc)


@router.patch("/{plan_id}/progress", response_model=CoachingPlanOut)
async def update_progress(plan_id: str, payload: CoachingPlanProgressUpdate, current_user: dict = Depends(require_roles(UserRole.learner))):
    try:
        oid = ObjectId(plan_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid plan id")

    doc = await coaching_plans_collection.find_one({"_id": oid})
    if not doc or doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Coaching plan not found")

    try:
        week_str, idx_str = payload.exercise_key.split(":")
        week_num, idx = int(week_str), int(idx_str)
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="exercise_key must look like '{week}:{exercise_index}'")

    weeks = doc["weeks"]
    matched = False
    for w in weeks:
        if w["week"] == week_num and 0 <= idx < len(w["exercises"]):
            w["exercises"][idx]["completed"] = payload.completed
            matched = True
            break
    if not matched:
        raise HTTPException(status_code=404, detail="Exercise not found in this plan")

    completion = _completion_percent(weeks)
    now = datetime.utcnow().isoformat()
    new_status = "completed" if completion >= 100 else "active"

    await coaching_plans_collection.update_one(
        {"_id": oid},
        {"$set": {"weeks": weeks, "completion_percent": completion, "status": new_status, "updated_at": now}},
    )
    doc = await coaching_plans_collection.find_one({"_id": oid})
    doc["id"] = str(doc["_id"])
    return CoachingPlanOut(**doc)
