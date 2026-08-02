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

        result = await debate_service.process_debate(
            session_id=session_id,
            speech_text=speech_text,
            media_file=media_file,
        )

        return result

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debate processing failed: {str(exc)}",
        )


    