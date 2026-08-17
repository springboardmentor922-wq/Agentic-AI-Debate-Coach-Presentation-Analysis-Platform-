from pydantic import BaseModel
from datetime import datetime


class AssignedDebateCreate(BaseModel):

    learner_id: int

    topic: str

    category: str

    difficulty: str

    due_date: str


class AssignedDebateResponse(BaseModel):

    id: int

    learner_id: int

    coach_id: int

    topic: str

    category: str

    difficulty: str

    due_date: str

    status: str

    created_at: datetime

    class Config:
        from_attributes = True