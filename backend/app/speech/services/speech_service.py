"""
Speech Processing Service

Purpose:
    Provides speech-to-text functionality using the Whisper model.

Responsibilities:
    - Load the Whisper model.
    - Validate uploaded audio files.
    - Convert speech into text.
    - Return the transcription.

Note:
    This service contains business logic only.
    It does not expose API endpoints or perform AI analysis.
"""

from pathlib import Path
import tempfile

import whisper
from fastapi import HTTPException, UploadFile, status


class SpeechService:
    """
    Service responsible for speech-to-text transcription.
    """

    ALLOWED_EXTENSIONS = {
        ".wav",
        ".mp3",
        ".m4a",
        ".mp4",
        ".mpeg",
        ".mpga",
        ".webm",
    }

    def __init__(self):
        """
        Load the Whisper model once during application startup.
        """

        self.model = whisper.load_model("base")

    async def transcribe_audio(
        self,
        audio_file: UploadFile,
    ) -> str:
        """
        Convert uploaded audio into text.

        Args:
            audio_file:
                Uploaded audio or video file.

        Returns:
            Transcribed text.
        """

        extension = Path(audio_file.filename).suffix.lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unsupported file format. "
                    "Supported formats: "
                    ".wav, .mp3, .m4a, .mp4, "
                    ".mpeg, .mpga, .webm"
                ),
            )

        try:
            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=extension,
            ) as temp_file:

                temp_file.write(await audio_file.read())

                temp_path = temp_file.name

            result = self.model.transcribe(temp_path)

            transcript = result["text"].strip()

            return transcript

        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Speech transcription failed: {str(exc)}",
            )


speech_service = SpeechService()