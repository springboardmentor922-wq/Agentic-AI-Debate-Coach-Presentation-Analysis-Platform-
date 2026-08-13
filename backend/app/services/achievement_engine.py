"""
Achievement Engine (Milestone 4).

Pure rule evaluation against real, already-persisted learner data — no LLM
call, no fabricated content. `evaluate_achievements_for_user` is called
every time a debate finishes (see routers/debate_live.py::finish_debate) and
is idempotent: it only inserts an achievement the user doesn't already have.

Rules are intentionally limited to milestones the platform can actually
prove from stored data (session counts, average score, clean-debate streaks).
"""
from datetime import datetime, timezone

from app.core.database import (
    achievements_collection,
    debate_sessions_collection,
    performance_scores_collection,
    fallacy_reports_collection,
)

# key -> (title, description, rule threshold)
_SESSION_COUNT_RULES = [
    (5, "achv_5_debates", "5 Debates Completed", "Completed 5 debate sessions."),
    (10, "achv_10_debates", "10 Debates Completed", "Completed 10 debate sessions."),
    (50, "achv_50_debates", "50 Debates Completed", "Completed 50 debate sessions."),
]

_AVG_SCORE_RULE = ("achv_excellent_speaker", "Excellent Speaker", "Maintained an average debate score above 80%, across at least 5 debates.")


async def _already_unlocked(user_id: str, key: str) -> bool:
    return await achievements_collection.find_one({"user_id": user_id, "key": key}) is not None


async def _unlock(user_id: str, key: str, title: str, description: str, evidence_session_ids: list[str]):
    if await _already_unlocked(user_id, key):
        return None
    doc = {
        "user_id": user_id,
        "key": key,
        "title": title,
        "description": description,
        "evidence_session_ids": evidence_session_ids,
        "unlocked_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await achievements_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


async def evaluate_achievements_for_user(user_id: str) -> list[dict]:
    """Re-evaluates every rule for this learner against real stored data and
    unlocks any newly-earned achievements. Returns the list of newly unlocked
    achievements (empty if none)."""
    newly_unlocked: list[dict] = []

    completed_sessions = [
        doc async for doc in debate_sessions_collection.find({"owner_id": user_id, "status": "completed"})
    ]
    session_ids = [str(doc["_id"]) for doc in completed_sessions]
    total_completed = len(completed_sessions)

    for threshold, key, title, description in _SESSION_COUNT_RULES:
        if total_completed >= threshold:
            unlocked = await _unlock(user_id, key, title, description, session_ids[:threshold])
            if unlocked:
                newly_unlocked.append(unlocked)

    perf_records = [doc async for doc in performance_scores_collection.find({"user_id": user_id})]
    if len(perf_records) >= 5:
        avg_score = sum(p["score"] for p in perf_records) / len(perf_records)
        if avg_score >= 80:
            key, title, description = _AVG_SCORE_RULE
            unlocked = await _unlock(
                user_id, key, title, description, [p["session_id"] for p in perf_records]
            )
            if unlocked:
                newly_unlocked.append(unlocked)

    # "No logical fallacies" — most recent 5 completed debates all fallacy-free.
    if total_completed >= 5:
        recent_ids = session_ids[:5]
        fallacy_hits = [
            doc async for doc in fallacy_reports_collection.find(
                {"user_id": user_id, "session_id": {"$in": recent_ids}, "report.fallacy_detected": True}
            )
        ]
        if not fallacy_hits:
            unlocked = await _unlock(
                user_id, "achv_no_fallacies", "No Logical Fallacies",
                "Completed 5 consecutive debates with zero detected logical fallacies.", recent_ids,
            )
            if unlocked:
                newly_unlocked.append(unlocked)

    return newly_unlocked


async def list_achievements_for_user(user_id: str) -> list[dict]:
    cursor = achievements_collection.find({"user_id": user_id}).sort("unlocked_at", -1)
    out = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        out.append(doc)
    return out
