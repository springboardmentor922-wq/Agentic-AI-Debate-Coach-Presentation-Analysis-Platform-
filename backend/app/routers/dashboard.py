"""
Learner Dashboard & Analytics (Module 11).

Every figure here is derived live from MongoDB — debate_sessions,
debate_feedback_reports, fallacy_reports, and debate_performance — for the
current user (and, for the leaderboard, every registered learner). Nothing
in this router returns static or placeholder values: if a user has no
history yet, the honest answer is zeros / empty lists, not fabricated data.
"""
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import asyncio

from fastapi import APIRouter, Depends, Query

from app.core.database import (
    users_collection,
    debate_sessions_collection,
    debate_feedback_reports_collection,
    fallacy_reports_collection,
    performance_scores_collection,
)
from app.core.deps import require_roles
from app.schemas.user import UserRole

router = APIRouter(prefix="/api/v1/dashboard", tags=["Learner Dashboard"])


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _initials(name: str) -> str:
    parts = [p for p in name.split(" ") if p]
    return "".join(p[0].upper() for p in parts[:2]) or "?"


@router.get("/summary")
async def get_dashboard_summary(current_user: dict = Depends(require_roles(UserRole.learner))):
    """
    Overall score, sessions completed, avg debate duration, fallacies avoided,
    and a 7-day performance trend — all computed from this learner's real
    records. Deltas compare the last 7 days to the 7 days before that.
    """
    user_id = current_user["id"]
    now = datetime.utcnow()

    # These three queries are independent (different collections, no shared
    # dependency) but were previously awaited one after another — each one
    # paying its own round-trip latency serially. Running them concurrently
    # cuts this endpoint's DB wait time to roughly the slowest single query
    # instead of the sum of all three.
    completed_cursor = debate_sessions_collection.find(
        {"owner_id": user_id, "status": "completed"}
    )
    perf_cursor = performance_scores_collection.find({"user_id": user_id}).sort("created_at", 1)
    fallacy_cursor = fallacy_reports_collection.find({"user_id": user_id})

    completed_sessions, perf_records, fallacy_docs = await asyncio.gather(
        completed_cursor.to_list(length=None),
        perf_cursor.to_list(length=None),
        fallacy_cursor.to_list(length=None),
    )
    sessions_completed = len(completed_sessions)

    durations = [
        doc["recording"]["duration_seconds"]
        for doc in completed_sessions
        if doc.get("recording") and doc["recording"].get("duration_seconds")
    ]
    avg_duration_seconds = sum(durations) / len(durations) if durations else 0

    # --- Performance scores (written whenever a feedback report is generated) ---
    overall_score = round(sum(p["score"] for p in perf_records) / len(perf_records)) if perf_records else 0

    last_7 = [p for p in perf_records if _parse_dt(p["created_at"]) and _parse_dt(p["created_at"]) >= now - timedelta(days=7)]
    prev_7 = [
        p for p in perf_records
        if _parse_dt(p["created_at"])
        and now - timedelta(days=14) <= _parse_dt(p["created_at"]) < now - timedelta(days=7)
    ]
    last_7_avg = sum(p["score"] for p in last_7) / len(last_7) if last_7 else None
    prev_7_avg = sum(p["score"] for p in prev_7) / len(prev_7) if prev_7 else None
    if last_7_avg is not None and prev_7_avg:
        score_delta = f"{'+' if last_7_avg >= prev_7_avg else ''}{round(((last_7_avg - prev_7_avg) / prev_7_avg) * 100, 1)}%"
    else:
        score_delta = None

    sessions_last_7 = len([s for s in completed_sessions if _parse_dt(s.get("updated_at")) and _parse_dt(s["updated_at"]) >= now - timedelta(days=7)])
    sessions_prev_7 = len([
        s for s in completed_sessions
        if _parse_dt(s.get("updated_at"))
        and now - timedelta(days=14) <= _parse_dt(s["updated_at"]) < now - timedelta(days=7)
    ])
    sessions_delta = f"{'+' if sessions_last_7 >= sessions_prev_7 else ''}{sessions_last_7 - sessions_prev_7}"

    # --- Fallacies avoided: share of analyzed turns with no fallacy detected ---
    if fallacy_docs:
        clean = sum(1 for d in fallacy_docs if not d["report"].get("fallacy_detected"))
        fallacies_avoided_pct = round((clean / len(fallacy_docs)) * 100)
    else:
        fallacies_avoided_pct = None

    # --- 7-day trend: daily average score for the last 7 calendar days ---
    day_buckets: dict[str, list[float]] = defaultdict(list)
    for p in perf_records:
        dt = _parse_dt(p["created_at"])
        if dt and dt >= now - timedelta(days=7):
            day_buckets[dt.strftime("%a")].append(p["score"])

    weekly_trend = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        label = day.strftime("%a")
        values = day_buckets.get(label, [])
        weekly_trend.append({"label": label, "value": round(sum(values) / len(values)) if values else 0})

    def _fmt_duration(seconds: float) -> str:
        if not seconds:
            return "—"
        m, s = divmod(int(seconds), 60)
        return f"{m}m {s:02d}s"

    return {
        "overall_score": overall_score,
        "score_delta": score_delta,
        "sessions_completed": sessions_completed,
        "sessions_delta": sessions_delta,
        "avg_debate_duration": _fmt_duration(avg_duration_seconds),
        "fallacies_avoided_pct": fallacies_avoided_pct,
        "weekly_trend": weekly_trend,
    }


@router.get("/recommendations")
async def get_recommendations(
    limit: int = Query(default=3, ge=1, le=10),
    current_user: dict = Depends(require_roles(UserRole.learner)),
):
    """
    Personalized recommendations generated from this learner's *actual*
    recorded weaknesses (debate_feedback_reports.weaknesses /
    logical_issues) and fallacy history — not static tips. Weaknesses are
    ranked by frequency of occurrence across the learner's session reports.
    """
    user_id = current_user["id"]
    reports, fallacy_docs = await asyncio.gather(
        debate_feedback_reports_collection.find({"user_id": user_id}).to_list(length=None),
        fallacy_reports_collection.find({"user_id": user_id, "report.fallacy_detected": True}).to_list(length=None),
    )

    weakness_counter: Counter[str] = Counter()
    issue_counter: Counter[str] = Counter()
    for doc in reports:
        report = doc["report"]
        for w in report.get("weaknesses", []):
            weakness_counter[w] += 1
        for issue in report.get("logical_issues", []):
            issue_counter[issue] += 1

    fallacy_type_counter = Counter(d["report"].get("fallacy_type") for d in fallacy_docs if d["report"].get("fallacy_type"))

    recommendations = []

    for weakness, count in weakness_counter.most_common(limit):
        recommendations.append({
            "id": f"weak_{abs(hash(weakness)) % 10_000}",
            "title": weakness[:60],
            "detail": f"Flagged in {count} of your recent debate report{'s' if count != 1 else ''}. Focus your next session on addressing this.",
            "tag": "Skill Gap",
        })

    for fallacy_type, count in fallacy_type_counter.most_common(limit):
        if len(recommendations) >= limit:
            break
        recommendations.append({
            "id": f"fallacy_{abs(hash(fallacy_type)) % 10_000}",
            "title": f"Review {fallacy_type} patterns",
            "detail": f"You triggered this fallacy {count} time{'s' if count != 1 else ''} in analyzed turns. A refresher would help.",
            "tag": "Fallacy",
        })

    for issue, count in issue_counter.most_common(limit):
        if len(recommendations) >= limit:
            break
        recommendations.append({
            "id": f"issue_{abs(hash(issue)) % 10_000}",
            "title": issue[:60],
            "detail": f"Logged {count} time{'s' if count != 1 else ''} across your debate reports.",
            "tag": "Reasoning",
        })

    return {"items": recommendations[:limit], "has_history": bool(reports or fallacy_docs)}


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: dict = Depends(require_roles(UserRole.learner)),
):
    """
    Ranked by average performance score, computed only from registered
    learners who actually have at least one scored session — no seeded or
    fake entries. Learners with zero history simply don't appear.
    """
    pipeline = [
        {"$group": {"_id": "$user_id", "avg_score": {"$avg": "$score"}, "sessions": {"$sum": 1}}},
        {"$sort": {"avg_score": -1}},
        {"$limit": limit},
    ]
    ranked = [doc async for doc in performance_scores_collection.aggregate(pipeline)]

    # Batch-fetch every user in one query instead of one find_one per
    # leaderboard row (was N+1: up to `limit` round-trips per request).
    user_ids = [_to_object_id(entry["_id"]) for entry in ranked]
    users_by_id = {
        str(u["_id"]): u
        async for u in users_collection.find({"_id": {"$in": [uid for uid in user_ids if uid]}})
    }

    leaderboard = []
    for rank, entry in enumerate(ranked, start=1):
        user = users_by_id.get(str(entry["_id"]))
        if not user or user.get("role") != UserRole.learner.value:
            continue
        leaderboard.append({
            "rank": rank,
            "user_id": entry["_id"],
            "name": user["full_name"],
            "avatar": _initials(user["full_name"]),
            "score": round(entry["avg_score"]),
            "sessions": entry["sessions"],
            "is_me": entry["_id"] == current_user["id"],
        })

    my_entry = next((e for e in leaderboard if e["is_me"]), None)
    return {"leaderboard": leaderboard, "my_rank": my_entry["rank"] if my_entry else None}


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(default=8, ge=1, le=30),
    current_user: dict = Depends(require_roles(UserRole.learner)),
):
    """Merged, newest-first feed built from real completed sessions and their feedback reports."""
    user_id = current_user["id"]
    reports = [doc async for doc in debate_feedback_reports_collection.find({"user_id": user_id}).sort("updated_at", -1).limit(limit)]

    # Batch-fetch the sessions these reports reference in one query instead
    # of one find_one per report (was N+1: up to `limit` round-trips).
    session_ids = [_to_object_id(doc["session_id"]) for doc in reports]
    sessions_by_id = {
        str(s["_id"]): s
        async for s in debate_sessions_collection.find({"_id": {"$in": [sid for sid in session_ids if sid]}})
    }

    activity = []
    for doc in reports:
        session = sessions_by_id.get(str(_to_object_id(doc["session_id"])))
        topic = session["topic"] if session else "Debate session"
        activity.append({
            "id": str(doc["_id"]) if "_id" in doc else doc["session_id"],
            "text": f'Completed feedback report generated for "{topic}"',
            "score": round(doc["report"]["overall_rating"] * 10),
            "time": doc.get("updated_at"),
        })

    return {"items": activity}


def _to_object_id(value):
    from bson import ObjectId
    try:
        return ObjectId(value)
    except Exception:
        return None
