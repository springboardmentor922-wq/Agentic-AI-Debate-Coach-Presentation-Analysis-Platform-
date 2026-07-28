from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_debates: int
    average_score: int
    completed_sessions: int
    current_level: str