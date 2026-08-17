from sqlalchemy.orm import Session

from app.models.user import User
from app.models.coach_review import CoachReview
from app.models.debate_session import DebateSession


def get_coach_feedbacks(learner_id: int, db: Session):

    sessions = (
        db.query(DebateSession)
        .filter(DebateSession.learner_id == learner_id)
        .all()
    )

    feedbacks = []

    for session in sessions:

        review = (
            db.query(CoachReview)
            .filter(CoachReview.session_id == session.id)
            .first()
        )

        if review:

            coach = (
                db.query(User)
                .filter(User.id == review.coach_id)
                .first()
            )

            feedbacks.append({

                "review_id": review.id,

                "session_id": session.id,

                "topic": session.topic,

                "coach_name": coach.full_name if coach else "Unknown",

                "overall": review.overall,

                "reviewed_at": review.reviewed_at,

                "status": session.status,

            })

    return feedbacks

def get_coach_feedback_detail(
    review_id: int,
    learner_id: int,
    db: Session
):

    review = (
        db.query(CoachReview)
        .filter(CoachReview.id == review_id)
        .first()
    )

    if review is None:
        return None

    session = (
        db.query(DebateSession)
        .filter(DebateSession.id == review.session_id)
        .first()
    )

    if session is None:
        return None

    # Security check: learner should only access their own reviews
    if session.learner_id != learner_id:
        return None

    coach = (
        db.query(User)
        .filter(User.id == review.coach_id)
        .first()
    )

    return {

        "review_id": review.id,

        "topic": session.topic,

        "coach_name": coach.full_name if coach else "Unknown",

        "grammar": review.grammar,

        "logic": review.logic,

        "confidence": review.confidence,

        "communication": review.communication,

        "overall": review.overall,

        "strengths": review.strengths,

        "improvements": review.improvements,

        "feedback": review.feedback,

        "reviewed_at": review.reviewed_at,

    }