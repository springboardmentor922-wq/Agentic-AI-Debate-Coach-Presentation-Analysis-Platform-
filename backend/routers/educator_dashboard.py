from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.debate_history import DebateHistory

router = APIRouter(
    prefix="/educator",
    tags=["Educator Dashboard"]
)

@router.get("/dashboard")
def educator_dashboard(db: Session = Depends(get_db)):

    total_students = db.query(User).filter(
        User.role_id == 1
    ).count()

    total_debates = db.query(DebateHistory).count()

    total_coaches = db.query(User).filter(
        User.role_id == 2
    ).count()

    return {
        "total_students": total_students,
        "total_coaches": total_coaches,
        "total_debates": total_debates
    }