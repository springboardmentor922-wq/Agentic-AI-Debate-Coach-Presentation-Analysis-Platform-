from pydantic import BaseModel, Field


class ArgumentAnalysisRequest(BaseModel):
    """Request payload for analyzing a single debate argument."""

    text: str = Field(
        min_length=1,
        max_length=5000,
        description="The user's debate argument to analyze.",
    )
    session_id: int | None = Field(
        default=None,
        description="Optional debate session ID associated with this analysis.",
    )


class ArgumentStrength(BaseModel):
    """Overall strength assessment of an argument."""

    score: int = Field(ge=0, le=10, description="Overall argument strength, 0-10.")
    reason: str = Field(
        description="Why this score was given — evidence quality, completeness, coherence, logical flow."
    )


class CriterionScore(BaseModel):
    """A single scored evaluation criterion with supporting feedback."""

    score: int = Field(ge=0, le=10, description="Score for this criterion, 0-10.")
    feedback: str = Field(description="Brief explanation for this score.")


class ArgumentEvaluation(BaseModel):
    """Relevance and persuasiveness scoring. Clarity, evidence strength, and logical
    consistency are scored separately by the existing Argument Scoring service —
    intentionally not duplicated here."""

    relevance: CriterionScore = Field(description="How well the argument stays focused on the debate topic.")
    persuasiveness: CriterionScore = Field(description="How convincing the overall argument is.")


class ArgumentAnalysisResult(BaseModel):
    """Structured breakdown of an argument's logical components."""

    claim: str = Field(default="", description="The primary claim or assertion made by the speaker.")
    secondary_claims: list[str] = Field(
        default_factory=list, description="Additional claims beyond the primary one, if any."
    )
    evidence: list[str] = Field(
        default_factory=list,
        description="Supporting facts, examples, statistics, or reasons explicitly mentioned.",
    )
    assumptions: list[str] = Field(
        default_factory=list, description="Implicit assumptions that the argument depends on."
    )
    counterarguments: list[str] = Field(
        default_factory=list, description="Counterarguments the speaker acknowledges or addresses, if any."
    )
    reasoning: str = Field(default="", description="Explanation of how the evidence supports the claim.")
    reasoning_quality: str = Field(
        default="", description="One of: valid, weak, unsupported_assumptions, inconsistent."
    )
    conclusion: str = Field(default="", description="The final conclusion or takeaway presented by the speaker.")
    argument_strength: ArgumentStrength | None = Field(default=None, description="Overall strength assessment.")
    evaluation: ArgumentEvaluation | None = Field(
        default=None,
        description="Relevance and persuasiveness scoring (clarity/evidence/logical-consistency are "
        "scored separately by the existing Argument Scoring service).",
    )


class ArgumentAnalysisResponse(BaseModel):
    """Full response returned after analyzing a debate argument."""

    analyzed_text: str = Field(description="The original text that was analyzed.")
    result: ArgumentAnalysisResult = Field(description="Structured analysis extracted from the argument.")