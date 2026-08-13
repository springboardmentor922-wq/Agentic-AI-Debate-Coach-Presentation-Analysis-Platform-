from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    target_user_id: int
    session_id: int | None = None
    text: str = Field(min_length=1, max_length=2000)


class FeedbackOut(BaseModel):
    id: str
    author_id: int
    author_name: str
    target_user_id: int
    session_id: int | None = None
    text: str
    created_at: datetime