from __future__ import annotations

import json
import logging
from collections import Counter
from statistics import mean
from typing import Any

from sqlalchemy.orm import Session

from app.db.mongodb import (
    session_logs_collection,
    fallacy_analysis_collection,
)

from app.models.debate_report import DebateReport
from app.models.debate_session import DebateSession
from app.models.debate_turn_score import DebateTurnScore
from app.models.user import User

from app.schemas.judge import (
    DebateTimelineItem,
    ScoreProgressItem,
    LearningPlanItem,
)

logger = logging.getLogger(__name__)


# ==========================================================
# MongoDB
# ==========================================================

async def load_session_turns(session_id: int) -> list[dict]:
    """
    Load every debate turn stored in MongoDB.

    Returns:
        [
            {
                user_text,
                ai_text,
                score_result,
                fallacy_result,
                ...
            }
        ]
    """

    cursor = session_logs_collection.find(
        {
            "session_id": session_id,
            "event": "debate_turn",
        }
    ).sort("turn_number", 1)

    turns = await cursor.to_list(length=None)

    return turns


async def load_fallacies(session_id: int):

    cursor = fallacy_analysis_collection.find(
        {
            "session_id": session_id,
        }
    )

    return await cursor.to_list(length=None)


# ==========================================================
# PostgreSQL
# ==========================================================

def load_turn_scores(
    db: Session,
    session_id: int,
) -> list[DebateTurnScore]:

    return (
        db.query(DebateTurnScore)
        .filter(
            DebateTurnScore.session_id == session_id
        )
        .order_by(
            DebateTurnScore.id.asc()
        )
        .all()
    )


# ==========================================================
# Timeline Builder
# ==========================================================

def build_timeline(
    turns: list[dict],
) -> list[DebateTimelineItem]:

    timeline = []

    for turn in turns:

        counter = None

        if turn.get("counterarguments"):

            counter = (
                turn["counterarguments"]
                .get("logical_rebuttals", [None])[0]
            )

        timeline.append(

            DebateTimelineItem(

                turn_number=turn["turn_number"],

                user_argument=turn["user_text"],

                ai_response=turn["ai_text"],

                score=turn["performance_score"][
                    "debate_performance_score"
                ],

                fallacy=(
                    turn["fallacy_result"]
                    .get("fallacy_name")
                    if turn.get("fallacy_result")
                    else None
                ),

                counterargument=counter,

                feedback=(
                    turn["performance_score"]
                    .get("overall_feedback")
                ),

            )

        )

    return timeline


# ==========================================================
# Score Progression
# ==========================================================

def build_progression(
    scores: list[DebateTurnScore],
) -> list[ScoreProgressItem]:

    progression = []

    for index, score in enumerate(scores, start=1):

        progression.append(

            ScoreProgressItem(

                turn_number=index,

                argument_quality=score.argument_quality_score,

                evidence_usage=score.evidence_usage_score,

                logical_consistency=score.logical_consistency_composite,

                rebuttal_effectiveness=score.rebuttal_effectiveness_score,

                communication=score.communication_skills_score,

                overall_score=score.debate_performance_score,

            )

        )

    return progression


# ==========================================================
# Statistics
# ==========================================================

def compute_statistics(
    turns: list[dict],
    scores: list[DebateTurnScore],
):

    total_words = sum(
        len(t["user_text"].split())
        for t in turns
    )

    total_turns = len(turns)

    average_argument = mean(
        s.argument_quality_score
        for s in scores
    ) if scores else 0

    average_evidence = mean(
        s.evidence_usage_score
        for s in scores
    ) if scores else 0

    average_logic = mean(
        s.logical_consistency_composite
        for s in scores
    ) if scores else 0

    average_rebuttal = mean(
        s.rebuttal_effectiveness_score
        for s in scores
    ) if scores else 0

    average_comm = mean(
        s.communication_skills_score
        for s in scores
    ) if scores else 0

    average_presentation = mean(
        (
            s.communication_skills_score
            + (s.wpm or 0)
        ) / 2
        for s in scores
    ) if scores else 0

    overall = mean(
        s.debate_performance_score
        for s in scores
    ) if scores else 0

    critical = mean(
        s.critical_thinking_score
        for s in scores
    ) if scores else 0

    return {

        "overall": round(overall, 2),

        "argument": round(average_argument, 2),

        "evidence": round(average_evidence, 2),

        "logic": round(average_logic, 2),

        "rebuttal": round(average_rebuttal, 2),

        "communication": round(average_comm, 2),

        "presentation": round(average_presentation, 2),

        "critical": round(critical, 2),

        "total_turns": total_turns,

        "total_words": total_words,

    }


# ==========================================================
# Fallacy Summary
# ==========================================================

def summarize_fallacies(
    fallacies: list[dict],
):

    if len(fallacies) == 0:

        return 0, []

    names = []

    for item in fallacies:

        result = item.get("result")

        if not result:

            continue

        if result.get("fallacy_name"):

            names.append(result["fallacy_name"])

    return (

        len(names),

        Counter(names).most_common(),

    )

# ==========================================================
# Winner Selection
# ==========================================================

def determine_winner(
    statistics: dict,
    fallacy_count: int,
):

    score = statistics["overall"]

    if score >= 85 and fallacy_count <= 1:
        return "Learner"

    if score >= 75 and fallacy_count <= 3:
        return "Draw"

    return "AI Opponent"


# ==========================================================
# Strength Detection
# ==========================================================

def identify_strengths(
    statistics: dict,
):

    strengths = []

    if statistics["argument"] >= 80:
        strengths.append(
            "Strong argument construction with clear claims."
        )

    if statistics["evidence"] >= 80:
        strengths.append(
            "Excellent use of supporting evidence."
        )

    if statistics["logic"] >= 80:
        strengths.append(
            "Arguments demonstrated strong logical consistency."
        )

    if statistics["rebuttal"] >= 80:
        strengths.append(
            "Effective rebuttals against opposing viewpoints."
        )

    if statistics["communication"] >= 80:
        strengths.append(
            "Clear and persuasive communication."
        )

    if statistics["presentation"] >= 80:
        strengths.append(
            "Confident presentation and delivery."
        )

    if statistics["critical"] >= 80:
        strengths.append(
            "Excellent critical thinking throughout the debate."
        )

    if len(strengths) == 0:

        strengths.append(
            "Successfully completed the debate session."
        )

    return strengths


# ==========================================================
# Weakness Detection
# ==========================================================

def identify_weaknesses(
    statistics: dict,
):

    weaknesses = []

    if statistics["argument"] < 70:
        weaknesses.append(
            "Arguments lacked sufficient structure."
        )

    if statistics["evidence"] < 70:
        weaknesses.append(
            "More evidence is required to strengthen arguments."
        )

    if statistics["logic"] < 70:
        weaknesses.append(
            "Logical consistency needs improvement."
        )

    if statistics["rebuttal"] < 70:
        weaknesses.append(
            "Rebuttals could be stronger."
        )

    if statistics["communication"] < 70:
        weaknesses.append(
            "Communication needs greater clarity."
        )

    if statistics["presentation"] < 70:
        weaknesses.append(
            "Presentation confidence can be improved."
        )

    if statistics["critical"] < 70:
        weaknesses.append(
            "Critical thinking should be developed further."
        )

    return weaknesses


# ==========================================================
# Best Argument
# ==========================================================

def best_argument(
    turns: list[dict],
):

    if len(turns) == 0:
        return None

    best = max(
        turns,
        key=lambda x: x["performance_score"][
            "debate_performance_score"
        ],
    )

    return best["user_text"]


# ==========================================================
# Best Rebuttal
# ==========================================================

def best_rebuttal(
    turns: list[dict],
):

    rebuttals = []

    for turn in turns:

        counter = turn.get("counterarguments")

        if not counter:
            continue

        logical = counter.get("logical_rebuttals")

        if logical:

            rebuttals.extend(logical)

    if len(rebuttals) == 0:
        return None

    return rebuttals[0]


# ==========================================================
# Judge Summary
# ==========================================================

def generate_summary(
    winner: str,
    statistics: dict,
    strengths: list[str],
    weaknesses: list[str],
):

    summary = []

    summary.append(
        f"The debate concluded with the winner: {winner}."
    )

    summary.append(
        f"Overall debate score: {statistics['overall']:.1f}/100."
    )

    if strengths:

        summary.append(
            "Major strengths included "
            + ", ".join(strengths[:3])
            + "."
        )

    if weaknesses:

        summary.append(
            "Primary improvement areas were "
            + ", ".join(weaknesses[:3])
            + "."
        )

    summary.append(
        "The learner demonstrated measurable progress "
        "throughout the debate session."
    )

    return " ".join(summary)


# ==========================================================
# Recommendations
# ==========================================================

def generate_recommendations(
    statistics: dict,
):

    recommendations = []

    if statistics["argument"] < 80:

        recommendations.append(
            "Practice organizing arguments using the Claim-Evidence-Reasoning framework."
        )

    if statistics["logic"] < 80:

        recommendations.append(
            "Review common logical fallacies and strengthen logical consistency."
        )

    if statistics["evidence"] < 80:

        recommendations.append(
            "Support claims with reliable facts, research, and statistics."
        )

    if statistics["rebuttal"] < 80:

        recommendations.append(
            "Improve rebuttal techniques by directly addressing opponent claims."
        )

    if statistics["communication"] < 80:

        recommendations.append(
            "Enhance speaking clarity and persuasive communication."
        )

    if statistics["presentation"] < 80:

        recommendations.append(
            "Practice public speaking to improve confidence and delivery."
        )

    if len(recommendations) == 0:

        recommendations.append(
            "Maintain current performance through regular debate practice."
        )

    return recommendations


# ==========================================================
# Personalized Learning Plan
# ==========================================================

def build_learning_plan(
    statistics: dict,
):

    plan = []

    plan.append(

        LearningPlanItem(

            week=1,

            title="Argument Construction",

            objective="Improve the structure of debate arguments.",

            exercises=[
                "Practice Claim-Evidence-Reasoning",
                "Analyze sample debates",
                "Summarize news articles into arguments",
            ],

            expected_outcome="Produce stronger structured arguments.",

        )

    )

    if statistics["logic"] < 80:

        plan.append(

            LearningPlanItem(

                week=2,

                title="Logical Reasoning",

                objective="Reduce logical fallacies.",

                exercises=[
                    "Study logical fallacies",
                    "Solve reasoning exercises",
                    "Evaluate debate transcripts",
                ],

                expected_outcome="Improve logical consistency.",

            )

        )

    if statistics["communication"] < 80:

        plan.append(

            LearningPlanItem(

                week=3,

                title="Communication Skills",

                objective="Improve speaking confidence.",

                exercises=[
                    "Record speeches",
                    "Practice eye contact",
                    "Reduce filler words",
                ],

                expected_outcome="Increase presentation quality.",

            )

        )

    if statistics["evidence"] < 80:

        plan.append(

            LearningPlanItem(

                week=4,

                title="Evidence-Based Debating",

                objective="Support arguments with facts.",

                exercises=[
                    "Read research papers",
                    "Collect statistics",
                    "Practice evidence-backed arguments",
                ],

                expected_outcome="Increase evidence usage score.",

            )

        )

    return plan
# ==========================================================
# Generate Debate Report
# ==========================================================

async def generate_debate_report(
    db: Session,
    session: DebateSession,
    current_user: User,
) -> DebateReport:

    logger.info(
        f"Generating AI Judge Report for session {session.id}"
    )

    # ------------------------------------------------------
    # Load Data
    # ------------------------------------------------------

    turns = await load_session_turns(session.id)

    if len(turns) == 0:
        raise ValueError(
            "No debate turns found for this session."
        )

    scores = load_turn_scores(
        db,
        session.id,
    )

    fallacies = await load_fallacies(
        session.id,
    )

    # ------------------------------------------------------
    # Build Timeline
    # ------------------------------------------------------

    timeline = build_timeline(
        turns,
    )

    score_progression = build_progression(
        scores,
    )

    # ------------------------------------------------------
    # Statistics
    # ------------------------------------------------------

    statistics = compute_statistics(
        turns,
        scores,
    )

    fallacy_count, fallacy_summary = summarize_fallacies(
        fallacies,
    )

    # ------------------------------------------------------
    # Winner
    # ------------------------------------------------------

    winner = determine_winner(
        statistics,
        fallacy_count,
    )

    # ------------------------------------------------------
    # Strengths / Weaknesses
    # ------------------------------------------------------

    strengths = identify_strengths(
        statistics,
    )

    weaknesses = identify_weaknesses(
        statistics,
    )

    # ------------------------------------------------------
    # Best Moments
    # ------------------------------------------------------

    strongest_argument = best_argument(
        turns,
    )

    strongest_rebuttal = best_rebuttal(
        turns,
    )

    # ------------------------------------------------------
    # Recommendations
    # ------------------------------------------------------

    recommendations = generate_recommendations(
        statistics,
    )

    learning_plan = build_learning_plan(
        statistics,
    )

    # ------------------------------------------------------
    # Judge Summary
    # ------------------------------------------------------

    summary = generate_summary(
        winner,
        statistics,
        strengths,
        weaknesses,
    )

    # ------------------------------------------------------
    # Average Response Time
    # ------------------------------------------------------

    average_response_time = None

    timestamps = []

    for turn in turns:

        if turn.get("timestamp"):

            timestamps.append(
                turn["timestamp"]
            )

    if len(timestamps) > 1:

        deltas = []

        for i in range(1, len(timestamps)):

            previous = timestamps[i - 1]
            current = timestamps[i]

            try:

                delta = (
                    current - previous
                ).total_seconds()

                deltas.append(delta)

            except Exception:

                pass

        if len(deltas) > 0:

            average_response_time = round(
                mean(deltas),
                2,
            )

    # ------------------------------------------------------
    # Create Debate Report
    # ------------------------------------------------------

    report = DebateReport(

        session_id=session.id,

        user_id=current_user.id,

        winner=winner,

        overall_score=statistics["overall"],

        judge_summary=summary,

        strengths=strengths,

        weaknesses=weaknesses,

        recommendations=recommendations,

        learning_plan=[
            item.model_dump()
            for item in learning_plan
        ],

        best_argument=strongest_argument,

        best_rebuttal=strongest_rebuttal,

        closing_feedback=(
            recommendations[0]
            if recommendations
            else None
        ),

        argument_quality=statistics["argument"],

        evidence_usage=statistics["evidence"],

        logical_consistency=statistics["logic"],

        rebuttal_effectiveness=statistics["rebuttal"],

        communication_skills=statistics["communication"],

        confidence_score=statistics["communication"],

        presentation_score=statistics["presentation"],

        critical_thinking_score=statistics["critical"],

        total_turns=statistics["total_turns"],

        fallacies_detected=fallacy_count,

        average_response_time=average_response_time,

        total_words=statistics["total_words"],

        timeline=[
            item.model_dump()
            for item in timeline
        ],

        score_progression=[
            item.model_dump()
            for item in score_progression
        ],

        generated_by="AI Judge v1.0",

    )

    # ------------------------------------------------------
    # Save Report
    # ------------------------------------------------------

    db.add(report)

    db.commit()

    db.refresh(report)

    logger.info(
        f"AI Judge Report generated successfully "
        f"for session {session.id}"
    )

    return report