from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class DebateFormat(str, Enum):
    one_on_one = "one_on_one"
    parliamentary = "parliamentary"
    british_parliamentary = "british_parliamentary"
    asian_parliamentary = "asian_parliamentary"
    oxford = "oxford"
    policy = "policy"
    public_forum = "public_forum"
    lincoln_douglas = "lincoln_douglas"
    world_schools = "world_schools"
    ai_simulation = "ai_simulation"
    popularity = "popularity"
    group_debate = "group_debate"


class DebateSessionStatus(str, Enum):
    scheduled = "scheduled"
    active = "active"
    paused = "paused"
    completed = "completed"
    cancelled = "cancelled"


class DebateSessionCreate(BaseModel):
    topic: str
    debate_format: DebateFormat = DebateFormat.one_on_one
    position: Optional[str] = None
    scheduled_at: Optional[str] = Field(
        default=None, description="ISO datetime for a scheduled session; omit to start immediately"
    )


class DebateSessionUpdate(BaseModel):
    topic: Optional[str] = None
    debate_format: Optional[DebateFormat] = None
    position: Optional[str] = None
    scheduled_at: Optional[str] = None


class DebateSessionStatusUpdate(BaseModel):
    status: DebateSessionStatus


class DebateRecordingMetadata(BaseModel):
    recording_url: str = Field(description="URL/path of the uploaded recording file")
    duration_seconds: Optional[float] = Field(default=None, ge=0)
    file_format: Optional[str] = Field(default=None, description="e.g. mp4, wav, mp3, m4a")
    file_size_mb: Optional[float] = Field(default=None, ge=0)


class DebateSessionOut(BaseModel):
    id: str
    topic: str
    debate_format: DebateFormat
    position: Optional[str] = None
    scheduled_at: Optional[str] = None
    owner_id: str
    status: str = "active"
    created_at: str
    updated_at: Optional[str] = None
    recording: Optional[DebateRecordingMetadata] = None
    recorded_at: Optional[str] = None


class DebateTurnRequest(BaseModel):
    session_id: str
    text: str = Field(min_length=1)
