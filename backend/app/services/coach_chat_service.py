"""Persistence layer for the global AI Debate Coach chatbot: sessions
(threads) + messages, so the widget can show real chat history, support
New Chat / Delete Chat, and give the orchestrator real prior-turn context —
exactly like the reference's "Conversation Memory / Session Memory /
Chat History" feature list."""
from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.core.database import coach_chat_sessions_collection, coach_chat_messages_collection

PAGE_LABELS: dict[str, str] = {
    "learner_dashboard": "Learner Dashboard",
    "my_debates": "My Debates",
    "debate_session": "Debate Session",
    "practice_topics": "Practice Topics",
    "argument_analyzer": "Argument Analyzer",
    "fallacy_detector": "Fallacy Detector",
    "counterargument_generator": "Counterargument Generator",
    "presentation_analysis": "Presentation Analysis",
    "performance_dashboard": "Performance Dashboard",
    "feedback_coaching": "Feedback & Coaching",
    "coach_dashboard": "Coach Dashboard",
    "coach_evaluation_queue": "AI Evaluation Queue",
    "educator_dashboard": "Educator Dashboard",
    "educator_class_analytics": "Class Analytics",
    "admin_dashboard": "Admin Dashboard",
    "help_support": "Help & Support",
    "general": "the platform",
}


def page_label(page_key: str) -> str:
    return PAGE_LABELS.get(page_key, page_key.replace("_", " ").title())


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id")


async def _serialize_session(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


async def _serialize_message(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_session(user_id: str, page_key: str | None, title: str | None) -> dict:
    now = datetime.utcnow().isoformat()
    doc = {
        "user_id": user_id,
        "title": title or f"Chat about {page_label(page_key or 'general')}",
        "page_key": page_key or "general",
        "created_at": now,
        "updated_at": now,
        "last_message_preview": None,
    }
    result = await coach_chat_sessions_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return await _serialize_session(doc)


async def list_sessions(user_id: str) -> list[dict]:
    cursor = coach_chat_sessions_collection.find({"user_id": user_id}).sort("updated_at", -1).limit(50)
    return [await _serialize_session(doc) async for doc in cursor]


async def get_session(user_id: str, session_id: str) -> dict | None:
    doc = await coach_chat_sessions_collection.find_one({"_id": _oid(session_id), "user_id": user_id})
    return await _serialize_session(doc) if doc else None


async def delete_session(user_id: str, session_id: str) -> bool:
    result = await coach_chat_sessions_collection.delete_one({"_id": _oid(session_id), "user_id": user_id})
    if result.deleted_count:
        await coach_chat_messages_collection.delete_many({"session_id": session_id})
        return True
    return False


async def get_or_create_default_session(user_id: str, page_key: str) -> dict:
    """Used by the lightweight /message endpoint so the widget can be used
    without the caller managing session lifecycle explicitly."""
    existing = await coach_chat_sessions_collection.find_one(
        {"user_id": user_id}, sort=[("updated_at", -1)]
    )
    if existing:
        return await _serialize_session(existing)
    return await create_session(user_id, page_key, None)


async def list_messages(user_id: str, session_id: str, limit: int = 100) -> list[dict]:
    session = await get_session(user_id, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    cursor = coach_chat_messages_collection.find({"session_id": session_id}).sort("created_at", 1).limit(limit)
    return [await _serialize_message(doc) async for doc in cursor]


async def get_history_pairs(session_id: str, limit: int = 12) -> list[tuple[str, str]]:
    """Last N messages as (role, text) tuples for the LLM, oldest first."""
    cursor = coach_chat_messages_collection.find({"session_id": session_id}).sort("created_at", -1).limit(limit)
    docs = [doc async for doc in cursor]
    docs.reverse()
    return [("human" if d["role"] == "user" else "ai", d["text"]) for d in docs]


async def append_message(
    session_id: str,
    role: str,
    text: str,
    agents_used: list[str] | None = None,
    suggested_questions: list[str] | None = None,
) -> dict:
    now = datetime.utcnow().isoformat()
    doc = {
        "session_id": session_id,
        "role": role,
        "text": text,
        "agents_used": agents_used or [],
        "suggested_questions": suggested_questions or [],
        "liked": None,
        "created_at": now,
    }
    result = await coach_chat_messages_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    await coach_chat_sessions_collection.update_one(
        {"_id": _oid(session_id)},
        {"$set": {"updated_at": now, "last_message_preview": text[:120]}},
    )
    return await _serialize_message(doc)


async def set_message_feedback(user_id: str, session_id: str, message_id: str, liked: bool | None) -> dict:
    session = await get_session(user_id, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")
    result = await coach_chat_messages_collection.find_one_and_update(
        {"_id": _oid(message_id), "session_id": session_id},
        {"$set": {"liked": liked}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return await _serialize_message(result)
