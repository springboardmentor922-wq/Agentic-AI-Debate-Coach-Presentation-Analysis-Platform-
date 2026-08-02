from pydantic import BaseModel


class DebateRecordResponse(BaseModel):
    id: int
    session_id: int
    transcript: str

    class Config:
        from_attributes = True