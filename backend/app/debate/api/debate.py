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

import asyncio
import json
import logging
import traceback
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.debate.schemas.debate_schema import (
    DebateAnalysisResponse,
)
from app.debate.services.debate_service import (
    debate_service,
)

logger = logging.getLogger(__name__)

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Analyze a complete debate submission.

    Supported inputs:
        - Live microphone recording
        - Uploaded audio
        - Uploaded video
    """
    if not speech_text and media_file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either speech text or an audio/video file."
        )

    # Always use authenticated user_id from JWT
    effective_user_id = current_user.id if current_user else (user_id or 1)

    try:
        return await debate_service.process_debate(
            session_id=session_id, speech_text=speech_text, media_file=media_file,
            user_id=effective_user_id, debate_format=debate_format, difficulty=difficulty,
            user_position=user_position, current_round=current_round, db=db,
        )
    except HTTPException:
        raise
    except Exception as exc:
        traceback_str = traceback.format_exc()
        logger.error(f"Debate processing failed: {exc}\n{traceback_str}")
        print(f"ERROR in analyze_debate: {exc}\n{traceback_str}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debate processing failed: {str(exc)}"
        ) from exc



from app.ai.orchestrator.debate_graph import debate_orchestrator
from app.speech.services.speech_service import speech_service

@router.post("/analyze/stream", summary="Stream the multi-agent LangGraph debate workflow")
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
    """SSE endpoint streaming real stage progress events and results for each AI agent node."""
    if not speech_text and media_file is None:
        raise HTTPException(status_code=400, detail="Please provide either speech text or an audio/video file.")

    async def events():
        try:
            yield 'event: started\ndata: {"status": "started"}\n\n'

            if speech_text:
                transcript = speech_text
                input_type = "text"
                media_filename = None
            else:
                transcript = await speech_service.transcribe_audio(media_file)
                input_type = "media_upload"
                media_filename = media_file.filename

            yield f'event: progress\ndata: {json.dumps({"stage": "transcription", "status": "complete", "transcript": transcript})}\n\n'

            def _stream_generator():
                return list(debate_orchestrator.stream(
                    session_id=session_id, user_id=user_id, argument=transcript,
                    debate_format=debate_format, difficulty=difficulty,
                    user_position=user_position, current_round=current_round,
                    input_type=input_type, media_filename=media_filename
                ))

            chunks = await asyncio.to_thread(_stream_generator)

            accumulated_state = {}
            for chunk in chunks:
                for node_name, node_output in chunk.items():
                    accumulated_state.update(node_output)
                    event_payload = {
                        "stage": node_name,
                        "status": "complete",
                        "output": node_output if isinstance(node_output, (dict, list, str, int, float, bool)) else str(node_output)
                    }
                    yield f'event: progress\ndata: {json.dumps(event_payload, default=str)}\n\n'

            result = await debate_service.process_debate(
                session_id=session_id, speech_text=transcript, media_file=None,
                user_id=user_id, debate_format=debate_format, difficulty=difficulty,
                user_position=user_position, current_round=current_round
            )
            yield f'event: completed\ndata: {json.dumps(result.model_dump(), default=str)}\n\n'

        except Exception as exc:
            traceback_str = traceback.format_exc()
            logger.error(f"Stream debate processing failed: {exc}\n{traceback_str}")
            detail = exc.detail if isinstance(exc, HTTPException) else f"Debate processing failed: {str(exc)}"
            yield f'event: error\ndata: {json.dumps({"message": detail})}\n\n'

    return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
