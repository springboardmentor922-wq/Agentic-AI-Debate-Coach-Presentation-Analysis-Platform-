from pydantic import BaseModel, Field


class PersonalizedFeedbackItem(BaseModel):
    area: str = Field(description="e.g. Argument Structure, Evidence Usage, Rebuttal Skills.")
    current_performance: str = Field(description="Where the user currently stands on this skill.")
    why_improvement_needed: str = Field(default="")
    practical_advice: str = Field(default="")
    expected_benefit: str = Field(default="")


class SkillGapAnalysis(BaseModel):
    strongest_skills: list[str] = Field(default_factory=list)
    weakest_skills: list[str] = Field(default_factory=list)
    recurring_fallacies: list[str] = Field(default_factory=list)
    improvement_trend: str = Field(default="insufficient_data", description="improving | declining | stable | insufficient_data")


class LearningPathWeek(BaseModel):
    week: int
    goal: str
    activities: list[str] = Field(default_factory=list)


class CoachingSummary(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    priority_focus: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)


class RecommendationResult(BaseModel):
    personalized_feedback: list[PersonalizedFeedbackItem] = Field(default_factory=list)
    skill_gap_analysis: SkillGapAnalysis
    learning_path: list[LearningPathWeek] = Field(default_factory=list)
    practice_recommendations: list[str] = Field(default_factory=list)
    recommended_topics: list[str] = Field(default_factory=list)
    coaching_summary: CoachingSummary