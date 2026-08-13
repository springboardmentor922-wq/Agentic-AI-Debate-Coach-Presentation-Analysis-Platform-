from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.debate_session import SessionStance, SessionStatus


class SessionCreate(BaseModel):
    topic_id: int
    stance: SessionStance = SessionStance.NOT_SET
    duration_minutes: int = 10
    scheduled_at: datetime | None = None
    coach_id: int | None = None


class SessionUpdate(BaseModel):
    status: SessionStatus | None = None
    stance: SessionStance | None = None


class SessionOut(BaseModel):
    id: int
    user_id: int
    topic_id: int
    coach_id: int | None = None
    stance: SessionStance
    status: SessionStatus
    duration_minutes: int
    scheduled_at: datetime | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
