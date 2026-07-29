"""
=========================================================
User Schemas

Defines response models for user-related APIs.

Used By:
- Authentication
- User Profile
- Dashboard
=========================================================
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


# =========================================================
# User Response Schema
# =========================================================

class UserResponse(BaseModel):
    """
    Response schema returned to the frontend.
    """

    id: int

    full_name: str

    email: str

    role: str

    is_active: bool

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )