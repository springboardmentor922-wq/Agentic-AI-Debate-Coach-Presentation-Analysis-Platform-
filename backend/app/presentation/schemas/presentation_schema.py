"""
Presentation Schemas

Pydantic models for presentation audio recording, storage, and metadata endpoints.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PresentationRecordingData(BaseModel):
    id: int
    user_id: int
    session_id: Optional[int] = None
    title: Optional[str] = None
    filename: Optional[str] = None
    mime_type: Optional[str] = None
    gridfs_id: Optional[str] = None
    processing_status: str
    audio_duration_seconds: float = 0.0
    speech_pace_wpm: float = 0.0
    filler_words_count: int = 0
    confidence_score: float = 0.0
    clarity_score: float = 0.0
    audience_engagement_score: float = 0.0
    overall_score: float = 0.0
    transcription_text: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PresentationRecordingResponse(BaseModel):
    success: bool = True
    message: str
    data: PresentationRecordingData


class PresentationListResponse(BaseModel):
    success: bool = True
    message: str
    data: List[PresentationRecordingData]
