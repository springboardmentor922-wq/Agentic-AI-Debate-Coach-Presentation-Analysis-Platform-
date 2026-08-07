"""
Skill Gap Analysis (Milestone 4). Shared by the Coach and Educator routers
so both get the same real filtering/trend/recommendation logic instead of
each reimplementing a shallow whole-roster average.
"""
from collections import Counter
from datetime import datetime

from app.core.database import debate_feedback_reports_collection, users_collection

DIMENSIONS = ["argument_quality", "evidence_usage", "logical_consistency", "rebuttal_effectiveness", "communication_skills"]
DIMENSION_LABELS = {
    "argument_quality": "Argument Quality",
    "evidence_usage": "Evidence Usage",
    "logical_consistency": "Logical Consistency",
    "rebuttal_effectiveness": "Rebuttal Effectiveness",
    "communication_skills": "Communication Skills",
}


async def resolve_learner_ids(base_learner_ids: list[str] | None, learner_id: str | None, department: str | None) -> list[str] | None:
    """
    base_learner_ids: the caller's full scope (a coach's roster, or None for
    "all learners" as an educator/admin can see).
    learner_id / department: optional narrowing filters from the request.
    Returns None only when there is truly no scoping to apply (educator/
    admin with no filters) — callers treat None as "match everyone".
    """
    if learner_id:
        if base_learner_ids is not None and learner_id not in base_learner_ids:
            return []  # requested a learner outside the caller's scope
        return [learner_id]

    if department:
        query = {"role": "learner", "department": department}
        if base_learner_ids is not None:
            from bson import ObjectId
            query["_id"] = {"$in": [ObjectId(i) for i in base_learner_ids]}
        ids = [str(u["_id"]) async for u in users_collection.find(query, {"_id": 1})]
        return ids

    return base_learner_ids


async def compute_skill_gap(learner_ids: list[str] | None) -> dict:
    """
    learner_ids=None means "no scoping filter" (educator/admin, unfiltered).
    An empty list means "scoped to zero learners" (e.g. a filter matched
    nothing) and must return the explicit empty-state, not silently fall
    back to everyone.
    """
    if learner_ids is not None and len(learner_ids) == 0:
        return _empty_result()

    query = {"user_id": {"$in": learner_ids}} if learner_ids is not None else {}
    reports = [doc async for doc in debate_feedback_reports_collection.find(query).sort("created_at", 1)]
    if not reports:
        return _empty_result()

    # -- Current averages per dimension --
    totals = {d: 0.0 for d in DIMENSIONS}
    for r in reports:
        report = r.get("report", {})
        for d in DIMENSIONS:
            totals[d] += report.get(d, 0)
    count = len(reports)
    averages = {d: round(totals[d] / count * 10, 1) for d in DIMENSIONS}  # scaled to /100

    # -- Strengths / weaknesses, ranked by current average --
    ranked = sorted(averages.items(), key=lambda kv: kv[1], reverse=True)
    strengths = [{"dimension": DIMENSION_LABELS[k], "score": v} for k, v in ranked[:2]]
    weaknesses = [{"dimension": DIMENSION_LABELS[k], "score": v} for k, v in ranked[-2:]]

    # -- Historical trend: chronological overall-average per report, bucketed
    # to at most 12 points so the chart stays readable over a long history --
    overall_series = []
    for r in reports:
        report = r.get("report", {})
        vals = [report.get(d, 0) for d in DIMENSIONS]
        overall_series.append(sum(vals) / len(vals) * 10 if vals else 0)
    bucket_size = max(1, len(overall_series) // 12)
    trend = []
    for i in range(0, len(overall_series), bucket_size):
        bucket = overall_series[i : i + bucket_size]
        trend.append({"label": f"#{i + 1}", "value": round(sum(bucket) / len(bucket), 1)})

    # -- Improvement %: oldest half vs newest half of the history, per dim --
    mid = max(1, count // 2)
    improvement = {}
    for d in DIMENSIONS:
        older = [r.get("report", {}).get(d, 0) for r in reports[:mid]]
        newer = [r.get("report", {}).get(d, 0) for r in reports[mid:]] or older
        old_avg = sum(older) / len(older) if older else 0
        new_avg = sum(newer) / len(newer) if newer else 0
        pct = round(((new_avg - old_avg) / old_avg) * 100, 1) if old_avg else 0.0
        improvement[d] = pct

    # -- Recommendations: real, frequency-ranked weaknesses/logical issues
    # across exactly this filtered set — same pattern as the learner-facing
    # /dashboard/recommendations endpoint, just scoped to a cohort. --
    weakness_counter: Counter[str] = Counter()
    for r in reports:
        for w in r.get("report", {}).get("weaknesses", []):
            weakness_counter[w] += 1
    recommendations = [
        {"title": w[:80], "detail": f"Flagged in {c} of {count} analyzed report{'s' if count != 1 else ''} in this view."}
        for w, c in weakness_counter.most_common(4)
    ]
    if not recommendations:
        weakest_label = DIMENSION_LABELS[ranked[-1][0]]
        recommendations = [{"title": f"Focus on {weakest_label}", "detail": "This is the lowest-scoring dimension across the current view."}]

    return {
        "averages": averages,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "trend": trend,
        "improvement_percent": improvement,
        "recommendations": recommendations,
        "sample_size": count,
        "learner_count": len({r["user_id"] for r in reports}),
    }


def _empty_result() -> dict:
    return {
        "averages": {},
        "strengths": [],
        "weaknesses": [],
        "trend": [],
        "improvement_percent": {},
        "recommendations": [],
        "sample_size": 0,
        "learner_count": 0,
    }
