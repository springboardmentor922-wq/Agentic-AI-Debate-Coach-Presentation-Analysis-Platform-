from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.debate import DebateTopic
from app.models.evaluation import Evaluation


# ============================================================
# DEBATE TOPIC FUNCTIONS
# ============================================================

def create_topic(topic_data, db: Session):

    topic = DebateTopic(
        title=topic_data.title,
        description=topic_data.description,
        difficulty=topic_data.difficulty,
        category=topic_data.category
    )

    db.add(topic)
    db.commit()
    db.refresh(topic)

    return topic


def get_all_topics(db: Session):

    return (
        db.query(DebateTopic)
        .order_by(DebateTopic.id.desc())
        .all()
    )


def get_topic(
    topic_id: int,
    db: Session
):

    return (
        db.query(DebateTopic)
        .filter(
            DebateTopic.id == topic_id
        )
        .first()
    )


def update_topic(
    topic_id: int,
    topic_data,
    db: Session
):

    topic = (
        db.query(DebateTopic)
        .filter(
            DebateTopic.id == topic_id
        )
        .first()
    )

    if topic is None:
        return None

    topic.title = topic_data.title
    topic.description = topic_data.description
    topic.difficulty = topic_data.difficulty
    topic.category = topic_data.category

    db.commit()
    db.refresh(topic)

    return topic


def delete_topic(
    topic_id: int,
    db: Session
):

    topic = (
        db.query(DebateTopic)
        .filter(
            DebateTopic.id == topic_id
        )
        .first()
    )

    if topic is None:
        return None

    db.delete(topic)
    db.commit()

    return topic


# ============================================================
# DASHBOARD FUNCTIONS
# ============================================================

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


def dashboard_summary(
    user_id: int,
    db: Session
):

    evaluations = (
        db.query(Evaluation)
        .filter(
            Evaluation.user_id == user_id
        )
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

    avg_grammar = (
        db.query(
            func.avg(
                Evaluation.grammar_score
            )
        )
        .filter(
            Evaluation.user_id == user_id
        )
        .scalar()
    ) or 0

    avg_logic = (
        db.query(
            func.avg(
                Evaluation.logic_score
            )
        )
        .filter(
            Evaluation.user_id == user_id
        )
        .scalar()
    ) or 0

    avg_confidence = (
        db.query(
            func.avg(
                Evaluation.confidence_score
            )
        )
        .filter(
            Evaluation.user_id == user_id
        )
        .scalar()
    ) or 0

    avg_relevance = (
        db.query(
            func.avg(
                Evaluation.relevance_score
            )
        )
        .filter(
            Evaluation.user_id == user_id
        )
        .scalar()
    ) or 0

    avg_percentage = (
        db.query(
            func.avg(
                Evaluation.overall_percentage
            )
        )
        .filter(
            Evaluation.user_id == user_id
        )
        .scalar()
    ) or 0

    highest = (
        evaluations
        .order_by(
            Evaluation.overall_percentage.desc()
        )
        .first()
    )

    lowest = (
        evaluations
        .order_by(
            Evaluation.overall_percentage.asc()
        )
        .first()
    )

    return {

        "total_debates": total,

        "average_score": round(
            float(avg_percentage),
            2
        ),

        "highest_score": round(
            float(
                highest.overall_percentage
            ),
            2
        ) if highest else 0,

        "lowest_score": round(
            float(
                lowest.overall_percentage
            ),
            2
        ) if lowest else 0,

        "average_grammar": round(
            float(avg_grammar),
            2
        ),

        "average_logic": round(
            float(avg_logic),
            2
        ),

        "average_confidence": round(
            float(avg_confidence),
            2
        ),

        "average_relevance": round(
            float(avg_relevance),
            2
        ),

        "grade": calculate_grade(
            float(avg_percentage)
        )
    }


def evaluation_history(
    user_id: int,
    db: Session
):

    return (
        db.query(Evaluation)
        .filter(
            Evaluation.user_id == user_id
        )
        .order_by(
            Evaluation.created_at.desc()
        )
        .all()
    )


def evaluation_detail(
    evaluation_id: int,
    user_id: int,
    db: Session
):

    return (
        db.query(Evaluation)
        .filter(
            Evaluation.id == evaluation_id,
            Evaluation.user_id == user_id
        )
        .first()
    )