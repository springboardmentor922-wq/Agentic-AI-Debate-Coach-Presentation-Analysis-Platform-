from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.evaluation import Evaluation


def get_educator_learners(db: Session):

    learners = (
        db.query(User)
        .filter(User.role == "Learner")
        .order_by(User.full_name.asc())
        .all()
    )

    result = []

    for learner in learners:

        # Get number of debates
        total_debates = (
            db.query(Evaluation)
            .filter(
                Evaluation.user_id == learner.id
            )
            .count()
        )

        # Average score
        average_score = (
            db.query(
                func.avg(
                    Evaluation.overall_percentage
                )
            )
            .filter(
                Evaluation.user_id == learner.id
            )
            .scalar()
        )

        # Latest evaluation
        latest_evaluation = (
            db.query(Evaluation)
            .filter(
                Evaluation.user_id == learner.id
            )
            .order_by(
                Evaluation.created_at.desc()
            )
            .first()
        )

        result.append({

            "id": learner.id,

            "name": learner.full_name,

            "email": learner.email,

            "total_debates": total_debates,

            "average_score": (
                round(float(average_score), 2)
                if average_score is not None
                else 0
            ),

            "latest_topic": (
                latest_evaluation.topic
                if latest_evaluation
                else None
            ),

            "latest_score": (
                latest_evaluation.overall_percentage
                if latest_evaluation
                else None
            ),

            "latest_grade": (
                latest_evaluation.grade
                if latest_evaluation
                else None
            ),

        })

    return result