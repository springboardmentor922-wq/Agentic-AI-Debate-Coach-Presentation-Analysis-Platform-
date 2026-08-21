"""
=========================================================
User Profile API

Endpoints:

POST    /profile
GET     /profile/me
PUT     /profile/me

=========================================================
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.dependencies.auth import get_current_user

from app.models.user import User

from app.schemas.profile import (
    CreateProfileRequest,
    UpdateProfileRequest,
    ProfileResponse
)

from app.services.profile_service import ProfileService


router = APIRouter(
    prefix="/profile",
    tags=["User Profile"]
)


# ==========================================================
# Create Profile
# ==========================================================

@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED
)
def create_profile(
    profile_data: CreateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        return ProfileService.create_profile(
            db,
            current_user,
            profile_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ==========================================================
# Get My Profile
# ==========================================================

@router.get(
    "/me",
    response_model=ProfileResponse
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        return ProfileService.get_profile(
            db,
            current_user
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# ==========================================================
# Update My Profile
# ==========================================================

@router.put(
    "/me",
    response_model=ProfileResponse
)
def update_my_profile(
    profile_data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        return ProfileService.update_profile(
            db,
            current_user,
            profile_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )