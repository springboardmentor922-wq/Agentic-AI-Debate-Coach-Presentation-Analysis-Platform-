from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AssignmentCreate(BaseModel):

    title: str

    description: Optional[str] = None

    category: Optional[str] = None

    difficulty: str = "Medium"

    due_date: Optional[str] = None

    classroom_id: Optional[int] = None

    learner_id: Optional[int] = None


class AssignmentResponse(BaseModel):

    id: int

    educator_id: int

    classroom_id: Optional[int] = None

    learner_id: Optional[int] = None

    title: str

    description: Optional[str] = None

    category: Optional[str] = None

    difficulty: str

    due_date: Optional[str] = None

    status: str

    created_at: datetime

    class Config:

        from_attributes = True