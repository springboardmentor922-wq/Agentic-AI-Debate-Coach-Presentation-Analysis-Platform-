from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.evaluation import Evaluation


def get_educator_learner_detail(
    learner_id: int,
    db: Session
):

    # =========================================
    # GET LEARNER
    # =========================================

    learner = (
        db.query(User)
        .filter(
            User.id == learner_id,
            User.role == "Learner"
        )
        .first()
    )

    if learner is None:
        return None


    # =========================================
    # GET EVALUATIONS
    # =========================================

    evaluations = (
        db.query(Evaluation)
        .filter(
            Evaluation.user_id == learner_id
        )
        .order_by(
            Evaluation.created_at.desc()
        )
        .all()
    )


    # =========================================
    # BASIC PERFORMANCE
    # =========================================

    total_debates = len(evaluations)


    average_score = (
        db.query(
            func.avg(
                Evaluation.overall_percentage
            )
        )
        .filter(
            Evaluation.user_id == learner_id
        )
        .scalar()
    )

    average_score = (
        round(float(average_score), 2)
        if average_score is not None
        else 0
    )


    highest_score = (
        db.query(
            func.max(
                Evaluation.overall_percentage
            )
        )
        .filter(
            Evaluation.user_id == learner_id
        )
        .scalar()
    )

    highest_score = (
        round(float(highest_score), 2)
        if highest_score is not None
        else 0
    )


    lowest_score = (
        db.query(
            func.min(
                Evaluation.overall_percentage
            )
        )
        .filter(
            Evaluation.user_id == learner_id
        )
        .scalar()
    )

    lowest_score = (
        round(float(lowest_score), 2)
        if lowest_score is not None
        else 0
    )


    # =========================================
    # SKILL AVERAGES
    # =========================================

    grammar = (
        db.query(
            func.avg(
                Evaluation.grammar_score
            )
        )
        .filter(
            Evaluation.user_id == learner_id
        )
        .scalar()
    ) or 0


    logic = (
        db.query(
            func.avg(
                Evaluation.logic_score
            )
        )
        .filter(
            Evaluation.user_id == learner_id
        )
        .scalar()
    ) or 0


    confidence = (
        db.query(
            func.avg(
                Evaluation.confidence_score
            )
        )
        .filter(
            Evaluation.user_id == learner_id
        )
        .scalar()
    ) or 0


    relevance = (
        db.query(
            func.avg(
                Evaluation.relevance_score
            )
        )
        .filter(
            Evaluation.user_id == learner_id
        )
        .scalar()
    ) or 0


    # =========================================
    # DEBATE HISTORY
    # =========================================

    history = []

    for evaluation in evaluations:

        history.append({

            "id": evaluation.id,

            "topic":
                evaluation.topic,

            "score":
                round(
                    float(
                        evaluation.overall_percentage
                        or 0
                    ),
                    2
                ),

            "grade":
                evaluation.grade
                or "N/A",

            "created_at":
                evaluation.created_at.isoformat()
                if evaluation.created_at
                else None

        })


    # =========================================
    # RETURN DATA
    # =========================================

    return {

        "profile": {

            "id": learner.id,

            "name":
                learner.full_name,

            "email":
                learner.email,

            "college":
                learner.college,

            "branch":
                learner.branch,

            "graduation_year":
                learner.graduation_year,

            "cgpa":
                learner.cgpa,

            "github":
                learner.github,

            "linkedin":
                learner.linkedin,

            "portfolio":
                learner.portfolio,

            "experience_level":
                learner.experience_level,

            "learning_goal":
                learner.learning_goal,

            "classroom_id":
                learner.classroom_id

        },


        "performance": {

            "total_debates":
                total_debates,

            "average_score":
                average_score,

            "highest_score":
                highest_score,

            "lowest_score":
                lowest_score

        },


        "skills": {

            "grammar":
                round(
                    float(grammar),
                    2
                ),

            "logic":
                round(
                    float(logic),
                    2
                ),

            "confidence":
                round(
                    float(confidence),
                    2
                ),

            "relevance":
                round(
                    float(relevance),
                    2
                )

        },


        "debate_history":
            history

    }


def get_learner_evaluation_detail(
    learner_id: int,
    evaluation_id: int,
    db: Session
):

    evaluation = (
        db.query(Evaluation)
        .filter(
            Evaluation.id == evaluation_id,
            Evaluation.user_id == learner_id
        )
        .first()
    )

    if evaluation is None:
        return None

    return {
        "id": evaluation.id,

        "topic": evaluation.topic,

        "argument": evaluation.argument,

        "overall": {
            "score": evaluation.overall_score or 0,
            "percentage": evaluation.overall_percentage or 0,
            "grade": evaluation.grade or "N/A"
        },

        "grammar": {
            "score": evaluation.grammar_score or 0,
            "percentage": evaluation.grammar_percentage or 0,
            "remark": evaluation.grammar_remark or ""
        },

        "logic": {
            "score": evaluation.logic_score or 0,
            "percentage": evaluation.logic_percentage or 0,
            "remark": evaluation.logic_remark or ""
        },

        "confidence": {
            "score": evaluation.confidence_score or 0,
            "percentage": evaluation.confidence_percentage or 0,
            "remark": evaluation.confidence_remark or ""
        },

        "relevance": {
            "score": evaluation.relevance_score or 0,
            "percentage": evaluation.relevance_percentage or 0,
            "remark": evaluation.relevance_remark or ""
        },

        "feedback": evaluation.feedback or "",

        "strengths": evaluation.strengths or "",

        "weaknesses": evaluation.weaknesses or "",

        "coach_tips": evaluation.coach_tips or "",

        "logical_fallacies":
            evaluation.logical_fallacies or "",

        "counter_arguments":
            evaluation.counter_arguments or "",

        "rebuttals":
            evaluation.rebuttals or "",

        "opening_statement":
            evaluation.opening_statement or "",

        "closing_statement":
            evaluation.closing_statement or "",

        "improved_argument":
            evaluation.improved_argument or "",

        "real_world_examples":
            evaluation.real_world_examples or "",

        "statistics":
            evaluation.statistics or "",

        "ai_insights":
            evaluation.ai_insights or "",

        "created_at":
            evaluation.created_at.isoformat()
            if evaluation.created_at
            else None
    }