from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User
from app.models.coach_profile import CoachProfile

from app.schemas.coach_profile import (
    CoachProfileCreate,
    CoachProfileResponse,
)

from app.services.coach_profile import create_coach_profile

from app.utils.jwt_handler import get_current_user

router = APIRouter(
    prefix="/coach",
    tags=["Coach Profile"]
)


@router.post(
    "/profile",
    response_model=CoachProfileResponse
)
def create_profile(
    profile: CoachProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "Debate Coach":
        raise HTTPException(
            status_code=403,
            detail="Only Debate Coaches can create profile."
        )

    existing = db.query(CoachProfile).filter(
        CoachProfile.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists."
        )

    coach = create_coach_profile(
        db,
        current_user.id,
        profile
    )

    return coach


@router.get(
    "/profile",
    response_model=CoachProfileResponse
)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(CoachProfile).filter(
        CoachProfile.user_id == current_user.id
    ).first()

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile


@router.put(
    "/profile",
    response_model=CoachProfileResponse
)
def update_profile(
    profile: CoachProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    coach = db.query(CoachProfile).filter(
        CoachProfile.user_id == current_user.id
    ).first()

    if coach is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    coach.phone = profile.phone
    coach.bio = profile.bio
    coach.experience = profile.experience
    coach.qualification = profile.qualification
    coach.organization = profile.organization
    coach.specialization = profile.specialization
    coach.languages = profile.languages
    coach.availability = profile.availability
    coach.linkedin = profile.linkedin
    coach.mentor_tagline = profile.mentor_tagline

    db.commit()
    db.refresh(coach)

    return coach