"""
=========================================================
Session Round Schemas

Request & Response models for:

- Create Round
- Update Round
- View Round

=========================================================
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# Create Round
# =========================================================

class CreateSessionRoundRequest(BaseModel):

    session_id: int

    round_number: int

    round_name: str = Field(
        ...,
        max_length=50
    )

    duration_minutes: int


# =========================================================
# Update Round
# =========================================================

class UpdateSessionRoundRequest(BaseModel):

    round_name: Optional[str] = None

    duration_minutes: Optional[int] = None

    status: Optional[str] = None

    started_at: Optional[datetime] = None

    ended_at: Optional[datetime] = None


# =========================================================
# Response
# =========================================================

class SessionRoundResponse(BaseModel):

    id: int

    session_id: int

    round_number: int

    round_name: str

    duration_minutes: int

    status: str

    started_at: Optional[datetime]

    ended_at: Optional[datetime]

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )