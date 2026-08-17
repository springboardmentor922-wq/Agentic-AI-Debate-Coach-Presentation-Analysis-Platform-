from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.dashboard_service import (
    dashboard_summary,
    evaluation_history,
    evaluation_detail,
)
from app.utils.jwt_handler import get_current_user
from app.models.user import User
from app.services.learner_review_service import (
    get_my_review,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return dashboard_summary(current_user.id, db)


@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return evaluation_history(current_user.id, db)


@router.get("/history/{evaluation_id}")
def get_history_detail(
    evaluation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    evaluation = evaluation_detail(
        evaluation_id,
        current_user.id,
        db
    )

    if evaluation is None:
        raise HTTPException(
            status_code=404,
            detail="Evaluation not found"
        )

    return evaluation


@router.get("/coach-review")
def get_latest_review(

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    return get_my_review(

        current_user.id,

        db

    )