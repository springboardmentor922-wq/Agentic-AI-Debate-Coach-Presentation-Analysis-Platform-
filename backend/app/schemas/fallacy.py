from typing import Optional

from pydantic import BaseModel, Field


class FallacyReportSchema(BaseModel):

    fallacy_detected: bool = Field(
        description="True if a logical fallacy exists."
    )

    fallacy_type: str = Field(
        description="Detected fallacy type."
    )

    offending_text: Optional[str] = None

    explanation: Optional[str] = None

    correction_suggestion: Optional[str] = None