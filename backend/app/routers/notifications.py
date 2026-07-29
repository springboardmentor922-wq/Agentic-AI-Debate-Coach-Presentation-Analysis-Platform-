"""
Notification & Engagement System (Module 12, Milestone 3 Part 12).
Real, MongoDB-backed notifications with a working unread count — no
placeholder/mock notification lists.
"""
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.database import notifications_collection
from app.core.deps import get_current_user
from app.schemas.debate_simulation import NotificationOut, NotificationType

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


async def create_notification(
    user_id: str,
    type_: str,
    title: str,
    message: str,
    related_session_id: str | None = None,
) -> dict:
    """Internal helper other services/routers call to raise a real notification."""
    doc = {
        "user_id": user_id,
        "type": type_,
        "title": title,
        "message": message,
        "read": False,
        "related_session_id": related_session_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await notifications_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    unread_only: bool = Query(default=False),
    limit: int = Query(default=30, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    query = {"user_id": current_user["id"]}
    if unread_only:
        query["read"] = False
    cursor = notifications_collection.find(query).sort("created_at", -1).limit(limit)
    return [
        NotificationOut(
            id=str(doc["_id"]), user_id=doc["user_id"], type=doc["type"], title=doc["title"],
            message=doc["message"], read=doc.get("read", False), created_at=doc["created_at"],
            related_session_id=doc.get("related_session_id"),
        )
        async for doc in cursor
    ]


@router.get("/unread-count")
async def unread_count(current_user: dict = Depends(get_current_user)):
    count = await notifications_collection.count_documents({"user_id": current_user["id"], "read": False})
    return {"unread_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def mark_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(notification_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid notification id")

    doc = await notifications_collection.find_one({"_id": oid})
    if not doc or doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=404, detail="Notification not found")

    await notifications_collection.update_one({"_id": oid}, {"$set": {"read": True}})
    doc["read"] = True
    return NotificationOut(
        id=str(doc["_id"]), user_id=doc["user_id"], type=doc["type"], title=doc["title"],
        message=doc["message"], read=True, created_at=doc["created_at"],
        related_session_id=doc.get("related_session_id"),
    )


@router.patch("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    result = await notifications_collection.update_many(
        {"user_id": current_user["id"], "read": False}, {"$set": {"read": True}}
    )
    return {"marked_read": result.modified_count}
