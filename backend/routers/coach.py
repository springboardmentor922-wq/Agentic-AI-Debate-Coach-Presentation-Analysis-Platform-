from fastapi import APIRouter
from sqlalchemy.orm import Session
from database import SessionLocal
from models.coach_assignment import CoachAssignment
from models.user import User

router = APIRouter(prefix="/coach", tags=["Coach"])


@router.get("/assigned-learners")
def get_assigned_learners():

    db: Session = SessionLocal()

    try:

        learners = (
            db.query(
                CoachAssignment.assignment_id,
                User.full_name
            )
            .join(
                User,
                CoachAssignment.learner_id == User.user_id
            )
            .all()
        )

        return [
            {
                "assignment_id": learner.assignment_id,
                "full_name": learner.full_name
            }
            for learner in learners
        ]

    finally:
        db.close()