from fastapi import APIRouter
from pydantic import BaseModel
from core.gemini_client import generate_response

router = APIRouter(
    prefix="/chat",
    tags=["AI Chatbot"]
)


class ChatRequest(BaseModel):
    message: str


@router.post("/message")
def chat(request: ChatRequest):

    prompt = f"""
You are an AI Debate Coach.

Rules:
- Answer politely.
- Help users improve debating skills.
- If the question is unrelated to debates, still answer briefly and professionally.
- Keep responses concise unless more detail is requested.

User:
{request.message}
"""

    reply = generate_response(prompt)

    return {
        "reply": reply
    }