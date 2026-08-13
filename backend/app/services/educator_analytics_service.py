"""
Educator Analytics (Milestone 4).

Everything here is computed live (same philosophy as routers/dashboard.py):
"classroom" = every learner sharing the same institution (+ department, if
set) as fields already collected on the user profile. There is no separate
classroom-membership model to invent — grouping uses real profile data.
"""
from collections import defaultdict
from datetime import datetime, timezone

from app.core.database import (
    users_collection,
    debate_sessions_collection,
    performance_scores_collection,
    educator_assignments_collection,
)


async def _learner_summary(user: dict) -> dict:
    user_id = str(user["_id"])
    sessions = [doc async for doc in debate_sessions_collection.find({"owner_id": user_id, "status": "completed"})]
    perf = [doc async for doc in performance_scores_collection.find({"user_id": user_id})]
    avg_score = round(sum(p["score"] for p in perf) / len(perf), 2) if perf else None
    last_activity = max((s.get("updated_at") for s in sessions), default=None)
    return {
        "id": user_id,
        "full_name": user["full_name"],
        "email": user["email"],
        "institution": user.get("institution"),
        "department": user.get("department"),
        "sessions_completed": len(sessions),
        "average_score": avg_score,
        "last_activity_at": last_activity,
        "fallacies_avoided_rate": None,  # left null rather than guessed; no per-learner clean-debate rate stored yet
    }


async def list_all_learners() -> list[dict]:
    cursor = users_collection.find({"role": "learner"})
    return [await _learner_summary(u) async for u in cursor]


async def classroom_analytics() -> list[dict]:
    """Groups every learner by (institution, department) and computes real
    aggregate stats per group. Learners with no institution set are grouped
    under 'Unassigned' rather than silently dropped."""
    learners = await list_all_learners()
    groups: dict[str, list[dict]] = defaultdict(list)
    for l in learners:
        institution = l["institution"] or "Unassigned"
        label = f"{institution} / {l['department']}" if l.get("department") else institution
        groups[label].append(l)

    out = []
    for label, members in groups.items():
        total_sessions = sum(m["sessions_completed"] for m in members)
        scored = [m for m in members if m["average_score"] is not None]
        avg_score = round(sum(m["average_score"] for m in scored) / len(scored), 2) if scored else None
        ranked = sorted(scored, key=lambda m: m["average_score"], reverse=True)
        out.append({
            "classroom": label,
            "learner_count": len(members),
            "total_sessions_completed": total_sessions,
            "average_score": avg_score,
            "average_improvement_pct": None,  # requires longitudinal per-learner trend; not fabricated here
            "top_performers": ranked[:3],
            "needs_attention": [m for m in members if m["sessions_completed"] == 0 or (m["average_score"] is not None and m["average_score"] < 50)][:5],
        })
    return out


async def compare_learners(learner_ids: list[str]) -> list[dict]:
    out = []
    for lid in learner_ids:
        user = await users_collection.find_one({"_id": _oid(lid)})
        if user:
            out.append(await _learner_summary(user))
    return out


def _oid(value: str):
    from bson import ObjectId
    return ObjectId(value)


# --------------------------------------------------------------------------
# Topic assignments
# --------------------------------------------------------------------------

async def assign_topic(educator_id: str, learner_id: str, topic: str, debate_format: str, note: str | None, due_at: str | None) -> dict:
    from datetime import datetime
    doc = {
        "educator_id": educator_id,
        "learner_id": learner_id,
        "topic": topic,
        "debate_format": debate_format,
        "note": note,
        "due_at": due_at,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed": False,
    }
    result = await educator_assignments_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def list_assignments(educator_id: str) -> list[dict]:
    out = []
    cursor = educator_assignments_collection.find({"educator_id": educator_id}).sort("created_at", -1)
    async for a in cursor:
        learner = await users_collection.find_one({"_id": _oid(a["learner_id"])})
        # An assignment is "completed" once the learner has any completed
        # debate on that exact topic after the assignment was created.
        completed = False
        if learner:
            match = await debate_sessions_collection.find_one({
                "owner_id": a["learner_id"], "topic": a["topic"], "status": "completed",
                "updated_at": {"$gte": a["created_at"]},
            })
            completed = match is not None
        out.append({
            "id": str(a["_id"]),
            "educator_id": a["educator_id"],
            "learner_id": a["learner_id"],
            "learner_name": learner["full_name"] if learner else "Unknown learner",
            "topic": a["topic"],
            "debate_format": a["debate_format"],
            "note": a.get("note"),
            "due_at": a.get("due_at"),
            "created_at": a["created_at"],
            "completed": completed,
        })
    return out
