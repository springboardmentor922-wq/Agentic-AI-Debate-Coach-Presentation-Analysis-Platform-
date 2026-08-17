from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.utils.jwt_handler import get_current_user

from app.services.learner_feedback_service import (
    get_coach_feedbacks,
    get_coach_feedback_detail,
)

router = APIRouter(
    prefix="/learner-feedback",
    tags=["Learner Feedback"]
)


@router.get("/")
def learner_feedback(

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    return get_coach_feedbacks(

        current_user.id,

        db

    )


@router.get("/{review_id}")
def learner_feedback_detail(

    review_id: int,

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    review = get_coach_feedback_detail(

        review_id,

        current_user.id,

        db

    )

    if review is None:

        return {

            "message": "Review not found"

        }

    return review