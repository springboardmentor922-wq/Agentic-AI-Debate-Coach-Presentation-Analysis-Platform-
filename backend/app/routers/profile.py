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