from pydantic import BaseModel
from datetime import datetime


class DebateSessionCreate(BaseModel):

    topic: str

    category: str

    difficulty: str

    duration: int


class DebateSessionResponse(BaseModel):

    id: int

    learner_id: int

    topic: str

    category: str

    difficulty: str

    duration: int

    created_by: str

    status: str

    created_at: datetime

    class Config:
        from_attributes = True