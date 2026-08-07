from typing import Optional, List
from pydantic import BaseModel, Field


class ChatSessionOut(BaseModel):
    id: str
    title: str
    page_key: Optional[str] = None
    created_at: str
    updated_at: str
    last_message_preview: Optional[str] = None


class ChatMessageOut(BaseModel):
    id: str
    session_id: str
    role: str  # "user" | "assistant"
    text: str
    agents_used: List[str] = []
    suggested_questions: List[str] = []
    liked: Optional[bool] = None  # True = 👍, False = 👎, None = no feedback
    created_at: str


class SendMessageRequest(BaseModel):
    text: str = Field(min_length=1)
    page_key: str = Field(
        default="general",
        description="Current page identifier the widget detected, e.g. 'learner_dashboard', 'debate_session'.",
    )
    argument_text: Optional[str] = Field(
        default=None,
        description="Optional pasted/selected argument text the user wants analyzed directly (feeds "
        "Argument Analysis / Fallacy Detection / Counterargument agents even outside their normal pages).",
    )


class SendMessageResponse(BaseModel):
    session_id: str
    user_message: ChatMessageOut
    assistant_message: ChatMessageOut


class MessageFeedbackRequest(BaseModel):
    liked: Optional[bool] = None


class CreateSessionRequest(BaseModel):
    page_key: Optional[str] = "general"
    title: Optional[str] = None
