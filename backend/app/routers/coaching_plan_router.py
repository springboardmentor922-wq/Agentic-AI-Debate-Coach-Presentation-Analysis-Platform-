from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User
from app.models.coaching_plan import CoachingPlan

from app.schemas.coaching_plan_schema import (
    CoachingPlanCreate,
    CoachingPlanResponse
)

from app.services.coaching_plan_service import (
    create_coaching_plan,
    get_coaching_plans,
    get_coaching_plan,
    update_coaching_plan_status
)

from app.utils.jwt_handler import get_current_user


router = APIRouter(
    prefix="/coach/coaching-plans",
    tags=["Coaching Plans"]
)


# =========================================================
# CREATE COACHING PLAN
# =========================================================

@router.post(
    "/",
    response_model=CoachingPlanResponse
)
def create_plan(

    data: CoachingPlanCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    plan = create_coaching_plan(
        coach_id=current_user.id,
        data=data,
        db=db
    )

    if not plan:

        raise HTTPException(
            status_code=404,
            detail="Learner not found"
        )

    return {

        "id": plan.id,

        "coach_id": plan.coach_id,

        "learner_id": plan.learner_id,

        "learner_name": current_user.full_name,

        "title": plan.title,

        "goal": plan.goal,

        "focus_area": plan.focus_area,

        "activities": plan.activities,

        "due_date": plan.due_date,

        "status": plan.status,

        "created_at": plan.created_at

    }


# =========================================================
# GET PLANS FOR CURRENT LEARNER
# IMPORTANT:
# This MUST come BEFORE /{plan_id}
# =========================================================

@router.get("/my-plans")
def get_my_plans(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    plans = (
        db.query(CoachingPlan)
        .filter(
            CoachingPlan.learner_id == current_user.id
        )
        .order_by(
            CoachingPlan.created_at.desc()
        )
        .all()
    )

    return [

        {

            "id": plan.id,

            "coach_id": plan.coach_id,

            "learner_id": plan.learner_id,

            "title": plan.title,

            "goal": plan.goal,

            "focus_area": plan.focus_area,

            "activities": plan.activities,

            "due_date": plan.due_date,

            "status": plan.status,

            "created_at": plan.created_at

        }

        for plan in plans

    ]


# =========================================================
# GET ALL PLANS CREATED BY CURRENT COACH
# =========================================================

@router.get("/")
def get_plans(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return get_coaching_plans(

        coach_id=current_user.id,

        db=db

    )


# =========================================================
# GET SINGLE PLAN
# IMPORTANT:
# Keep this AFTER /my-plans
# =========================================================

@router.get("/{plan_id}")
def get_plan(

    plan_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    plan = get_coaching_plan(

        plan_id=plan_id,

        coach_id=current_user.id,

        db=db

    )

    if not plan:

        raise HTTPException(

            status_code=404,

            detail="Coaching plan not found"

        )

    return plan


# =========================================================
# UPDATE PLAN STATUS
# =========================================================

@router.patch("/{plan_id}/status")
def update_status(

    plan_id: int,

    status: str,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    plan = update_coaching_plan_status(

        plan_id=plan_id,

        coach_id=current_user.id,

        status=status,

        db=db

    )

    if not plan:

        raise HTTPException(

            status_code=404,

            detail="Coaching plan not found"

        )

    return {

        "message": "Status updated",

        "status": plan.status

    }