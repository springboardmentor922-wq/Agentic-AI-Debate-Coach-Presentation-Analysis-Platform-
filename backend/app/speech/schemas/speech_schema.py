"""
Speech Processing Schemas

Purpose:
    Defines request and response models for the Speech Module.

Responsibilities:
    - Standardize speech transcription responses.
    - Validate API outputs.
    - Provide a consistent response format.

Note:
    This schema is used by the Speech API and does not contain
    speech recognition logic.
"""

from pydantic import BaseModel, Field


class SpeechTranscriptionData(BaseModel):
    """
    Contains the speech transcription result.
    """

    transcript: str = Field(
        ...,
        description="Transcribed text generated from the uploaded audio."
    )


class SpeechTranscriptionResponse(BaseModel):
    """
    Standard response returned after speech transcription.
    """

    success: bool

    message: str

    data: SpeechTranscriptionData