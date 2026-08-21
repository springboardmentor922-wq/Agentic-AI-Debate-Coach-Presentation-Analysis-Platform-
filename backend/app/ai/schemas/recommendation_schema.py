from pydantic import BaseModel, Field
from typing import List


class RecommendationResponse(BaseModel):

    strengths: List[str] = Field(
        description="User strengths."
    )

    weaknesses: List[str] = Field(
        description="Areas needing improvement."
    )

    recommendations: List[str] = Field(
        description="Personalized recommendations."
    )

    practice_exercises: List[str] = Field(
        description="Suggested exercises."
    )

    suggested_topics: List[str] = Field(
        description="Suggested debate topics."
    )

    next_goal: str = Field(
        description="Next learning goal."
    )