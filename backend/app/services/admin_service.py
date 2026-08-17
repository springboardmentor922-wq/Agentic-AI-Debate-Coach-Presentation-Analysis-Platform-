from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.evaluation import Evaluation


def get_admin_dashboard_summary(db: Session):

    # ==========================================
    # TOTAL USERS
    # ==========================================

    total_users = (
        db.query(User)
        .count()
    )


    # ==========================================
    # USERS BY ROLE
    # ==========================================

    learners = (
        db.query(User)
        .filter(
            func.lower(User.role) == "learner"
        )
        .count()
    )


    coaches = (
        db.query(User)
        .filter(
            func.lower(User.role) == "coach"
        )
        .count()
    )


    educators = (
        db.query(User)
        .filter(
            func.lower(User.role) == "educator"
        )
        .count()
    )


    administrators = (
        db.query(User)
        .filter(
            func.lower(User.role).in_(
                ["admin", "administrator"]
            )
        )
        .count()
    )


    # ==========================================
    # DEBATE / EVALUATION DATA
    # ==========================================

    debates_conducted = (
        db.query(Evaluation)
        .count()
    )


    average_score = (
        db.query(
            func.avg(
                Evaluation.overall_percentage
            )
        )
        .scalar()
    )


    if average_score is None:
        average_score = 0


    average_score = round(
        float(average_score),
        2
    )


    # ==========================================
    # ROLE DISTRIBUTION
    # ==========================================

    role_distribution = {

        "learners": learners,

        "coaches": coaches,

        "educators": educators,

        "administrators": administrators,

    }


    # ==========================================
    # RETURN DATA
    # ==========================================

    return {

        "total_users": total_users,

        "learners": learners,

        "coaches": coaches,

        "educators": educators,

        "administrators": administrators,

        "debates_conducted": debates_conducted,

        "average_platform_score": average_score,

        "role_distribution": role_distribution,

    }