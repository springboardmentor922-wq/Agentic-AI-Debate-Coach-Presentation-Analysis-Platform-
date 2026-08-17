from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user

from app.services.educator_learner_detail_service import (
    get_educator_learner_detail,
    get_learner_evaluation_detail
)


router = APIRouter(
    prefix="/educator",
    tags=["Educator Learner Details"]
)


@router.get("/learners/{learner_id}")
def get_learner_detail(

    learner_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # Only educators can access this
    if current_user.role != "Educator":

        raise HTTPException(
            status_code=403,
            detail="Educator access required"
        )


    learner = get_educator_learner_detail(
        learner_id,
        db
    )


    if learner is None:

        raise HTTPException(
            status_code=404,
            detail="Learner not found"
        )


    return learner


@router.get(
    "/learners/{learner_id}/evaluations/{evaluation_id}"
)
def get_evaluation_detail(

    learner_id: int,

    evaluation_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    if current_user.role != "Educator":

        raise HTTPException(
            status_code=403,
            detail="Educator access required"
        )

    evaluation = get_learner_evaluation_detail(
        learner_id,
        evaluation_id,
        db
    )

    if evaluation is None:

        raise HTTPException(
            status_code=404,
            detail="Evaluation not found"
        )

    return evaluation