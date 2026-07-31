from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.debate_history import DebateHistory
from models.user import User

router = APIRouter(
    prefix="/coach",
    tags=["Coach Dashboard"]
)

@router.get("/dashboard")
def coach_dashboard(db: Session = Depends(get_db)):

    total_students = db.query(User).filter(
        User.role_id == 1
    ).count()

    total_debates = db.query(DebateHistory).count()

    return {
        "total_students": total_students,
        "total_debates": total_debates,
        "coach_status": "Active"
    }