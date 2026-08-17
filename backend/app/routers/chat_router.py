from fastapi import APIRouter

from app.schemas.chat_schema import (
    ChatRequest,
    ChatResponse
)

from app.services.chat_service import coach_chat

router = APIRouter(
    prefix="/chat",
    tags=["AI Coach"]
)

@router.post(
    "",
    response_model=ChatResponse
)
def chat(data: ChatRequest):

    return coach_chat(

        data.message,

        data.page,

        data.topic

    )