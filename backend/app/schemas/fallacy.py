from typing import Optional
from pydantic import BaseModel, Field


class FallacyReport(BaseModel):
    """Structured output enforced on the LLM via LangChain's with_structured_output()."""

    fallacy_detected: bool = Field(description="Whether a logical fallacy was found")
    fallacy_type: Optional[str] = Field(
        default=None,
        description=(
            "One of: Ad Hominem, Straw Man, False Dilemma, Slippery Slope, "
            "Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring, None"
        ),
    )
    offending_text: Optional[str] = Field(
        default=None, description="The exact excerpt of text containing the fallacy"
    )
    explanation: Optional[str] = Field(
        default=None, description="Why this reasoning is flawed"
    )
    severity: Optional[str] = Field(
        default=None, description="One of: low, medium, high — how much this fallacy undermines the argument"
    )
    why_incorrect: Optional[str] = Field(
        default=None,
        description="The specific logical error: which premise or inference step is invalid and why",
    )
    correction_suggestion: Optional[str] = Field(
        default=None, description="How the user could rephrase the argument correctly"
    )
    better_version: Optional[str] = Field(
        default=None, description="A rewritten version of the offending text that avoids the fallacy"
    )
    credibility_assessment: Optional[str] = Field(
        default=None,
        description=(
            "A short assessment of how much this fallacy damages the credibility of the "
            "claim it supports — distinct from confidence_score, which is the model's own "
            "confidence in having correctly detected the fallacy, not a judgment about the "
            "argument itself."
        ),
    )
    confidence_score: float = Field(
        default=0.0, ge=0, le=1, description="Model's confidence in this fallacy detection, 0-1"
    )


class FallacyAnalysisRequest(BaseModel):
    session_id: Optional[str] = None
    text: str = Field(min_length=3)
    debate_format: Optional[str] = "one_on_one"


class ArgumentAnalysis(BaseModel):
    """Structured output for the Argument Analysis Engine (Module 4)."""

    claims: list[str] = Field(default_factory=list, description="Extracted claims")
    evidence: list[str] = Field(default_factory=list, description="Extracted evidence/support")
    reasoning_quality: str = Field(
        default="", description="1-2 sentence assessment of the quality/soundness of the reasoning chain"
    )
    clarity_score: float = Field(ge=0, le=10)
    relevance_score: float = Field(ge=0, le=10)
    evidence_strength_score: float = Field(ge=0, le=10)
    logical_consistency_score: float = Field(ge=0, le=10)
    persuasiveness_score: float = Field(ge=0, le=10)
    reasoning_quality_score: float = Field(ge=0, le=10, default=0)
    overall_argument_score: float = Field(ge=0, le=10)
    feedback: str = Field(description="Constructive feedback for the debater")


class ArgumentAnalysisRequest(BaseModel):
    session_id: Optional[str] = None
    text: str = Field(min_length=3)


class CombinedAnalysisResult(BaseModel):
    argument_analysis: ArgumentAnalysis
    fallacy_report: FallacyReport


class DebateFeedbackReport(BaseModel):
    """
    Structured output for the Debate Feedback Report Generator (Milestone 2).
    Summarizes an entire debate session's turns into one coaching report.
    """

    strengths: list[str] = Field(default_factory=list, description="What the debater did well, as short bullet points")
    weaknesses: list[str] = Field(default_factory=list, description="Areas that weakened the debater's case")
    missing_evidence: list[str] = Field(
        default_factory=list, description="Claims made without sufficient supporting evidence"
    )
    logical_issues: list[str] = Field(
        default_factory=list, description="Logical fallacies or reasoning gaps found across the session"
    )
    recommended_improvements: list[str] = Field(
        default_factory=list, description="Specific, actionable steps to improve next time"
    )
    learning_recommendations: list[str] = Field(
        default_factory=list,
        description=(
            "Broader curriculum/skill-building recommendations (distinct from "
            "recommended_improvements, which are tactical fixes for this specific debate) — "
            "e.g. 'Practice evidence-based argumentation drills' or 'Review the Hasty "
            "Generalization module in Learning Hub'."
        ),
    )
    final_summary: str = Field(description="2-3 sentence overall summary of the debater's performance")
    overall_rating: float = Field(ge=0, le=10, description="Overall performance rating for the session, 0-10")

    # --- Named sub-scores (Milestone 2 spec: AI Analysis page) -------------
    argument_quality: float = Field(
        default=0, ge=0, le=10, description="Quality of claims, structure, and reasoning across the session"
    )
    evidence_usage: float = Field(
        default=0, ge=0, le=10, description="How well claims were backed by concrete evidence/data/sources"
    )
    logical_consistency: float = Field(
        default=0, ge=0, le=10, description="Internal consistency of reasoning across turns, free of contradictions"
    )
    rebuttal_effectiveness: float = Field(
        default=0, ge=0, le=10, description="How effectively the debater responded to the AI opponent's rebuttals"
    )
    communication_skills: float = Field(
        default=0, ge=0, le=10, description="Clarity, persuasiveness, and delivery of the debater's points"
    )
