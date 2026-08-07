"""
Certificate Engine (Milestone 4).

Same philosophy as achievement_engine.py: rule evaluation only, against real
persisted data, idempotent per user. Certificates the spec asked for that
have no corresponding real data source on this platform ("Complete Advanced
Course", "Win Live Debate" — there is no course-completion or live/synchronous
debate concept in this codebase) are intentionally NOT implemented as fake
always-available buttons; they're left as documented gaps below rather than
faked.
"""
from datetime import datetime

from app.core.database import (
    certificates_collection,
    debate_sessions_collection,
    performance_scores_collection,
)

_TEN_DEBATES = ("cert_10_debates", "10 Debates Completed", "Awarded for completing 10 real debate sessions on the platform.")
_HIGH_AVERAGE = ("cert_avg_above_80", "Consistent High Performer", "Awarded for an average debate score above 80% across at least 10 completed debates.")

# NOT IMPLEMENTED (documented gap, not faked): "Complete Advanced Course" and
# "Win Live Debate" require a course-progress model and a live/synchronous
# opponent-matched debate model, neither of which exists in this codebase yet.


async def _already_issued(user_id: str, key: str) -> bool:
    return await certificates_collection.find_one({"user_id": user_id, "key": key}) is not None


async def _issue(user_id: str, key: str, title: str, criteria_summary: str, evidence_session_ids: list[str]):
    if await _already_issued(user_id, key):
        return None
    doc = {
        "user_id": user_id,
        "key": key,
        "title": title,
        "description": criteria_summary,
        "criteria_summary": criteria_summary,
        "evidence_session_ids": evidence_session_ids,
        "issued_at": datetime.utcnow().isoformat(),
    }
    result = await certificates_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


async def evaluate_certificates_for_user(user_id: str) -> list[dict]:
    """Re-evaluates certificate rules against real stored data. Returns newly
    issued certificates (empty if none)."""
    newly_issued: list[dict] = []

    completed_sessions = [
        doc async for doc in debate_sessions_collection.find({"owner_id": user_id, "status": "completed"})
    ]
    session_ids = [str(doc["_id"]) for doc in completed_sessions]
    total_completed = len(completed_sessions)

    if total_completed >= 10:
        key, title, criteria = _TEN_DEBATES
        issued = await _issue(user_id, key, title, criteria, session_ids[:10])
        if issued:
            newly_issued.append(issued)

    perf_records = [doc async for doc in performance_scores_collection.find({"user_id": user_id})]
    if len(perf_records) >= 10:
        avg_score = sum(p["score"] for p in perf_records) / len(perf_records)
        if avg_score > 80:
            key, title, criteria = _HIGH_AVERAGE
            issued = await _issue(user_id, key, title, criteria, [p["session_id"] for p in perf_records])
            if issued:
                newly_issued.append(issued)

    return newly_issued


async def list_certificates_for_user(user_id: str) -> list[dict]:
    cursor = certificates_collection.find({"user_id": user_id}).sort("issued_at", -1)
    out = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        out.append(doc)
    return out
