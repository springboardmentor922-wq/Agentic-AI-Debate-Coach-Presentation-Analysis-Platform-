from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.services.dashboard_service import (
    dashboard_summary,
    evaluation_history,
    evaluation_detail,
)
from app.utils.jwt_handler import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dashboard_summary(
        user_id=current_user.id,
        db=db
    )


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return evaluation_history(
        user_id=current_user.id,
        db=db
    )


@router.get("/history/{evaluation_id}")
def get_history_detail(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    evaluation = evaluation_detail(
        evaluation_id=evaluation_id,
        user_id=current_user.id,
        db=db
    )

    if not evaluation:
        raise HTTPException(
            status_code=404,
            detail="Evaluation not found"
        )

    return evaluation