from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User
from app.models.debate_session import DebateSession
from app.models.coach_review import CoachReview

from app.schemas.coach_review import (
    CoachReviewCreate,
    CoachReviewResponse,
)
from app.services.learner_review_service import get_my_review
from app.utils.jwt_handler import get_current_user

router = APIRouter(
    prefix="/coach-review",
    tags=["Coach Reviews"]
)


@router.get("/pending")
def pending_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return db.query(DebateSession).filter(
        DebateSession.status == "Pending Review"
    ).all()


@router.get("/{session_id}")
def review_details(
    session_id: int,
    db: Session = Depends(get_db),
):

    session = db.query(DebateSession).filter(
        DebateSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return session


@router.post("/{session_id}")
def submit_review(

    session_id: int,

    review: CoachReviewCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    coach_review = CoachReview(

        session_id=session_id,

        coach_id=current_user.id,

        grammar=review.grammar,

        logic=review.logic,

        confidence=review.confidence,

        communication=review.communication,

        overall=review.overall,

        strengths=review.strengths,

        improvements=review.improvements,

        feedback=review.feedback,

    )

    db.add(coach_review)

    session = db.query(DebateSession).filter(
        DebateSession.id == session_id
    ).first()

    session.status = "Reviewed"

    session.coach_reviewed = "Yes"

    db.commit()

    db.refresh(coach_review)

    return coach_review


@router.get("/my-review")
def my_review(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_my_review(current_user.id, db)