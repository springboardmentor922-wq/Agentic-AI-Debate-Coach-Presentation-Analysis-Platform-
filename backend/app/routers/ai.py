from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai.gemini_service import GeminiService

router = APIRouter(
    prefix="/ai",
    tags=["AI Coach"]
)

gemini = GeminiService()


class ChatRequest(BaseModel):
    message: str
    page: str = "general"


@router.post("/chat")
async def chat(request: ChatRequest):

    prompt = f"""
You are Cortexa AI Coach.

Current Page:
{request.page}

User Question:
{request.message}

Instructions:

- If the page is Dashboard:
Provide learning guidance.

- If the page is Debate:
Help improve debating.

- If the page is Analytics:
Explain statistics.

- If the page is Recommendations:
Explain recommendations.

- Keep answers under 180 words.
- Be friendly.
- Use bullet points whenever useful.
"""

    reply = await gemini.generate(prompt)

    return {
        "reply": reply
    }