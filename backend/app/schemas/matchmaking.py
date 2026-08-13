from datetime import datetime

from pydantic import BaseModel


class AvailableUser(BaseModel):
    id: int
    full_name: str
    role: str


class HeartbeatResponse(BaseModel):
    status: str = "ok"


class InviteCreate(BaseModel):
    to_user_id: int
    session_id: int
    invite_type: str  # "human" | "coach_debate" | "coach_adjudicate"


class InviteOut(BaseModel):
    id: str
    from_user_id: int
    from_user_name: str
    to_user_id: int
    session_id: int
    invite_type: str
    status: str  # pending | accepted | declined | expired
    created_at: datetime


class InviteRespond(BaseModel):
    accept: bool