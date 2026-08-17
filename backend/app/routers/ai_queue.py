from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.ai_queue_service import get_pending_evaluations

router = APIRouter(
    prefix="/coach/evaluation-queue",
    tags=["AI Evaluation Queue"]
)


@router.get("/")
def get_evaluation_queue(
    db: Session = Depends(get_db)
):

    return get_pending_evaluations(db)