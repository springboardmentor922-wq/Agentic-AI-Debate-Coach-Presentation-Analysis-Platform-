from typing import List

from pydantic import BaseModel, Field


class SessionSummary(BaseModel):
    """End-of-session coaching report (Milestone 2/4: Generate debate feedback reports)."""

    overall_assessment: str = Field(
        description="2-3 sentence overall assessment of the debater's performance across the whole session."
    )
    strengths: List[str] = Field(
        default_factory=list, description="2-4 specific strengths shown during the debate."
    )
    areas_to_improve: List[str] = Field(
        default_factory=list, description="2-4 specific, actionable areas to improve."
    )
    suggested_next_steps: List[str] = Field(
        default_factory=list, description="2-3 concrete practice suggestions for their next session."
    )