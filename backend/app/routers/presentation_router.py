from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.schemas.presentation_schema import (
    PresentationRequest,
    PresentationResponse
)

from app.services.presentation_service import (
    analyze_presentation
)

from app.services.presentation_review_service import (
    create_presentation_review,
    get_presentation_reviews,
    get_presentation_review
)

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user


router = APIRouter(
    prefix="/ai",
    tags=["Presentation Analysis"]
)


@router.post(
    "/analyze-presentation",
    response_model=PresentationResponse
)
def analyze(
    data: PresentationRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    result = analyze_presentation(
        data.presentation
    )

    create_presentation_review(
        learner_id=current_user.id,
        presentation=data.presentation,
        result=result,
        db=db
    )

    return result


@router.get(
    "/presentation-reviews"
)
def presentation_reviews(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    return get_presentation_reviews(db)


@router.get(
    "/presentation-reviews/{review_id}"
)
def presentation_review_details(
    review_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    review = get_presentation_review(
        review_id,
        db
    )

    if not review:

        raise HTTPException(
            status_code=404,
            detail="Presentation review not found"
        )

    return review