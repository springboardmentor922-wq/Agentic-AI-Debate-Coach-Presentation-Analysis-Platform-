import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.mongodb import assistant_messages_collection
from app.db.postgres import get_db
from app.models.assistant_conversation import AssistantConversation
from app.models.user import User
from app.schemas.assistant import (
    ConversationCreate, ConversationOut, ConversationUpdate,
    MessageCreate, MessageOut, SendMessageResponse,
)
from app.services.chat_assistant import get_assistant_reply

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/assistant", tags=["AI Assistant"])


@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return (
        db.query(AssistantConversation)
        .filter(AssistantConversation.user_id == current_user.id)
        .order_by(AssistantConversation.pinned.desc(), AssistantConversation.updated_at.desc())
        .all()
    )


@router.post("/conversations", response_model=ConversationOut, status_code=201)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    convo = AssistantConversation(user_id=current_user.id, title=payload.title or "New chat")
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo


@router.patch("/conversations/{conversation_id}", response_model=ConversationOut)
def update_conversation(
    conversation_id: int,
    payload: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    convo = (
        db.query(AssistantConversation)
        .filter(AssistantConversation.id == conversation_id, AssistantConversation.user_id == current_user.id)
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(convo, field, value)
    convo.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(convo)
    return convo


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    convo = (
        db.query(AssistantConversation)
        .filter(AssistantConversation.id == conversation_id, AssistantConversation.user_id == current_user.id)
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(convo)
    db.commit()
    await assistant_messages_collection.delete_many({"conversation_id": conversation_id})


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
async def list_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    convo = (
        db.query(AssistantConversation)
        .filter(AssistantConversation.id == conversation_id, AssistantConversation.user_id == current_user.id)
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    cursor = assistant_messages_collection.find({"conversation_id": conversation_id}).sort("timestamp", 1)
    return [MessageOut(role=m["role"], content=m["content"], timestamp=m["timestamp"]) async for m in cursor]


@router.post("/conversations/{conversation_id}/messages", response_model=SendMessageResponse)
async def send_message(
    conversation_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty or whitespace only.")

    convo = (
        db.query(AssistantConversation)
        .filter(AssistantConversation.id == conversation_id, AssistantConversation.user_id == current_user.id)
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    history_cursor = assistant_messages_collection.find({"conversation_id": conversation_id}).sort("timestamp", 1)
    history = [{"role": m["role"], "content": m["content"]} async for m in history_cursor]

    now = datetime.now(timezone.utc)
    await assistant_messages_collection.insert_one(
        {"conversation_id": conversation_id, "role": "user", "content": payload.content, "timestamp": now}
    )

    try:
        reply_text = get_assistant_reply(history, payload.content)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Assistant reply failed for conversation {conversation_id}: {e}")
        raise HTTPException(status_code=502, detail=f"Assistant failed to respond: {e}")

    reply_time = datetime.now(timezone.utc)
    await assistant_messages_collection.insert_one(
        {"conversation_id": conversation_id, "role": "assistant", "content": reply_text, "timestamp": reply_time}
    )

    # Auto-title a fresh conversation from its first message — mirrors how ChatGPT-style
    # apps title chats without requiring the user to name them upfront.
    if convo.title == "New chat":
        convo.title = payload.content[:60] + ("…" if len(payload.content) > 60 else "")
    convo.updated_at = reply_time
    db.commit()

    return SendMessageResponse(
        user_message=MessageOut(role="user", content=payload.content, timestamp=now),
        assistant_message=MessageOut(role="assistant", content=reply_text, timestamp=reply_time),
    )