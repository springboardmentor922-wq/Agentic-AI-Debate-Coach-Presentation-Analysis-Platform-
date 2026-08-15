from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.debate_history import DebateHistory
from models.coach_assignment import CoachAssignment
from models.learning_activity import LearningActivity

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
@router.get("/monitoring")
def learner_monitoring(db: Session = Depends(get_db)):

    learners = db.query(User).filter(
        User.role_id == 1
    ).all()

    monitoring_data = []

    for learner in learners:

        assignment = (
            db.query(CoachAssignment)
            .filter(
                CoachAssignment.learner_id == learner.user_id
            )
            .first()
        )

        coach_name = "Not Assigned"

        if assignment:

            coach = (
                db.query(User)
                .filter(
                    User.user_id == assignment.coach_id
                )
                .first()
            )

            if coach:
                coach_name = coach.full_name

        activity_count = (
            db.query(LearningActivity)
            .filter(
                LearningActivity.learner_id == learner.user_id
            )
            .count()
        )

        status = "Active"

        if activity_count == 0:
            status = "Needs Attention"

        monitoring_data.append({
            "learner_name": learner.full_name,
            "coach_name": coach_name,
            "activities_completed": activity_count,
            "status": status
        })

    return monitoring_data