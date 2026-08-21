from pydantic import BaseModel, Field


class PerformanceResponse(BaseModel):

    overall_score: float = Field(...)

    communication_score: float = Field(...)

    critical_thinking_score: float = Field(...)

    confidence_score: float = Field(...)

    argument_quality_score: float = Field(...)

    logical_consistency_score: float = Field(...)

    improvement_trend: str = Field(...)

    key_insights: str = Field(...)