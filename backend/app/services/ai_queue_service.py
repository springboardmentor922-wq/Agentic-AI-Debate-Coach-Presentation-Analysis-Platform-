from sqlalchemy.orm import Session

from app.models.debate_session import DebateSession
from app.models.user import User
from app.models.evaluation import Evaluation


def get_pending_evaluations(db: Session):

    sessions = (
        db.query(DebateSession)
        .filter(
            DebateSession.status == "Pending Review"
        )
        .order_by(
            DebateSession.created_at.desc()
        )
        .all()
    )

    result = []

    for session in sessions:

        learner = (
            db.query(User)
            .filter(
                User.id == session.learner_id
            )
            .first()
        )

        evaluation = (
            db.query(Evaluation)
            .filter(
                Evaluation.user_id == session.learner_id,
                Evaluation.topic == session.topic
            )
            .order_by(
                Evaluation.created_at.desc()
            )
            .first()
        )

        result.append({

            "session_id": session.id,

            "learner_id": session.learner_id,

            "learner_name": (
                learner.full_name
                if learner
                else "Unknown"
            ),

            "topic": session.topic,

            "category": session.category,

            "difficulty": session.difficulty,

            "ai_score": (
                evaluation.overall_percentage
                if evaluation
                else 0
            ),

            "status": session.status,

            "created_at": session.created_at,

            "recording": (
                evaluation.recording_path
                if evaluation
                else session.recording_path
            )

        })

    return result