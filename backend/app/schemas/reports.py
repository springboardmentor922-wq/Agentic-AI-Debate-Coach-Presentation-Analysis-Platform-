from datetime import datetime

from pydantic import BaseModel
from app.schemas.session import SessionOut


class LearnerRow(BaseModel):
    id: int
    full_name: str
    sessions: int
    completed: int
    last_active: datetime | None = None


class AllLearnersReport(BaseModel):
    total_learners: int
    sessions_this_week: int
    avg_completion_rate: float | None  # percentage, e.g. 62.5; null if no sessions exist yet
    most_debated_topic: str | None
    learners: list[LearnerRow]


class CoachRow(BaseModel):
    id: int
    full_name: str
    sessions_coached: int
    feedback_given: int
    learners_assigned: int
    last_active: datetime | None = None


class CoachesReport(BaseModel):
    active_coaches: int
    sessions_coached: int
    feedback_given: int
    coaches: list[CoachRow]

class EducatorRow(BaseModel):
    id: int
    full_name: str
    topics_published: int
    sessions_generated: int
    last_active: datetime | None = None


class EducatorsReport(BaseModel):
    active_educators: int
    topics_published: int
    sessions_generated: int
    educators: list[EducatorRow]
    
class UserSummary(BaseModel):
    id: int
    full_name: str
    role: str


class UserActivityDetail(BaseModel):
    user: UserSummary
    sessions: list[SessionOut]    

class SkillAnalytics(BaseModel):
    turn_count: int
    avg_clarity: float | None = None
    avg_evidence_strength: float | None = None
    avg_rebuttal_quality: float | None = None
    avg_logical_consistency: float | None = None
    fallacy_count: int
    fallacy_rate: float | None = None
    most_common_fallacy: str | None = None


class UserActivityDetail(BaseModel):
    user: UserSummary
    sessions: list[SessionOut]
    skill_analytics: SkillAnalytics    

class CounterargumentSummary(BaseModel):
    turns_with_counterarguments: int = 0
    total_challenge_questions: int = 0
    most_common_strategy_suggestions: list[str] = []
    recent_strategy_suggestions: list[str] = []