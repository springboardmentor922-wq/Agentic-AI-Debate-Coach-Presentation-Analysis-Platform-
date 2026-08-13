from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    title: str | None = None


class ConversationUpdate(BaseModel):
    title: str | None = None
    pinned: bool | None = None
    archived: bool | None = None


class ConversationOut(BaseModel):
    id: int
    title: str
    pinned: bool
    archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=8000)


class MessageOut(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    timestamp: datetime


class SendMessageResponse(BaseModel):
    user_message: MessageOut
    assistant_message: MessageOut