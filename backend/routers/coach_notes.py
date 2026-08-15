from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db

from models.coach_note import CoachNote
from models.user import User

router = APIRouter(
    prefix="/coach-notes",
    tags=["Coach Notes"]
)

@router.get("/")
def get_notes(db: Session = Depends(get_db)):

    notes = db.query(CoachNote).all()

    result = []

    for note in notes:

        learner = (
            db.query(User)
            .filter(
                User.user_id == note.learner_id
            )
            .first()
        )

        result.append({
            "note_id": note.note_id,
            "learner_name": learner.full_name if learner else "Unknown",
            "note": note.note
        })

    return result