"""
Chat API

Purpose:
    Exposes a page-aware chatbot endpoint for the frontend assistant.
"""

from fastapi import APIRouter, HTTPException, status

from app.schemas.chat import ChatAPIResponse, ChatRequest
from app.services.chat_service import chat_service


router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"],
)


@router.post(
    "",
    response_model=ChatAPIResponse,
    status_code=status.HTTP_200_OK,
)
def send_chat_message(request: ChatRequest):
    try:
        outputs = chat_service.chat(request)

        return ChatAPIResponse(
            success=True,
            message="Chat response generated successfully.",
            data=outputs,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat failed: {str(exc)}",
        )
