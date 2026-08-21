"""
Chat API Schemas

Purpose:
    Defines the request and response models for the AI chatbot API.
"""

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):
    role: str = Field(..., description="Conversation role.")
    content: Any = Field(..., description="Message content.")


class ChatRequest(BaseModel):
    page: str = Field(..., min_length=1, description="Current page route.")
    session_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Debate session identifier.",
    )
    topic_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Debate topic identifier.",
    )
    user_id: Optional[int] = Field(
        default=None,
        gt=0,
        description="Authenticated user identifier.",
    )
    message: str = Field(
        ...,
        min_length=1,
        description="Latest user message.",
    )
    conversation_history: List[ChatHistoryItem] = Field(
        default_factory=list,
        description="Previous conversation messages.",
    )


class ChatAgentOutput(BaseModel):
    agent: str = Field(..., description="Agent name.")
    content: Any = Field(..., description="Agent response content.")


class ChatResponseData(BaseModel):
    page: str
    session_id: Optional[int] = None
    topic_id: Optional[int] = None
    user_id: Optional[int] = None
    agent_outputs: List[ChatAgentOutput]


class ChatAPIResponse(BaseModel):
    success: bool
    message: str
    data: List[ChatAgentOutput]
