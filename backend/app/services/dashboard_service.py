from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.evaluation import Evaluation


def calculate_grade(avg):

    if avg >= 90:
        return "A+"

    if avg >= 80:
        return "A"

    if avg >= 70:
        return "B"

    if avg >= 60:
        return "C"

    return "D"


def dashboard_summary(user_id: int, db: Session):

    evaluations = db.query(Evaluation).filter(
        Evaluation.user_id == user_id
    )

    total = evaluations.count()

    if total == 0:
        return {
            "total_debates": 0,
            "average_score": 0,
            "highest_score": 0,
            "lowest_score": 0,
            "average_grammar": 0,
            "average_logic": 0,
            "average_confidence": 0,
            "average_relevance": 0,
            "grade": "N/A"
        }

    avg_grammar = db.query(
        func.avg(Evaluation.grammar_score)
    ).filter(
        Evaluation.user_id == user_id
    ).scalar()

    avg_logic = db.query(
        func.avg(Evaluation.logic_score)
    ).filter(
        Evaluation.user_id == user_id
    ).scalar()

    avg_confidence = db.query(
        func.avg(Evaluation.confidence_score)
    ).filter(
        Evaluation.user_id == user_id
    ).scalar()

    avg_relevance = db.query(
        func.avg(Evaluation.relevance_score)
    ).filter(
        Evaluation.user_id == user_id
    ).scalar()

    avg_score = (
        avg_grammar +
        avg_logic +
        avg_confidence +
        avg_relevance
    ) / 40 * 100

    return {
        "total_debates": total,

        "average_score": round(avg_score, 2),

        "highest_score": evaluations.order_by(
            Evaluation.overall_score.desc()
        ).first().overall_score,

        "lowest_score": evaluations.order_by(
            Evaluation.overall_score.asc()
        ).first().overall_score,

        "average_grammar": round(avg_grammar, 2),

        "average_logic": round(avg_logic, 2),

        "average_confidence": round(avg_confidence, 2),

        "average_relevance": round(avg_relevance, 2),

        "grade": calculate_grade(avg_score)
    }


def evaluation_history(user_id: int, db: Session):

    data = db.query(Evaluation).filter(
        Evaluation.user_id == user_id
    ).order_by(
        Evaluation.created_at.desc()
    ).all()

    return data


def evaluation_detail(
    evaluation_id: int,
    user_id: int,
    db: Session
):

    return db.query(Evaluation).filter(
        Evaluation.id == evaluation_id,
        Evaluation.user_id == user_id
    ).first()