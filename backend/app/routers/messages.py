"""Real 1:1 direct messaging — used by the Coach and Educator dashboards'
"Messages" sidebar section to talk to their learners. Not a fabricated
inbox: every conversation/message here is actually persisted and readable
by both participants."""
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.database import messages_collection, users_collection
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/messages", tags=["Messages"])


class MessageIn(BaseModel):
    recipient_id: str
    text: str = Field(min_length=1)


class MessageOut(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    recipient_id: str
    text: str
    read: bool
    created_at: str


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id")


async def _serialize(doc: dict) -> dict:
    sender = await users_collection.find_one({"_id": _oid(doc["sender_id"])})
    doc["id"] = str(doc.pop("_id"))
    doc["sender_name"] = sender["full_name"] if sender else "Unknown"
    return doc


@router.get("/conversations")
async def list_conversations(current_user: dict = Depends(get_current_user)):
    """One row per person the current user has exchanged messages with,
    with a real last-message preview and unread count."""
    uid = current_user["id"]
    cursor = messages_collection.find({"$or": [{"sender_id": uid}, {"recipient_id": uid}]}).sort("created_at", -1)
    partners: dict[str, dict] = {}
    async for m in cursor:
        other_id = m["recipient_id"] if m["sender_id"] == uid else m["sender_id"]
        if other_id not in partners:
            other = await users_collection.find_one({"_id": _oid(other_id)})
            unread = await messages_collection.count_documents({"sender_id": other_id, "recipient_id": uid, "read": False})
            partners[other_id] = {
                "user_id": other_id,
                "name": other["full_name"] if other else "Unknown",
                "role": other.get("role") if other else None,
                "last_message": m["text"],
                "last_message_at": m["created_at"],
                "unread_count": unread,
            }
    return list(partners.values())


@router.get("/thread/{other_user_id}", response_model=list[MessageOut])
async def get_thread(other_user_id: str, current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    cursor = messages_collection.find(
        {"$or": [
            {"sender_id": uid, "recipient_id": other_user_id},
            {"sender_id": other_user_id, "recipient_id": uid},
        ]}
    ).sort("created_at", 1)
    messages = [await _serialize(doc) async for doc in cursor]
    await messages_collection.update_many(
        {"sender_id": other_user_id, "recipient_id": uid, "read": False}, {"$set": {"read": True}}
    )
    return messages


@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(payload: MessageIn, current_user: dict = Depends(get_current_user)):
    recipient = await users_collection.find_one({"_id": _oid(payload.recipient_id)})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    doc = {
        "sender_id": current_user["id"],
        "recipient_id": payload.recipient_id,
        "text": payload.text,
        "read": False,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await messages_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return await _serialize(doc)
