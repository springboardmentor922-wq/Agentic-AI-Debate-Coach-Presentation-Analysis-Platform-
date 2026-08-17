from sqlalchemy.orm import Session

from app.models.coach_review import CoachReview
from app.models.debate_session import DebateSession


def get_my_review(user_id: int, db: Session):

    session = (
        db.query(DebateSession)
        .filter(DebateSession.learner_id == user_id)
        .order_by(DebateSession.created_at.desc())
        .first()
    )

    if session is None:
        return None

    review = (
        db.query(CoachReview)
        .filter(CoachReview.session_id == session.id)
        .first()
    )

    return review