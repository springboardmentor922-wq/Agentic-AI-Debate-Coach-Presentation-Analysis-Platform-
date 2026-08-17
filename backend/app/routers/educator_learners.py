from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.utils.jwt_handler import get_current_user

from app.services.educator_learners_service import (
    get_educator_learners
)


router = APIRouter(
    prefix="/educator/learners",
    tags=["Educator Learners"]
)


@router.get("/")
def get_learners_for_educator(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "Educator":

        raise HTTPException(
            status_code=403,
            detail="Educator access required"
        )

    return get_educator_learners(db)