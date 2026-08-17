from fastapi import APIRouter

from app.schemas.speech_schema import (
    SpeechRequest,
    SpeechResponse
)

from app.services.speech_service import improve_speech

router = APIRouter(
    prefix="/ai",
    tags=["Speech Improver"]
)

@router.post(
    "/speech-improver",
    response_model=SpeechResponse
)
def improve(data: SpeechRequest):

    return improve_speech(data.speech)