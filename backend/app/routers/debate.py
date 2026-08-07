from fastapi import APIRouter, HTTPException

from app.schemas.debate import DebateRequest, DebateResponse
from app.services.ai.debate_engine import DebateEngine
from app.services.mongodb.transcript_service import TranscriptService

router = APIRouter(
    prefix="/debate",
    tags=["Debate"]
)

engine = DebateEngine()

transcript_service = TranscriptService()


@router.get("/{session_id}/transcript")
async def get_transcript(session_id: int):

    history = await transcript_service.get_history(session_id)

    if not history:

        raise HTTPException(
            status_code=404,
            detail="Transcript not found"
        )

    return history


@router.post(
    "/analyze",
    response_model=DebateResponse
)
async def analyze_argument(
    request: DebateRequest
):

    return await engine.evaluate(
        request.argument
    )