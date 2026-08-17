from sqlalchemy.orm import Session

from app.models.coaching_plan import CoachingPlan
from app.models.user import User


def create_coaching_plan(
    coach_id: int,
    data,
    db: Session
):

    learner = (
        db.query(User)
        .filter(
            User.id == data.learner_id
        )
        .first()
    )

    if not learner:
        return None

    plan = CoachingPlan(

        coach_id=coach_id,

        learner_id=data.learner_id,

        title=data.title,

        goal=data.goal,

        focus_area=data.focus_area,

        activities=data.activities,

        due_date=data.due_date,

        status="Active"

    )

    db.add(plan)

    db.commit()

    db.refresh(plan)

    return plan


def get_coaching_plans(
    coach_id: int,
    db: Session
):

    plans = (
        db.query(CoachingPlan)
        .filter(
            CoachingPlan.coach_id == coach_id
        )
        .order_by(
            CoachingPlan.created_at.desc()
        )
        .all()
    )

    result = []

    for plan in plans:

        learner = (
            db.query(User)
            .filter(
                User.id == plan.learner_id
            )
            .first()
        )

        result.append({

            "id": plan.id,

            "coach_id": plan.coach_id,

            "learner_id": plan.learner_id,

            "learner_name":
                learner.full_name
                if learner
                else "Unknown",

            "title": plan.title,

            "goal": plan.goal,

            "focus_area":
                plan.focus_area,

            "activities":
                plan.activities,

            "due_date":
                plan.due_date,

            "status":
                plan.status,

            "created_at":
                plan.created_at

        })

    return result


def get_coaching_plan(
    plan_id: int,
    coach_id: int,
    db: Session
):

    plan = (
        db.query(CoachingPlan)
        .filter(
            CoachingPlan.id == plan_id,
            CoachingPlan.coach_id == coach_id
        )
        .first()
    )

    if not plan:
        return None

    learner = (
        db.query(User)
        .filter(
            User.id == plan.learner_id
        )
        .first()
    )

    return {

        "id": plan.id,

        "coach_id": plan.coach_id,

        "learner_id": plan.learner_id,

        "learner_name":
            learner.full_name
            if learner
            else "Unknown",

        "title": plan.title,

        "goal": plan.goal,

        "focus_area":
            plan.focus_area,

        "activities":
            plan.activities,

        "due_date":
            plan.due_date,

        "status":
            plan.status,

        "created_at":
            plan.created_at

    }


def update_coaching_plan_status(
    plan_id: int,
    coach_id: int,
    status: str,
    db: Session
):

    plan = (
        db.query(CoachingPlan)
        .filter(
            CoachingPlan.id == plan_id,
            CoachingPlan.coach_id == coach_id
        )
        .first()
    )

    if not plan:
        return None

    plan.status = status

    db.commit()

    db.refresh(plan)

    return plan