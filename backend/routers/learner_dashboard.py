from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.debate_history import DebateHistory
from models.coach_assignment import CoachAssignment
from models.user import User
from models.learning_activity import LearningActivity

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
@router.get("/my-coach")
def get_my_coach(db: Session = Depends(get_db)):

    assignment = db.query(CoachAssignment).first()

    if not assignment:
        return {
            "coach_name": "Not Assigned"
        }

    coach = (
        db.query(User)
        .filter(User.user_id == assignment.coach_id)
        .first()
    )

    if not coach:
        return {
            "coach_name": "Not Found"
        }

    return {
        "coach_name": coach.full_name
    }
@router.get("/activities")
def get_learning_activities(db: Session = Depends(get_db)):

    activities = (
        db.query(LearningActivity)
        .order_by(LearningActivity.activity_id.desc())
        .all()
    )

    result = []

    for activity in activities:
        result.append({
            "activity_id": activity.activity_id,
            "title": activity.title,
            "activity_type": activity.activity_type,
            "status": activity.status,
            "score": activity.score
        })

    return result