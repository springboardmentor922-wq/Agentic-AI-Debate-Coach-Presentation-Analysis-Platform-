from datetime import datetime
from pydantic import BaseModel


class ScheduleCreate(BaseModel):
    invitee_id: int
    topic_id: int | None = None
    scheduled_datetime: datetime


class ScheduleRespond(BaseModel):
    accept: bool


class ScheduleUserSummary(BaseModel):
    id: int
    full_name: str
    role: str


class ScheduleTopicSummary(BaseModel):
    id: int
    title: str


class ScheduleOut(BaseModel):
    id: int
    scheduled_by: ScheduleUserSummary
    invitee: ScheduleUserSummary
    topic: ScheduleTopicSummary | None
    scheduled_datetime: datetime
    status: str
    created_at: datetime