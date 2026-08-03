from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai.presentation_engine import PresentationEngine

router = APIRouter(
    prefix="/presentation",
    tags=["Presentation"]
)

engine = PresentationEngine()

history = []


class TranscriptRequest(BaseModel):
    transcript: str


@router.post("/analyze")
async def analyze(request: TranscriptRequest):

    result = await engine.analyze(
        request.transcript
    )

    history.append(result)

    return result


@router.get("/history")
async def get_history():

    return history