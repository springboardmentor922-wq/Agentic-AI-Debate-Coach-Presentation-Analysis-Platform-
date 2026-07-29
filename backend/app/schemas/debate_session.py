"""
=========================================================
Debate Session Schemas

Defines request and response models for:

- Create Debate Session
- Update Debate Session
- View Debate Session

Used By:
- Debate Session API
- Debate Session Service

=========================================================
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# Create Debate Session Request
# =========================================================

class CreateDebateSessionRequest(BaseModel):
    """
    Request schema for creating a debate session.
    """

    topic_id: int = Field(
        ...,
        gt=0,
        description="Selected debate topic ID"
    )

    debate_format: str = Field(
        ...,
        max_length=50,
        description="Debate format"
    )

    debate_position: str = Field(
        ...,
        max_length=20,
        description="User position in debate"
    )

    scheduled_at: datetime = Field(
        ...,
        description="Scheduled date and time"
    )


# =========================================================
# Update Debate Session Request
# =========================================================

class UpdateDebateSessionRequest(BaseModel):
    """
    Request schema for updating a debate session.
    """

    debate_format: Optional[str] = Field(
        default=None,
        max_length=50
    )

    debate_position: Optional[str] = Field(
        default=None,
        max_length=20
    )

    scheduled_at: Optional[datetime] = None

    session_status: Optional[str] = Field(
        default=None,
        max_length=30
    )


# =========================================================
# Debate Session Response
# =========================================================

class DebateSessionResponse(BaseModel):
    """
    Response schema returned to the frontend.
    """

    id: int

    user_id: int

    topic_id: int

    debate_format: str

    debate_position: str

    scheduled_at: Optional[datetime]

    session_status: str

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )