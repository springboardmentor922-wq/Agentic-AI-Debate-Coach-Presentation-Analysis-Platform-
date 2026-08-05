"""Strict Pydantic contracts for Milestone 3 graph outputs."""
from typing import Literal
from pydantic import BaseModel, Field

Difficulty = Literal["Beginner", "Intermediate", "Advanced", "Master"]

class EvidenceSource(BaseModel):
    content: str
    source: str = "knowledge_base"

class CounterargumentResponse(BaseModel):
    logical_rebuttal: str
    evidence_rebuttal: str
    ethical_rebuttal: str
    practical_or_policy_rebuttal: str
    challenge_questions: list[str] = Field(default_factory=list)
    debate_strategies: list[str] = Field(default_factory=list)
    evidence_sources: list[EvidenceSource] = Field(default_factory=list)

class AIDebateOpponentResponse(BaseModel):
    opponent_response: str
    opponent_position: str
    challenge: str
    next_turn_guidance: str

class JudgeCategoryScores(BaseModel):
    argument_quality: float = Field(ge=0, le=100)
    evidence_usage: float = Field(ge=0, le=100)
    logical_consistency: float = Field(ge=0, le=100)
    rebuttal_effectiveness: float = Field(ge=0, le=100)
    communication_skills: float = Field(ge=0, le=100)
    rationale: list[str] = Field(default_factory=list)

class PerformanceScore(BaseModel):
    categories: JudgeCategoryScores
    overall_score: float = Field(ge=0, le=100)

class CoachingResponse(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    rewrite_suggestions: list[str] = Field(default_factory=list)
    practice_advice: list[str] = Field(default_factory=list)
    next_actions: list[str] = Field(default_factory=list)

class RecommendationResponse(BaseModel):
    debate_topics: list[str] = Field(default_factory=list)
    exercises: list[str] = Field(default_factory=list)
    resources: list[str] = Field(default_factory=list)
    practice_plan: list[str] = Field(default_factory=list)

class LearningPathResponse(BaseModel):
    level: str
    milestones: list[str] = Field(default_factory=list)
    target_skills: list[str] = Field(default_factory=list)
    next_review_after_debates: int = Field(default=3, ge=1)

class ObservabilityMetadata(BaseModel):
    model_used: str
    latency_ms: int = Field(ge=0)
    execution_time_ms: int = Field(ge=0)
    token_usage: dict[str, int] = Field(default_factory=dict)
    errors: list[str] = Field(default_factory=list)
