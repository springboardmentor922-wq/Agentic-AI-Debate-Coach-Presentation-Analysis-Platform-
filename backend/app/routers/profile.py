from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from .. import crud, schemas

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.post("/")
def create_profile(
    profile: schemas.ProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return crud.create_profile(
        db,
        profile,
        current_user["id"]
    )
from fastapi import HTTPException

@router.get("/")
def get_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    profile = crud.get_profile(
        db,
        current_user["id"]
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile


@router.put("/")
def update_profile(
    profile: schemas.ProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    updated = crud.update_profile(
        db,
        current_user["id"],
        profile
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return updated