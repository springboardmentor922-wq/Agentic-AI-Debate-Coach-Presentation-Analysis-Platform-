from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.services.debate_sessions_coach_service import (
    get_all_debate_sessions
)

router = APIRouter(

    prefix="/coach/debate-sessions",

    tags=["Coach Debate Sessions"]

)


@router.get("/")
def sessions(

    db: Session = Depends(get_db)

):

    return get_all_debate_sessions(db)