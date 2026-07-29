"""
=========================================================
Session Participant Schemas

Request & Response models for:

- Add Participant
- Update Participant
- View Participant

=========================================================
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# Create Participant
# =========================================================

class CreateSessionParticipantRequest(BaseModel):

    session_id: int

    user_id: int

    role_in_session: str = Field(
        ...,
        max_length=30
    )

    position: str = Field(
        ...,
        max_length=20
    )


# =========================================================
# Update Participant
# =========================================================

class UpdateSessionParticipantRequest(BaseModel):

    role_in_session: Optional[str] = None

    position: Optional[str] = None

    joined_at: Optional[datetime] = None

    left_at: Optional[datetime] = None


# =========================================================
# Response
# =========================================================

class SessionParticipantResponse(BaseModel):

    id: int

    session_id: int

    user_id: int

    role_in_session: str

    position: str

    joined_at: Optional[datetime]

    left_at: Optional[datetime]

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )