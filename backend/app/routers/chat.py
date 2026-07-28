from fastapi import APIRouter
from pydantic import BaseModel

from ..services.chat_service import chat_with_ai

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    role: str
    page: str


@router.post("/")
def chat(request: ChatRequest):

    reply = chat_with_ai(
        request.message,
        request.role,
        request.page,
    )

    return {
        "reply": reply
    }