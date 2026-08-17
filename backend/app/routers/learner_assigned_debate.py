from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user

from app.services.learner_assigned_debate_service import (
    get_my_assigned_debates,
)

router = APIRouter(

    prefix="/learner-assigned",

    tags=["Learner Assigned Debates"]

)


@router.get("/")
def my_debates(

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)

):

    return get_my_assigned_debates(

        current_user.id,

        db

    )