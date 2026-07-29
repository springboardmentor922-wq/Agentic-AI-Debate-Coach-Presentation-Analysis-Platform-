"""
Milestone 4 — Coach Review System schemas.

A `coach_reviews` document is created automatically the instant a learner's
debate finishes (see routers/debate_live.py::finish_debate). It starts in
`pending` status and is queryable by any Debate Coach as their review queue.
A coach then attaches real comments/scores/recommendations and marks it
`reviewed` — nothing here is ever pre-filled with fake content.

`reviewed` is NOT the final state: once a coach marks a review `reviewed`,
it becomes visible in every Educator's queue (see routers/educator_analytics.py).
An Educator then adds their own score/comments and marks it
`educator_approved` — only then is the report considered final and
published back to the learner with all three scores (AI, Coach, Educator).
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class ReviewStatus(str, Enum):
    pending = "pending"
    in_review = "in_review"
    reviewed = "reviewed"
    educator_approved = "educator_approved"


class CoachReviewSubmit(BaseModel):
    """What a coach submits after actually reviewing a debate."""

    coach_comments: Optional[str] = Field(default=None, description="Free-text manual feedback from the coach")
    coach_score: Optional[float] = Field(default=None, ge=0, le=100, description="Coach's own score, independent of the AI score")
    additional_suggestions: list[str] = Field(default_factory=list)
    recommended_exercises: list[str] = Field(default_factory=list)
    recommended_learning_plan_notes: Optional[str] = None
    approve_ai_feedback: Optional[bool] = Field(
        default=None, description="Whether the coach signs off on the AI-generated report as accurate"
    )
    mark_status: ReviewStatus = ReviewStatus.reviewed


class EducatorReviewSubmit(BaseModel):
    """What an Educator submits for final review, grading, and approval —
    the last step before a report is published back to the learner."""

    educator_score: float = Field(ge=0, le=100, description="Educator's own final grade for this debate")
    educator_comments: Optional[str] = Field(default=None, description="Free-text final feedback from the educator")


class CoachReviewOut(BaseModel):
    id: str
    session_id: str
    learner_id: str
    learner_name: str
    coach_id: Optional[str] = None
    topic: str
    debate_format: str
    ai_overall_score: Optional[float] = None
    status: ReviewStatus
    coach_comments: Optional[str] = None
    coach_score: Optional[float] = None
    additional_suggestions: list[str] = Field(default_factory=list)
    recommended_exercises: list[str] = Field(default_factory=list)
    recommended_learning_plan_notes: Optional[str] = None
    approve_ai_feedback: Optional[bool] = None
    educator_id: Optional[str] = None
    educator_score: Optional[float] = None
    educator_comments: Optional[str] = None
    educator_approved_at: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    reviewed_at: Optional[str] = None


class CoachAssignmentCreate(BaseModel):
    learner_id: str


class CoachAssignmentOut(BaseModel):
    id: str
    coach_id: str
    learner_id: str
    learner_name: str
    learner_email: str
    assigned_at: str
    sessions_completed: int = 0
    average_score: Optional[float] = None
    last_activity_at: Optional[str] = None
