from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------
# Timeline Models
# ---------------------------------------------------------

class DebateTimelineItem(BaseModel):
    turn_number: int

    user_argument: str

    ai_response: str

    score: float

    fallacy: Optional[str] = None

    counterargument: Optional[str] = None

    feedback: Optional[str] = None


class ScoreProgressItem(BaseModel):
    turn_number: int

    argument_quality: float

    evidence_usage: float

    logical_consistency: float

    rebuttal_effectiveness: float

    communication: float

    overall_score: float


# ---------------------------------------------------------
# Learning Plan
# ---------------------------------------------------------

class LearningPlanItem(BaseModel):
    week: int

    title: str

    objective: str

    exercises: List[str]

    expected_outcome: str


# ---------------------------------------------------------
# Judge Result
# ---------------------------------------------------------

class JudgeEvaluation(BaseModel):
    winner: str

    overall_score: float = Field(..., ge=0, le=100)

    judge_summary: str

    strengths: List[str]

    weaknesses: List[str]

    recommendations: List[str]

    learning_plan: List[LearningPlanItem]

    best_argument: Optional[str] = None

    best_rebuttal: Optional[str] = None

    closing_feedback: Optional[str] = None

    argument_quality: float

    evidence_usage: float

    logical_consistency: float

    rebuttal_effectiveness: float

    communication_skills: float

    confidence_score: float

    presentation_score: float

    critical_thinking_score: float

    total_turns: int

    fallacies_detected: int

    average_response_time: Optional[float] = None

    total_words: int

    timeline: List[DebateTimelineItem]

    score_progression: List[ScoreProgressItem]


# ---------------------------------------------------------
# API Response
# ---------------------------------------------------------

class DebateReportResponse(BaseModel):
    id: int

    session_id: int

    user_id: int

    winner: str

    overall_score: float

    judge_summary: str

    strengths: List[str]

    weaknesses: List[str]

    recommendations: List[str]

    learning_plan: List[LearningPlanItem]

    best_argument: Optional[str] = None

    best_rebuttal: Optional[str] = None

    closing_feedback: Optional[str] = None

    argument_quality: float

    evidence_usage: float

    logical_consistency: float

    rebuttal_effectiveness: float

    communication_skills: float

    confidence_score: float

    presentation_score: float

    critical_thinking_score: float

    total_turns: int

    fallacies_detected: int

    average_response_time: Optional[float] = None

    total_words: int

    timeline: List[DebateTimelineItem]

    score_progression: List[ScoreProgressItem]

    generated_by: str

    created_at: datetime

    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


# ---------------------------------------------------------
# API Request
# ---------------------------------------------------------

class GenerateJudgeReportRequest(BaseModel):
    regenerate: bool = False


# ---------------------------------------------------------
# Dashboard Summary
# ---------------------------------------------------------

class JudgeDashboardSummary(BaseModel):
    session_id: int

    winner: str

    overall_score: float

    critical_thinking_score: float

    communication_skills: float

    presentation_score: float

    strongest_skill: str

    weakest_skill: str

    recommendation: str


# ---------------------------------------------------------
# PDF Export
# ---------------------------------------------------------

class JudgePDFExport(BaseModel):
    filename: str

    download_url: str


# ---------------------------------------------------------
# Analytics
# ---------------------------------------------------------

class JudgeAnalytics(BaseModel):
    average_argument_score: float

    average_logic_score: float

    average_evidence_score: float

    average_presentation_score: float

    average_critical_thinking: float

    total_debates: int

    wins: int

    losses: int

    improvement_percentage: float