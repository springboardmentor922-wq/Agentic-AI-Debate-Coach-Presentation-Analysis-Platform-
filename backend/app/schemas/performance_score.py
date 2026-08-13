from pydantic import BaseModel, Field


class CategoryScore(BaseModel):
    score: float = Field(ge=0, le=10, description="Category score, 0-10.")
    feedback: str = Field(default="", description="Brief explanation for this score.")
    missing: bool = Field(default=False, description="True if this category had no source data and was estimated/omitted.")


class PerformanceScoreResult(BaseModel):
    """Weighted, deterministic composite score computed from a single turn's already-generated
    AI outputs. No LLM call — pure aggregation of fallacy_result, score_result, argument_analysis,
    and counterargument_result."""

    argument_quality: CategoryScore
    evidence_usage: CategoryScore
    logical_consistency: CategoryScore
    rebuttal_effectiveness: CategoryScore
    communication_skills: CategoryScore
    debate_performance_score: float = Field(ge=0, le=100)
    critical_thinking_score: float = Field(ge=0, le=100)


class PerformanceSummary(BaseModel):
    """AI-generated session-level synthesis — the one part of this feature that genuinely
    needs an LLM call, fired once per completed session, not per turn."""

    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)