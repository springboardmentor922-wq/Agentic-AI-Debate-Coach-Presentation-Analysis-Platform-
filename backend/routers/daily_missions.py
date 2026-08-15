from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.daily_mission import DailyMission

router = APIRouter(
    prefix="/missions",
    tags=["Daily Missions"]
)

@router.get("/")
def get_missions(
    db: Session = Depends(get_db)
):

    missions = db.query(
        DailyMission
    ).all()

    return missions