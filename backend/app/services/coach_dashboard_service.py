from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.evaluation import Evaluation
from app.models.debate_session import DebateSession


def coach_dashboard_summary(db: Session):

    # Active learners
    total_learners = (
        db.query(User)
        .filter(User.role == "Learner")
        .count()
    )

    # Today's sessions
    today_sessions = (
        db.query(DebateSession)
        .filter(
            func.date(DebateSession.created_at) == date.today()
        )
        .count()
    )

    # Pending evaluations
    pending_reviews = (
        db.query(DebateSession)
        .filter(
            DebateSession.status == "Pending Review"
        )
        .count()
    )

    # Average score
    avg_score = (
        db.query(
            func.avg(Evaluation.overall_percentage)
        )
        .scalar()
    )

    if avg_score is None:
        avg_score = 0

    # Top performer
    top = (
        db.query(
            User.full_name,
            func.avg(Evaluation.overall_percentage).label("score")
        )
        .join(
            Evaluation,
            Evaluation.user_id == User.id
        )
        .group_by(
            User.id
        )
        .order_by(
            func.avg(Evaluation.overall_percentage).desc()
        )
        .first()
    )

    return {

        "active_learners": total_learners,

        "sessions_today": today_sessions,

        "pending_reviews": pending_reviews,

        "average_score": round(avg_score, 2),

        "top_performer": {
            "name": top.full_name if top else "N/A",
            "score": round(top.score, 2) if top else 0,
        }

    }





def recent_learner_activity(db: Session):

    activities = (
        db.query(
            Evaluation,
            User.full_name
        )
        .join(
            User,
            User.id == Evaluation.user_id
        )
        .order_by(
            Evaluation.created_at.desc()
        )
        .limit(10)
        .all()
    )

    result = []

    for evaluation, name in activities:

        result.append({

            "student": name,

            "action": "Completed Debate",

            "topic": evaluation.topic,

            "score": f"{round(evaluation.overall_percentage)}/100",

            "time": evaluation.created_at.strftime("%d %b %Y %I:%M %p")

        })

    return result