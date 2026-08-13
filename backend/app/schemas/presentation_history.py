from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.presentation_history import PresentationDomain, PresentationStatus


class PresentationHistoryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255, description="Title of the presentation.")
    domain: PresentationDomain = Field(default=PresentationDomain.OTHER, description="Presentation domain/category.")
    duration: int | None = Field(default=None, description="Duration in seconds.")
    overall_score: float | None = Field(default=None, description="Overall AI-generated score.")
    ai_feedback_summary: str | None = Field(default=None, description="Short AI feedback summary.")
    communication_score: float | None = Field(default=None, description="Communication quality score.")
    clarity_score: float | None = Field(default=None, description="Clarity score.")
    confidence_score: float | None = Field(default=None, description="Confidence score, if available.")
    logical_consistency_score: float | None = Field(default=None, description="Logical consistency score.")
    fallacy_count: int = Field(default=0, description="Number of logical fallacies detected.")
    status: PresentationStatus = Field(default=PresentationStatus.IN_PROGRESS, description="Presentation status.")


class PresentationHistoryResponse(BaseModel):
    id: int
    user_id: int
    title: str
    domain: PresentationDomain
    duration: int | None = None
    overall_score: float | None = None
    ai_feedback_summary: str | None = None
    communication_score: float | None = None
    clarity_score: float | None = None
    confidence_score: float | None = None
    logical_consistency_score: float | None = None
    fallacy_count: int
    status: PresentationStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PresentationHistoryList(BaseModel):
    total: int = Field(description="Total matching records, before pagination.")
    page: int
    page_size: int
    items: list[PresentationHistoryResponse]