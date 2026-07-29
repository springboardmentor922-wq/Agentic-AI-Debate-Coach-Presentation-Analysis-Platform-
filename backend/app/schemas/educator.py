"""
Milestone 4 — Educator Analytics schemas.

Every field here is computed live from real debate/session/score records at
request time (same pattern as routers/dashboard.py) — there is no persisted
"classroom analytics" document to go stale or drift from the truth.
"""
from typing import Optional
from pydantic import BaseModel


class LearnerSummaryOut(BaseModel):
    id: str
    full_name: str
    email: str
    institution: Optional[str] = None
    department: Optional[str] = None
    sessions_completed: int = 0
    average_score: Optional[float] = None
    last_activity_at: Optional[str] = None
    fallacies_avoided_rate: Optional[float] = None


class ClassroomAnalyticsOut(BaseModel):
    classroom: str  # institution, or "institution / department" if department is set
    learner_count: int
    total_sessions_completed: int
    average_score: Optional[float] = None
    average_improvement_pct: Optional[float] = None
    top_performers: list[LearnerSummaryOut] = []
    needs_attention: list[LearnerSummaryOut] = []


class LearnerComparisonOut(BaseModel):
    learners: list[LearnerSummaryOut]


class TopicAssignmentCreate(BaseModel):
    learner_id: str
    topic: str
    debate_format: str = "one_on_one"
    note: Optional[str] = None
    due_at: Optional[str] = None


class TopicAssignmentOut(BaseModel):
    id: str
    educator_id: str
    learner_id: str
    learner_name: str
    topic: str
    debate_format: str
    note: Optional[str] = None
    due_at: Optional[str] = None
    created_at: str
    completed: bool = False
