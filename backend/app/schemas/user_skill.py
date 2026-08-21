"""
=========================================================
User Skill Schemas

Defines request and response models for:

- Create User Skill
- Update User Skill
- View User Skill

Used By:
- User Skill API
- User Skill Service

=========================================================
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# Create User Skill Request
# =========================================================

class CreateUserSkillRequest(BaseModel):
    """
    Request schema for creating a user skill record.
    """

    communication_score: Decimal = Field(default=0, ge=0, le=100)

    critical_thinking_score: Decimal = Field(default=0, ge=0, le=100)

    presentation_score: Decimal = Field(default=0, ge=0, le=100)

    argument_score: Decimal = Field(default=0, ge=0, le=100)

    confidence_score: Decimal = Field(default=0, ge=0, le=100)

    total_debates: int = Field(default=0, ge=0)

    total_presentations: int = Field(default=0, ge=0)


# =========================================================
# Update User Skill Request
# =========================================================

class UpdateUserSkillRequest(BaseModel):
    """
    Request schema for updating user skill scores.
    """

    communication_score: Optional[Decimal] = Field(default=None, ge=0, le=100)

    critical_thinking_score: Optional[Decimal] = Field(default=None, ge=0, le=100)

    presentation_score: Optional[Decimal] = Field(default=None, ge=0, le=100)

    argument_score: Optional[Decimal] = Field(default=None, ge=0, le=100)

    confidence_score: Optional[Decimal] = Field(default=None, ge=0, le=100)

    total_debates: Optional[int] = Field(default=None, ge=0)

    total_presentations: Optional[int] = Field(default=None, ge=0)


# =========================================================
# User Skill Response
# =========================================================

class UserSkillResponse(BaseModel):
    """
    Response schema returned to the frontend.
    """

    id: int

    user_id: int

    communication_score: Decimal

    critical_thinking_score: Decimal

    presentation_score: Decimal

    argument_score: Decimal

    confidence_score: Decimal

    total_debates: int

    total_presentations: int

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )