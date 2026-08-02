from pydantic import BaseModel


class SessionCreate(BaseModel):
    topic_id: int
    session_type: str
    debate_format: str
    status: str
    duration: int
    position: str


class SessionResponse(SessionCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True