from sqlalchemy.orm import Session

from app.models.debate_session import DebateSession
from app.models.user import User
from app.models.evaluation import Evaluation


def get_all_debate_sessions(db: Session):

    sessions = (
        db.query(DebateSession)
        .order_by(DebateSession.created_at.desc())
        .all()
    )

    result = []

    for session in sessions:

        learner = (
            db.query(User)
            .filter(User.id == session.learner_id)
            .first()
        )

        evaluation = (
            db.query(Evaluation)
            .filter(Evaluation.user_id == session.learner_id)
            .order_by(Evaluation.created_at.desc())
            .first()
        )

        result.append({

            "session_id": session.id,

            "learner_id": session.learner_id,

            "learner_name": learner.full_name if learner else "Unknown",

            "topic": session.topic,

            "category": session.category,

            "difficulty": session.difficulty,

            "status": session.status,

            "created_at": session.created_at,

            "ai_score": evaluation.overall_percentage if evaluation else 0,

            "recording": evaluation.recording_path if evaluation else None

        })

    return result