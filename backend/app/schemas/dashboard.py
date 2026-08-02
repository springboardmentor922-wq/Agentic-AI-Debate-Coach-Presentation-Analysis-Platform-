from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_sessions: int
    total_messages: int
    active_sessions: int
    completed_sessions: int
    average_duration: float