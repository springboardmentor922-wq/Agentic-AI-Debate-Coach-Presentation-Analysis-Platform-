from typing import List

from pydantic import BaseModel, Field


class CoachingRecommendation(BaseModel):
    """Standing personalized coaching recommendation (Milestone 3: Recommendation
    & Coaching Engine), built from a learner's full debate history -- not a
    single session, unlike the End Debate summary."""

    focus_area: str = Field(description="The single skill area most in need of improvement right now.")
    insight: str = Field(description="One short sentence naming the pattern seen across their history.")
    recommended_drills: List[str] = Field(
        default_factory=list, description="2-3 short, specific practice actions."
    )
    recommended_topics: List[str] = Field(
        default_factory=list, description="1-2 debate topics well-suited to practicing the focus area."
    )