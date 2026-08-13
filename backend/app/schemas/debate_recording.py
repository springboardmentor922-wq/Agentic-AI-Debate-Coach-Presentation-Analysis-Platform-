from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.debate_recording import RecordingStatus, RecordingType


class RecordingOut(BaseModel):
    id: int
    debate_session_id: int
    user_id: int
    recording_url: str | None = None
    duration: int | None = None
    recording_type: RecordingType
    file_size: int | None = None
    status: RecordingStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)