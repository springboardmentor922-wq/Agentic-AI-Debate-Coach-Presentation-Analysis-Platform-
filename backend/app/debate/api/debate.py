"""
Debate Processing API

Purpose:
    Exposes REST endpoints for complete debate processing.

Responsibilities:
    - Accept live recordings, audio uploads, and video uploads.
    - Invoke the Debate Processing Service.
    - Return a unified AI debate analysis response.

Supported Input Methods:
    - Live Speech Recording
    - Audio Upload
    - Video Upload

Note:
    This API acts as the entry point for the complete
    debate workflow.
"""

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
import json

from app.debate.schemas.debate_schema import (
    DebateAnalysisResponse,
)
from app.debate.services.debate_service import (
    debate_service,
)


router = APIRouter(
    prefix="/debate",
    tags=["Debate Processing"],
)


@router.post(
    "/analyze",
    response_model=DebateAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
async def analyze_debate(
    session_id: int = Form(...),

    speech_text: str | None = Form(None),

    media_file: UploadFile | None = File(None),
    user_id: int | None = Form(None),
    debate_format: str = Form("One-on-One"),
    difficulty: str = Form("Intermediate"),
    user_position: str = Form("Affirmative"),
    current_round: int = Form(1),
):
    """
    Analyze a complete debate submission.

    Supported inputs:
        • Live microphone recording
        • Uploaded audio
        • Uploaded video
    """
    if not speech_text and media_file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either speech text or an audio/video file."
        )

    try:
        return await debate_service.process_debate(
            session_id=session_id, speech_text=speech_text, media_file=media_file,
            user_id=user_id, debate_format=debate_format, difficulty=difficulty,
            user_position=user_position, current_round=current_round,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Debate processing failed. Please try again.") from exc


@router.post("/analyze/stream", summary="Stream the unified LangGraph debate workflow")
async def stream_analyze_debate(
    session_id: int = Form(...),
    speech_text: str | None = Form(None),
    media_file: UploadFile | None = File(None),
    user_id: int | None = Form(None),
    debate_format: str = Form("One-on-One"),
    difficulty: str = Form("Intermediate"),
    user_position: str = Form("Affirmative"),
    current_round: int = Form(1),
):
    """SSE boundary for the same graph workflow; no agent-specific API is exposed."""
    async def events():
        yield "event: started\ndata: {\"status\": \"started\"}\n\n"
        yield "event: progress\ndata: {\"stage\": \"transcript\", \"status\": \"processing\"}\n\n"
        try:
            if not speech_text and media_file is None:
                raise HTTPException(status_code=400, detail="Please provide either speech text or an audio/video file.")
            yield "event: progress\ndata: {\"stage\": \"debate_workflow\", \"status\": \"processing\"}\n\n"
            result = await debate_service.process_debate(session_id=session_id, speech_text=speech_text, media_file=media_file, user_id=user_id, debate_format=debate_format, difficulty=difficulty, user_position=user_position, current_round=current_round)
            yield "event: progress\ndata: {\"stage\": \"persistence\", \"status\": \"complete\"}\n\n"
            yield f"event: completed\ndata: {json.dumps(result.model_dump(), default=str)}\n\n"
        except Exception as exc:
            detail = exc.detail if isinstance(exc, HTTPException) else "Debate processing failed. Please try again."
            yield f"event: error\ndata: {json.dumps({'message': detail})}\n\n"
    return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


