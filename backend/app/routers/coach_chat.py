"""
Global AI Debate Coach chatbot API — available to ALL roles (learner, debate
coach, educator, administrator), unlike the learner-only Learning Hub mentor.
Backs the floating widget mounted on every page of the frontend.
"""
import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.deps import get_current_user
from app.schemas.coach_chat import (
    ChatSessionOut,
    ChatMessageOut,
    SendMessageRequest,
    SendMessageResponse,
    MessageFeedbackRequest,
    CreateSessionRequest,
)
from app.services import coach_chat_service
from app.agents import orchestrator

router = APIRouter(prefix="/api/v1/coach-chat", tags=["Global AI Debate Coach Chatbot"])


@router.post("/sessions", response_model=ChatSessionOut, status_code=status.HTTP_201_CREATED)
async def create_session(payload: CreateSessionRequest, current_user: dict = Depends(get_current_user)):
    return await coach_chat_service.create_session(current_user["id"], payload.page_key, payload.title)


@router.get("/sessions", response_model=list[ChatSessionOut])
async def list_sessions(current_user: dict = Depends(get_current_user)):
    return await coach_chat_service.list_sessions(current_user["id"])


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    ok = await coach_chat_service.delete_session(current_user["id"], session_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageOut])
async def get_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    return await coach_chat_service.list_messages(current_user["id"], session_id)


@router.post("/sessions/{session_id}/messages", response_model=SendMessageResponse)
async def send_message_in_session(
    session_id: str, payload: SendMessageRequest, current_user: dict = Depends(get_current_user)
):
    session = await coach_chat_service.get_session(current_user["id"], session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

    user_msg = await coach_chat_service.append_message(session_id, "user", payload.text)
    history = await coach_chat_service.get_history_pairs(session_id, limit=12)
    # Drop the just-inserted user message from history (it's passed separately as {message}).
    history = history[:-1] if history else history

    result = await orchestrator.handle_message(
        user=current_user,
        page_key=payload.page_key,
        page_label=coach_chat_service.page_label(payload.page_key),
        message=payload.text,
        argument_text=payload.argument_text,
        history=history,
    )

    assistant_msg = await coach_chat_service.append_message(
        session_id, "assistant", result["reply"], result["agents_used"], result["suggested_questions"]
    )

    return SendMessageResponse(session_id=session_id, user_message=user_msg, assistant_message=assistant_msg)


@router.post("/sessions/{session_id}/messages/stream")
async def send_message_streaming(
    session_id: str, payload: SendMessageRequest, current_user: dict = Depends(get_current_user)
):
    """Server-Sent Events endpoint: streams the assistant's reply token by
    token (real streaming, not a simulated delay), then persists both the
    user and assistant messages exactly like the non-streaming endpoint."""
    session = await coach_chat_service.get_session(current_user["id"], session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

    user_msg = await coach_chat_service.append_message(session_id, "user", payload.text)
    history = await coach_chat_service.get_history_pairs(session_id, limit=12)
    history = history[:-1] if history else history

    async def event_stream():
        yield f"data: {json.dumps({'type': 'user_message', 'message': user_msg})}\n\n"
        async for event in orchestrator.stream_message(
            user=current_user,
            page_key=payload.page_key,
            page_label=coach_chat_service.page_label(payload.page_key),
            message=payload.text,
            argument_text=payload.argument_text,
            history=history,
        ):
            if event["type"] == "done":
                assistant_msg = await coach_chat_service.append_message(
                    session_id, "assistant", event["full_text"], event["agents_used"], event["suggested_questions"]
                )
                yield f"data: {json.dumps({'type': 'done', 'message': assistant_msg})}\n\n"
            else:
                yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/message", response_model=SendMessageResponse)
async def send_message_quick(payload: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    """Convenience endpoint the floating widget uses by default: auto-attaches
    to (or creates) the user's most recent session so the frontend doesn't
    have to manage session lifecycle before the first message."""
    session = await coach_chat_service.get_or_create_default_session(current_user["id"], payload.page_key)
    return await send_message_in_session(session["id"], payload, current_user)


@router.patch("/sessions/{session_id}/messages/{message_id}/feedback", response_model=ChatMessageOut)
async def feedback(
    session_id: str, message_id: str, payload: MessageFeedbackRequest, current_user: dict = Depends(get_current_user)
):
    return await coach_chat_service.set_message_feedback(current_user["id"], session_id, message_id, payload.liked)


@router.get("/agents")
async def list_agents(current_user: dict = Depends(get_current_user)):
    """Exposed so the frontend widget can show 'Active agents for this page'
    without hardcoding the map twice."""
    return {
        "page_agent_map": orchestrator.PAGE_AGENT_MAP,
        "agent_labels": orchestrator.AGENT_LABELS,
    }
