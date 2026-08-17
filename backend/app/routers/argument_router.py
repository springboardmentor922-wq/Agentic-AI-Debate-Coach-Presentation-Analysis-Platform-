from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.argument_schema import (
    ArgumentRequest,
    ArgumentResponse
)

from app.services.argument_service import analyze_argument

from app.services.argument_review_service import (
    create_argument_review,
    get_argument_reviews,
    get_argument_review
)

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.post(
    "/analyze-argument",
    response_model=ArgumentResponse
)
def analyze(
    data: ArgumentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    result = analyze_argument(data.argument)

    create_argument_review(
        learner_id=current_user.id,
        argument=data.argument,
        result=result,
        db=db
    )

    return result


@router.get(
    "/argument-reviews"
)
def argument_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return get_argument_reviews(db)


@router.get(
    "/argument-reviews/{review_id}"
)
def argument_review_details(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    review = get_argument_review(
        review_id,
        db
    )

    if not review:

        raise HTTPException(
            status_code=404,
            detail="Argument review not found"
        )

    return review