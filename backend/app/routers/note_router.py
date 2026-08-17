from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.user import User
from app.models.note import Note

from app.schemas.note_schema import (
    NoteCreate,
    NoteResponse
)

from app.utils.jwt_handler import get_current_user


router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


# ---------------------------------------------
# GET MY NOTES
# ---------------------------------------------

@router.get(
    "/",
    response_model=list[NoteResponse]
)
def get_my_notes(

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    return (
        db.query(Note)
        .filter(
            Note.user_id == current_user.id
        )
        .order_by(
            Note.created_at.desc()
        )
        .all()
    )


# ---------------------------------------------
# CREATE NOTE
# ---------------------------------------------

@router.post(
    "/",
    response_model=NoteResponse
)
def create_note(

    data: NoteCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    if not data.title.strip():

        raise HTTPException(
            status_code=400,
            detail="Note title is required"
        )

    if not data.content.strip():

        raise HTTPException(
            status_code=400,
            detail="Note content is required"
        )


    note = Note(

        user_id=current_user.id,

        title=data.title.strip(),

        content=data.content.strip()

    )


    db.add(note)

    db.commit()

    db.refresh(note)


    return note


# ---------------------------------------------
# DELETE NOTE
# ---------------------------------------------

@router.delete(
    "/{note_id}"
)
def delete_note(

    note_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.user_id == current_user.id
        )
        .first()
    )


    if not note:

        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )


    db.delete(note)

    db.commit()


    return {
        "message": "Note deleted successfully"
    }