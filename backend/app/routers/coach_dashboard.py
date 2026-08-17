from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.coach_dashboard_service import (
    coach_dashboard_summary,
    recent_learner_activity,
)
from app.services.coach_learner_service import (
    get_all_learners,
)
from app.services.coach_learner_detail_service import (
    get_learner_detail,
)

router = APIRouter(
    prefix="/coach/dashboard",
    tags=["Coach Dashboard"]
)


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db)
):
    return coach_dashboard_summary(db)


@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(get_db)
):
    return recent_learner_activity(db)

@router.get("/learners")
def coach_learners(
    db: Session = Depends(get_db)
):
    return get_all_learners(db)


@router.get("/learner/{learner_id}")
def learner_detail(
    learner_id: int,
    db: Session = Depends(get_db)
):
    return get_learner_detail(
        learner_id,
        db
    )