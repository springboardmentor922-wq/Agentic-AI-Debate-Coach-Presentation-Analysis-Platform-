"""My Notes — simple personal note-taking for learners, referenced in the
mentor's sidebar reference (Learner Dashboard → Resources → My Notes)."""
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.database import learner_notes_collection
from app.core.deps import require_roles
from app.schemas.user import UserRole

router = APIRouter(prefix="/api/v1/notes", tags=["My Notes"])


class NoteIn(BaseModel):
    title: str = Field(min_length=1, max_length=140)
    content: str = ""
    tag: str | None = None  # e.g. "Debate Prep", "Key Points", "Ideas"


class NoteOut(NoteIn):
    id: str
    created_at: str
    updated_at: str


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id")


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("", response_model=list[NoteOut])
async def list_notes(current_user: dict = Depends(require_roles(UserRole.learner))):
    cursor = learner_notes_collection.find({"user_id": current_user["id"]}).sort("updated_at", -1)
    return [_serialize(doc) async for doc in cursor]


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(payload: NoteIn, current_user: dict = Depends(require_roles(UserRole.learner))):
    now = datetime.utcnow().isoformat()
    doc = {**payload.model_dump(), "user_id": current_user["id"], "created_at": now, "updated_at": now}
    result = await learner_notes_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


@router.patch("/{note_id}", response_model=NoteOut)
async def update_note(note_id: str, payload: NoteIn, current_user: dict = Depends(require_roles(UserRole.learner))):
    updated = await learner_notes_collection.find_one_and_update(
        {"_id": _oid(note_id), "user_id": current_user["id"]},
        {"$set": {**payload.model_dump(), "updated_at": datetime.utcnow().isoformat()}},
        return_document=True,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return _serialize(updated)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, current_user: dict = Depends(require_roles(UserRole.learner))):
    result = await learner_notes_collection.delete_one({"_id": _oid(note_id), "user_id": current_user["id"]})
    if not result.deleted_count:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
