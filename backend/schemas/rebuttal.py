from typing import Literal, Optional

from pydantic import BaseModel, Field

RebuttalType = Literal["Logical", "Evidence-Based", "Ethical", "Practical-Policy"]


class OpponentRebuttal(BaseModel):
    """Structured output for Agent 2, the Opponent (Milestone 3: Counterargument
    Generation Engine). Categorizes the rebuttal by type per the spec, and adds
    a challenge question + strategy suggestion alongside the counterargument."""

    rebuttal_type: RebuttalType = Field(
        description=(
            "The category of this rebuttal: 'Logical' (spotting flaws in argument "
            "mechanics), 'Evidence-Based' (countering with facts/statistics), "
            "'Ethical' (challenging moral/normative assumptions), or "
            "'Practical-Policy' (pointing out real-world/implementation flaws)."
        )
    )
    rebuttal_text: str = Field(description="The opponent's actual counterargument reply.")
    challenge_question: str = Field(
        description="A probing question posed back to the user to challenge their stance."
    )
    strategy_suggestion: Optional[str] = Field(
        default=None,
        description="A brief, friendly debate strategy tip for the user's next argument.",
    )