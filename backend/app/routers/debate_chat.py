from fastapi import APIRouter

from app.schemas.debate_chat_schema import (
    DebateChatRequest,
    DebateChatResponse,
)

from app.services.debate_chat_service import ai_debate

router = APIRouter(
    prefix="/ai",
    tags=["AI Debate"]
)


@router.post(
    "/debate",
    response_model=DebateChatResponse
)
def debate(data: DebateChatRequest):

    return ai_debate(
        data.topic,
        data.user_position,
        data.user_argument,
    )