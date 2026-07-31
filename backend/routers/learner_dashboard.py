from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.debate_history import DebateHistory

router = APIRouter(
    prefix="/learner",
    tags=["Learner Dashboard"]
)

@router.get("/dashboard")
def learner_dashboard(db: Session = Depends(get_db)):
    debates = db.query(DebateHistory).all()

    total_debates = len(debates)

    total_score = 0
    total_fallacies = 0

    for debate in debates:
        if debate.argument_score:
            total_score += debate.argument_score.get("overall_score", 0)

        if debate.fallacy_report:
            total_fallacies += 1

    average_score = (
        total_score / total_debates
        if total_debates > 0
        else 0
    )

    return {
        "total_debates": total_debates,
        "average_score": round(average_score, 2),
        "fallacies_found": total_fallacies,
        "ai_feedback": "Ready"
    }