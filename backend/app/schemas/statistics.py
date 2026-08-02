from pydantic import BaseModel


class StatisticsResponse(BaseModel):
    total_sessions: int
    completed_sessions: int
    active_sessions: int
    total_transcript_messages: int
    average_messages_per_session: float