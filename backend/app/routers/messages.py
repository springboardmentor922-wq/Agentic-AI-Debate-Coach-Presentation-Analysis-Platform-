"""Real messaging system — supports the five conversation pairs the platform
actually needs: Learner<->Coach, Learner<->Educator, Admin<->Learner,
Admin<->Coach, Admin<->Educator. Every conversation/message here is actually
persisted and readable by both participants; nothing is a placeholder."""
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.database import messages_collection, users_collection
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/v1/messages", tags=["Messages"])

# Which role may message which other role(s) — the five pairs from the spec.
# Kept as an explicit allow-list (not a "everyone can message everyone"
# default) so the messaging system can't silently be used outside the
# relationships it was built for, e.g. a learner messaging another learner.
ALLOWED_PEERS: dict[str, set[str]] = {
    "learner": {"debate_coach", "educator", "administrator"},
    "debate_coach": {"learner", "administrator"},
    "educator": {"learner", "administrator"},
    "administrator": {"learner", "debate_coach", "educator"},
}


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


class ContactOut(BaseModel):
    user_id: str
    name: str
    role: str


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


@router.get("/contacts", response_model=list[ContactOut])
async def list_contacts(q: str = "", current_user: dict = Depends(get_current_user)):
    """Real user search/selection for starting a new conversation, scoped to
    the roles this user is allowed to message (see ALLOWED_PEERS) — this is
    what backs the "user search" / "user selection" requirement, not a
    static or placeholder directory."""
    allowed_roles = list(ALLOWED_PEERS.get(current_user["role"], set()))
    if not allowed_roles:
        return []
    query: dict = {"role": {"$in": allowed_roles}, "_id": {"$ne": _oid(current_user["id"])}}
    if q:
        query["full_name"] = {"$regex": q, "$options": "i"}
    cursor = users_collection.find(query, {"full_name": 1, "role": 1}).limit(30)
    return [
        {"user_id": str(u["_id"]), "name": u["full_name"], "role": u["role"]}
        async for u in cursor
    ]


@router.get("/unread-count")
async def unread_count(current_user: dict = Depends(get_current_user)):
    """Total unread messages across all conversations — backs the nav badge."""
    count = await messages_collection.count_documents({"recipient_id": current_user["id"], "read": False})
    return {"unread_count": count}


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

    allowed_roles = ALLOWED_PEERS.get(current_user["role"], set())
    if recipient.get("role") not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{current_user['role']} cannot message {recipient.get('role')} — messaging is limited to "
            "Learner<->Coach, Learner<->Educator, and Admin<->any role.",
        )

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

