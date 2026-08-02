from typing import Optional

from pydantic import BaseModel, Field


class FallacyReport(BaseModel):
    """Structured output from the Auditor agent for a single debate turn."""

    fallacy_detected: bool = Field(
        description="True if the statement contains a logical fallacy, false otherwise."
    )
    fallacy_type: Optional[str] = Field(
        default=None,
        description=(
            "One of: Ad Hominem, Straw Man, False Dilemma, Slippery Slope, "
            "Appeal to Authority, Circular Reasoning, Hasty Generalization, Red Herring. "
            "Null if no fallacy was detected."
        ),
    )
    offending_text: Optional[str] = Field(
        default=None,
        description="The exact phrase from the statement that contains the fallacy. Null if none.",
    )
    explanation: Optional[str] = Field(
        default=None,
        description="A short, plain-language explanation of why this is a fallacy. Null if none.",
    )
    correction_suggestion: Optional[str] = Field(
        default=None,
        description="A concrete suggestion for how to rephrase the argument to fix the flaw. Null if none.",
    )