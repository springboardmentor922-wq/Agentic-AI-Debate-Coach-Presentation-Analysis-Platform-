from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class CoachEvaluationCreate(BaseModel):
    learner_id: int
    session_id: Optional[int] = None
    communication_score: float = Field(default=0.0, ge=0.0, le=100.0)
    confidence_score: float = Field(default=0.0, ge=0.0, le=100.0)
    logic_score: float = Field(default=0.0, ge=0.0, le=100.0)
    rebuttal_score: float = Field(default=0.0, ge=0.0, le=100.0)
    evidence_score: float = Field(default=0.0, ge=0.0, le=100.0)
    overall_score: float = Field(default=0.0, ge=0.0, le=100.0)
    comments: Optional[str] = None
    recommendations: Optional[str] = None

class CoachEvaluationResponse(CoachEvaluationCreate):
    id: int
    coach_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PracticeAssignmentCreate(BaseModel):
    learner_id: int
    topic_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    debate_format: str = "Oxford Debate"
    difficulty: str = "Intermediate"
    due_date: Optional[datetime] = None

class PracticeAssignmentResponse(PracticeAssignmentCreate):
    id: int
    coach_id: int
    session_id: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CoachingSessionCreate(BaseModel):
    learner_id: int
    topic_title: str
    scheduled_at: datetime
    notes: Optional[str] = None

class CoachingSessionResponse(CoachingSessionCreate):
    id: int
    coach_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CoachAssignRequest(BaseModel):
    coach_id: int
    learner_id: int
    notes: Optional[str] = None

class SubmittedTurnInfo(BaseModel):
    turn_number: int
    speaker: str
    speech_text: str

class SubmissionReviewResponse(BaseModel):
    learner_id: int
    learner_name: str
    topic_title: str
    topic_description: Optional[str] = None
    debate_format: str
    position: str
    session_id: int
    session_status: str
    submitted_turns: List[SubmittedTurnInfo] = []
    overall_score: float = 0.0
    argument_quality: float = 0.0
    evidence_usage: float = 0.0
    logical_consistency: float = 0.0
    rebuttal_effectiveness: float = 0.0
    communication_score: float = 0.0
    detected_fallacies: List[dict] = []
    counterarguments: List[dict] = []
    recommendations: List[str] = []
    has_evaluation: bool = False
    existing_evaluation: Optional[dict] = None

