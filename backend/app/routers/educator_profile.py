from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User

from app.schemas.educator_profile import (
    EducatorProfileCreate,
    EducatorProfileResponse
)

from app.services.educator_profile_service import (
    create_educator_profile,
    get_educator_profile,
    update_educator_profile
)

from app.utils.jwt_handler import get_current_user

router = APIRouter(
    prefix="/educator",
    tags=["Educator Profile"]
)


@router.post("/profile", response_model=EducatorProfileResponse)
def create_profile(
    profile: EducatorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "Educator":
        raise HTTPException(
            status_code=403,
            detail="Only Educators can create profile."
        )

    educator_profile = create_educator_profile(
        current_user.id,
        profile,
        db
    )

    if educator_profile is None:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists."
        )

    return educator_profile


@router.get("/profile", response_model=EducatorProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = get_educator_profile(
        current_user.id,
        db
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found."
        )

    return profile


@router.put("/profile", response_model=EducatorProfileResponse)
def update_profile(
    profile: EducatorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    updated_profile = update_educator_profile(
        current_user.id,
        profile,
        db
    )

    if updated_profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found."
        )

    return updated_profile