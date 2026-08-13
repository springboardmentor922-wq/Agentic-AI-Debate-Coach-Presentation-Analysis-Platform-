from app.db.mongodb import session_logs_collection, fallacy_analysis_collection
from app.schemas.reports import SkillAnalytics
from collections import Counter
from app.schemas.reports import CounterargumentSummary

async def compute_skill_analytics(user_id: int, session_ids: list[int]) -> SkillAnalytics:
    if not session_ids:
        return SkillAnalytics(turn_count=0, fallacy_count=0)

    score_cursor = session_logs_collection.aggregate([
        {"$match": {"session_id": {"$in": session_ids}, "event": "debate_turn"}},
        {"$group": {
            "_id": None,
            "avg_clarity": {"$avg": "$score_result.clarity"},
            "avg_evidence_strength": {"$avg": "$score_result.evidence_strength"},
            "avg_rebuttal_quality": {"$avg": "$score_result.rebuttal_quality"},
            "avg_logical_consistency": {"$avg": "$score_result.logical_consistency"},
            "turn_count": {"$sum": 1},
        }},
    ])
    score_docs = await score_cursor.to_list(length=1)
    score_data = score_docs[0] if score_docs else {}
    turn_count = score_data.get("turn_count", 0)

    fallacy_count = await fallacy_analysis_collection.count_documents({"user_id": user_id})

    fallacy_type_cursor = fallacy_analysis_collection.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$result.fallacy_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1},
    ])
    fallacy_type_docs = await fallacy_type_cursor.to_list(length=1)
    most_common_fallacy = fallacy_type_docs[0]["_id"] if fallacy_type_docs else None

    return SkillAnalytics(
        turn_count=turn_count,
        avg_clarity=round(score_data["avg_clarity"], 1) if score_data.get("avg_clarity") is not None else None,
        avg_evidence_strength=round(score_data["avg_evidence_strength"], 1) if score_data.get("avg_evidence_strength") is not None else None,
        avg_rebuttal_quality=round(score_data["avg_rebuttal_quality"], 1) if score_data.get("avg_rebuttal_quality") is not None else None,
        avg_logical_consistency=round(score_data["avg_logical_consistency"], 1) if score_data.get("avg_logical_consistency") is not None else None,
        fallacy_count=fallacy_count,
        fallacy_rate=round(fallacy_count / turn_count, 2) if turn_count else None,
        most_common_fallacy=most_common_fallacy,
    )


async def compute_counterargument_summary(session_ids: list[int]) -> CounterargumentSummary:
    if not session_ids:
        return CounterargumentSummary()

    cursor = session_logs_collection.find(
        {"session_id": {"$in": session_ids}, "event": "debate_turn", "counterarguments": {"$ne": None}}
    ).sort("timestamp", -1)

    turns_with_counterarguments = 0
    total_questions = 0
    all_suggestions: list[str] = []
    recent_suggestions: list[str] = []

    async for turn in cursor:
        turns_with_counterarguments += 1
        questions = turn.get("challenge_questions", [])
        total_questions += len(questions)
        suggestions = (turn.get("counterarguments") or {}).get("strategy_suggestions", [])
        all_suggestions.extend(suggestions)
        if len(recent_suggestions) < 5:
            recent_suggestions.extend(suggestions[: 5 - len(recent_suggestions)])

    most_common = [s for s, _ in Counter(all_suggestions).most_common(5)]

    return CounterargumentSummary(
        turns_with_counterarguments=turns_with_counterarguments,
        total_challenge_questions=total_questions,
        most_common_strategy_suggestions=most_common,
        recent_strategy_suggestions=recent_suggestions,
    )