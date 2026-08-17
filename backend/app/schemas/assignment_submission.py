from pydantic import BaseModel

from typing import Optional

from datetime import datetime


class AssignmentSubmissionCreate(BaseModel):

    assignment_id: int

    response: str


class AssignmentReviewCreate(BaseModel):

    score: float

    educator_feedback: str


class AssignmentSubmissionResponse(BaseModel):

    id: int

    assignment_id: int

    learner_id: int

    response: str

    score: Optional[float] = None

    educator_feedback: Optional[str] = None

    status: str

    submitted_at: datetime

    reviewed_at: Optional[datetime] = None

    class Config:

        from_attributes = True