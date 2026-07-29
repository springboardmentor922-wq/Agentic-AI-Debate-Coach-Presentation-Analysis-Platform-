"""
Speech Processing API

Purpose:
    Exposes REST endpoints for speech-to-text transcription.

Responsibilities:
    - Accept uploaded audio/video files.
    - Invoke the Speech Service.
    - Return standardized API responses.

Note:
    This module does not contain speech recognition logic.
"""

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
    status,
)

from app.speech.schemas.speech_schema import (
    SpeechTranscriptionData,
    SpeechTranscriptionResponse,
)
from app.speech.services.speech_service import (
    speech_service,
)

router = APIRouter(
    prefix="/speech",
    tags=["Speech Processing"],
)


@router.post(
    "/transcribe",
    response_model=SpeechTranscriptionResponse,
    status_code=status.HTTP_200_OK,
)
async def transcribe_audio(
    audio_file: UploadFile = File(...),
):
    """
    Convert uploaded audio or video into text.

    Supported formats:
    - WAV
    - MP3
    - M4A
    - MP4
    - MPEG
    - MPGA
    - WEBM
    """

    try:
        transcript = await speech_service.transcribe_audio(
            audio_file
        )

        return SpeechTranscriptionResponse(
            success=True,
            message="Speech transcribed successfully.",
            data=SpeechTranscriptionData(
                transcript=transcript
            ),
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech processing failed: {str(exc)}",
        )