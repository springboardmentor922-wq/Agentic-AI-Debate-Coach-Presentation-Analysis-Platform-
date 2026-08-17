from sqlalchemy.orm import Session
from app.models.user import User
from app.models.evaluation import Evaluation
from app.models.debate_session import DebateSession


def get_all_learners(db: Session):

    learners = db.query(User).filter(
        User.role == "Learner"
    ).all()

    result = []

    for learner in learners:

        latest_evaluation = (
            db.query(Evaluation)
            .filter(Evaluation.user_id == learner.id)
            .order_by(Evaluation.created_at.desc())
            .first()
        )

        latest_session = (
            db.query(DebateSession)
            .filter(DebateSession.learner_id == learner.id)
            .order_by(DebateSession.created_at.desc())
            .first()
        )

        result.append({

            "id": learner.id,

            "name": learner.full_name,

            "email": learner.email,

            

            "cgpa": learner.cgpa,

            "latest_topic": latest_evaluation.topic if latest_evaluation else "No Debate",

            "score": latest_evaluation.overall_percentage if latest_evaluation else 0,

            "status": latest_session.status if latest_session else "No Session",

            "last_activity": (
                latest_evaluation.created_at.strftime("%d %b %Y")
                if latest_evaluation else "-"
            )

        })

    return result