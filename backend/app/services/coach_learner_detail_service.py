import json

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.evaluation import Evaluation
from app.models.debate_session import DebateSession
from app.models.coach_review import CoachReview


def get_learner_detail(learner_id: int, db: Session):

    learner = db.query(User).filter(
        User.id == learner_id
    ).first()

    if learner is None:
        return None

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

    latest_review = None

    if latest_session:

        latest_review = (
            db.query(CoachReview)
            .filter(
                CoachReview.session_id == latest_session.id
            )
            .first()
        )

    return {

        "learner": {

            "id": learner.id,
            "name": learner.full_name,
            "email": learner.email,
            "role": learner.role

        },

        "session": latest_session,

        "evaluation": None if latest_evaluation is None else {

            "topic": latest_evaluation.topic,

            "argument": latest_evaluation.argument,

            "recording": latest_evaluation.recording_path,

            "overall_score": latest_evaluation.overall_percentage,

            "grade": latest_evaluation.grade,

            "feedback": latest_evaluation.feedback,

            "strengths": json.loads(latest_evaluation.strengths),

            "weaknesses": json.loads(latest_evaluation.weaknesses),

            "coach_tips": json.loads(latest_evaluation.coach_tips),

            "logical_fallacies": json.loads(
                latest_evaluation.logical_fallacies
            ),

            "counter_arguments": json.loads(
                latest_evaluation.counter_arguments
            ),

            "rebuttals": json.loads(
                latest_evaluation.rebuttals
            ),

            "improved_argument":
                latest_evaluation.improved_argument,

            "opening_statement":
                latest_evaluation.opening_statement,

            "closing_statement":
                latest_evaluation.closing_statement

        },

        "coach_review": latest_review

    }