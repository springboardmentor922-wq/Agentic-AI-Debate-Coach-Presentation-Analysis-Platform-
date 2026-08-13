from pydantic import BaseModel, Field


class FallacyAnalysisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    session_id: int | None = None  # optional link to a DebateSession


class FallacyItem(BaseModel):
    fallacy_detected: bool = Field(description="Always true for items in this list")
    fallacy_type: str = Field(
        description="e.g. 'Ad Hominem', 'Straw Man', 'Slippery Slope', 'False Dilemma', "
        "'Appeal to Authority', 'Circular Reasoning', 'Hasty Generalization', 'Red Herring'"
    )
    offending_text: str = Field(description="The exact snippet where the fallacy occurs")
    confidence_score: float = Field(ge=0.0, le=1.0, description="Model's confidence this is a genuine fallacy")
    explanation: str = Field(description="Clear, student-friendly explanation of why this reasoning is flawed")
    correction_suggestion: str = Field(description="Constructive suggestion for how to rephrase the argument")


class ReasoningAnalysis(BaseModel):
    quality: str = Field(description="One of: Weak, Moderate, Strong")
    feedback: str = Field(description="Concise assessment of logical flow, consistency, and unsupported assumptions")


class CredibilityAssessment(BaseModel):
    score: int = Field(ge=0, le=10)
    feedback: str = Field(
        description="Assessment of evidence quality and factual support. If no evidence was given, "
        "state that clearly rather than inventing facts."
    )


class FallacyDetectionResult(BaseModel):
    fallacies: list[FallacyItem] = Field(default_factory=list)
    reasoning_analysis: ReasoningAnalysis
    credibility_assessment: CredibilityAssessment

    @property
    def fallacy_detected(self) -> bool:
        """Backward-compat helper — True if any fallacy was found."""
        return len(self.fallacies) > 0


class FallacyAnalysisResponse(BaseModel):
    result: FallacyDetectionResult
    analyzed_text: str