from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):

    total_learners = db.query(User).filter(User.role_id == 1).count()

    total_coaches = db.query(User).filter(User.role_id == 2).count()

    total_educators = db.query(User).filter(User.role_id == 3).count()

    total_admins = db.query(User).filter(User.role_id == 4).count()

    return {
        "total_learners": total_learners,
        "total_coaches": total_coaches,
        "total_educators": total_educators,
        "total_admins": total_admins
    }