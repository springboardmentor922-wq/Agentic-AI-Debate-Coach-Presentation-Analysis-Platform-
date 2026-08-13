"""
Coach Review System (Milestone 4).

`create_review_entry` is called once, automatically, from
routers/debate_live.py::finish_debate — the instant a learner's debate is
AI-analyzed, it also becomes visible in every Debate Coach's review queue.
Nothing here waits for a coach to manually pull data in; it is push-created
against real debate data.
"""
from datetime import datetime, timezone

from app.core.database import (
    coach_reviews_collection,
    coach_assignments_collection,
    debate_sessions_collection,
    performance_scores_collection,
    users_collection,
)


async def create_review_entry(session_id: str, learner_id: str, topic: str, debate_format: str, ai_overall_score: float | None):
    """Idempotent: a session can only ever have one review-queue entry."""
    existing = await coach_reviews_collection.find_one({"session_id": session_id})
    if existing:
        return existing

    # If this learner has an assigned coach, pre-route the review to them;
    # otherwise it lands unassigned and any coach can pick it up.
    assignment = await coach_assignments_collection.find_one({"learner_id": learner_id})
    coach_id = assignment["coach_id"] if assignment else None

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "session_id": session_id,
        "learner_id": learner_id,
        "coach_id": coach_id,
        "topic": topic,
        "debate_format": debate_format,
        "ai_overall_score": ai_overall_score,
        "status": "pending",
        "coach_comments": None,
        "coach_score": None,
        "additional_suggestions": [],
        "recommended_exercises": [],
        "recommended_learning_plan_notes": None,
        "approve_ai_feedback": None,
        "educator_id": None,
        "educator_score": None,
        "educator_comments": None,
        "educator_approved_at": None,
        "created_at": now,
        "updated_at": now,
        "reviewed_at": None,
    }
    result = await coach_reviews_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def _serialize(doc: dict) -> dict:
    learner = await users_collection.find_one({"_id": _oid(doc["learner_id"])}) if doc.get("learner_id") else None
    return {
        "id": str(doc["_id"]),
        "session_id": doc["session_id"],
        "learner_id": doc["learner_id"],
        "learner_name": learner["full_name"] if learner else "Unknown learner",
        "coach_id": doc.get("coach_id"),
        "topic": doc["topic"],
        "debate_format": doc["debate_format"],
        "ai_overall_score": doc.get("ai_overall_score"),
        "status": doc.get("status", "pending"),
        "coach_comments": doc.get("coach_comments"),
        "coach_score": doc.get("coach_score"),
        "additional_suggestions": doc.get("additional_suggestions", []),
        "recommended_exercises": doc.get("recommended_exercises", []),
        "recommended_learning_plan_notes": doc.get("recommended_learning_plan_notes"),
        "approve_ai_feedback": doc.get("approve_ai_feedback"),
        "educator_id": doc.get("educator_id"),
        "educator_score": doc.get("educator_score"),
        "educator_comments": doc.get("educator_comments"),
        "educator_approved_at": doc.get("educator_approved_at"),
        "created_at": doc["created_at"],
        "updated_at": doc.get("updated_at"),
        "reviewed_at": doc.get("reviewed_at"),
    }


def _oid(value: str):
    from bson import ObjectId
    return ObjectId(value)


async def list_queue(coach_id: str | None = None, status: str | None = None, unassigned_only: bool = False) -> list[dict]:
    query: dict = {}
    if status:
        query["status"] = status
    if unassigned_only:
        query["coach_id"] = None
    elif coach_id:
        query["$or"] = [{"coach_id": coach_id}, {"coach_id": None}]

    cursor = coach_reviews_collection.find(query).sort("created_at", -1)
    return [await _serialize(doc) async for doc in cursor]


async def get_review(review_id: str) -> dict | None:
    doc = await coach_reviews_collection.find_one({"_id": _oid(review_id)})
    return await _serialize(doc) if doc else None


async def claim_review(review_id: str, coach_id: str) -> dict | None:
    now = datetime.now(timezone.utc).isoformat()
    await coach_reviews_collection.update_one(
        {"_id": _oid(review_id)},
        {"$set": {"coach_id": coach_id, "status": "in_review", "updated_at": now}},
    )
    return await get_review(review_id)


async def submit_review(review_id: str, coach_id: str, payload: dict) -> dict | None:
    now = datetime.now(timezone.utc).isoformat()
    update = {
        "coach_id": coach_id,
        "status": payload["mark_status"],
        "updated_at": now,
        "reviewed_at": now,
    }
    for field in (
        "coach_comments", "coach_score", "additional_suggestions",
        "recommended_exercises", "recommended_learning_plan_notes", "approve_ai_feedback",
    ):
        if field in payload:
            update[field] = payload[field]

    await coach_reviews_collection.update_one({"_id": _oid(review_id)}, {"$set": update})
    return await get_review(review_id)


async def assigned_learners(coach_id: str) -> list[dict]:
    cursor = coach_assignments_collection.find({"coach_id": coach_id}).sort("assigned_at", -1)
    out = []
    async for a in cursor:
        learner = await users_collection.find_one({"_id": _oid(a["learner_id"])})
        if not learner:
            continue
        sessions = [
            doc async for doc in debate_sessions_collection.find(
                {"owner_id": a["learner_id"], "status": "completed"}
            )
        ]
        perf = [doc async for doc in performance_scores_collection.find({"user_id": a["learner_id"]})]
        avg_score = round(sum(p["score"] for p in perf) / len(perf), 2) if perf else None
        last_activity = max((s.get("updated_at") for s in sessions), default=None)
        out.append({
            "id": str(a["_id"]),
            "coach_id": coach_id,
            "learner_id": a["learner_id"],
            "learner_name": learner["full_name"],
            "learner_email": learner["email"],
            "assigned_at": a["assigned_at"],
            "sessions_completed": len(sessions),
            "average_score": avg_score,
            "last_activity_at": last_activity,
        })
    return out


async def assign_learner(coach_id: str, learner_id: str) -> dict:
    existing = await coach_assignments_collection.find_one({"coach_id": coach_id, "learner_id": learner_id})
    if existing:
        return existing
    doc = {"coach_id": coach_id, "learner_id": learner_id, "assigned_at": datetime.now(timezone.utc).isoformat()}
    result = await coach_assignments_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


# --------------------------------------------------------------------------
# Educator final review, grading, and approval — the last stage of the
# AI -> Coach -> Educator -> Learner pipeline. Only a review a coach has
# already marked 'reviewed' is eligible; a coach score is required context
# before an educator can grade, exactly per the workflow spec.
# --------------------------------------------------------------------------

async def list_educator_queue(status: str | None = None) -> list[dict]:
    """Default (no status filter) returns everything a coach has finished
    reviewing but no educator has graded yet — the educator's pending queue.
    Pass status='educator_approved' to list already-finalized reports."""
    query: dict = {"status": "educator_approved"} if status == "educator_approved" else {"status": "reviewed"}
    cursor = coach_reviews_collection.find(query).sort("reviewed_at", -1)
    return [await _serialize(doc) async for doc in cursor]


async def submit_educator_review(review_id: str, educator_id: str, payload: dict) -> dict | None:
    now = datetime.now(timezone.utc).isoformat()
    update = {
        "educator_id": educator_id,
        "educator_score": payload["educator_score"],
        "educator_comments": payload.get("educator_comments"),
        "status": "educator_approved",
        "educator_approved_at": now,
        "updated_at": now,
    }
    await coach_reviews_collection.update_one({"_id": _oid(review_id)}, {"$set": update})
    return await get_review(review_id)
