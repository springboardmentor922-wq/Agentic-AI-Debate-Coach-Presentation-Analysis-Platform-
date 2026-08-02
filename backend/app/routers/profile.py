from fastapi import APIRouter, Depends,HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.profile import UserProfile
from app.schemas.profile import ProfileCreate
from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

@router.post("/",status_code=status.HTTP_201_CREATED)
def create_profile(
    profile: ProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.profile:
        raise HTTPException(
            status_code=409,
            detail="Profile already exists."
        )

    new_profile = UserProfile(
        user_id=current_user.id,
        **profile.model_dump()
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile