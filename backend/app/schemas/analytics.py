from pydantic import BaseModel


class AnalyticsOverview(BaseModel):

    total_sessions: int

    average_score: int

    wins: int

    completed: int

    active_sessions: int

    average_duration: float


class PerformanceAnalytics(BaseModel):

    total_messages: int

    user_messages: int

    ai_messages: int


class HistoryAnalytics(BaseModel):

    session_id: int

    topic: str

    score: int

    strengths: list[str]

    weaknesses: list[str]

    feedback: str