"""
Speech-to-Text Service

Handles automated audio transcription from MongoDB GridFS using local Whisper model.
Updates PostgreSQL presentation_analyses record with transcript text and duration.
"""

from pathlib import Path
import tempfile
import time
from typing import Tuple, Dict, Any
from bson import ObjectId
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.mongodb.database import mongodb
from app.models.presentation_analysis import PresentationAnalysis


class SpeechToTextService:
    def __init__(self):
        self._whisper_model = None

    def _get_whisper_model(self):
        """Lazy load Whisper model once on first transcription request."""
        if self._whisper_model is None:
            import whisper
            try:
                self._whisper_model = whisper.load_model("base")
            except Exception as exc:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Failed to load Whisper speech transcription model: {str(exc)}"
                ) from exc
        return self._whisper_model

    def transcribe_presentation(
        self,
        presentation_id: int,
        db: Session
    ) -> Tuple[PresentationAnalysis, str]:
        """
        Retrieves binary audio from GridFS, transcribes it using Whisper,
        saves transcript text to PostgreSQL presentation_analyses, and updates status.
        """
        presentation = db.query(PresentationAnalysis).filter(
            PresentationAnalysis.id == presentation_id,
            PresentationAnalysis.is_deleted == False
        ).first()

        if not presentation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Presentation recording with ID {presentation_id} not found."
            )

        if not presentation.gridfs_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No GridFS audio recording found for this presentation."
            )

        # Retrieve binary from GridFS
        try:
            gridfs_file = mongodb.gridfs.get(ObjectId(presentation.gridfs_id))
            audio_bytes = gridfs_file.read()
        except Exception as exc:
            presentation.processing_status = "FAILED"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to retrieve audio binary from GridFS storage."
            ) from exc

        if not audio_bytes or len(audio_bytes) == 0:
            presentation.processing_status = "FAILED"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio recording binary is empty."
            )

        # Update status to TRANSCRIBING
        presentation.processing_status = "TRANSCRIBING"
        db.commit()

        # Temporary audio file for Whisper
        suffix = Path(presentation.filename or "recording.webm").suffix.lower() or ".webm"
        temp_file_path = None

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(audio_bytes)
                temp_file_path = temp_file.name

            # Run Whisper transcription
            model = self._get_whisper_model()
            result = model.transcribe(temp_file_path)

            transcript_text = result.get("text", "").strip()
            segments = result.get("segments", [])

            # Compute audio duration in seconds
            audio_duration = 0.0
            if segments and len(segments) > 0:
                audio_duration = round(segments[-1].get("end", 0.0), 2)
            else:
                # Estimate from audio size if segment duration unavailable
                audio_duration = round(len(audio_bytes) / (16000 * 2), 2) if len(audio_bytes) > 0 else 0.0

            if audio_duration <= 0.0:
                audio_duration = 1.0  # Safe minimum

            # Persist transcript in PostgreSQL
            presentation.transcription_text = transcript_text
            presentation.audio_duration_seconds = audio_duration
            presentation.processing_status = "TRANSCRIBED"
            db.commit()
            db.refresh(presentation)

            return presentation, transcript_text

        except Exception as exc:
            presentation.processing_status = "FAILED"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Speech transcription failed: {str(exc)}"
            ) from exc
        finally:
            if temp_file_path and Path(temp_file_path).exists():
                Path(temp_file_path).unlink(missing_ok=True)


speech_to_text_service = SpeechToTextService()
