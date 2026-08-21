"""
=========================================================
User Profile Schemas
=========================================================
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# Create Profile Request
# =========================================================

class CreateProfileRequest(BaseModel):

    # User Table
    full_name: Optional[str] = None

    email: Optional[str] = None

    # Profile Table
    phone_number: Optional[str] = Field(default=None, max_length=20)

    institution: Optional[str] = Field(default=None, max_length=150)

    location: Optional[str] = Field(default=None, max_length=100)

    date_of_birth: Optional[date] = None

    gender: Optional[str] = Field(default=None, max_length=20)

    bio: Optional[str] = Field(default=None, max_length=500)

    experience_level: Optional[str] = Field(default=None, max_length=50)

    learning_goals: Optional[str] = Field(default=None, max_length=500)

    preferred_debate_topics: Optional[str] = Field(default=None, max_length=500)

    presentation_domains: Optional[str] = Field(default=None, max_length=500)

    coaching_preferences: Optional[str] = Field(default=None, max_length=500)


# =========================================================
# Update Profile Request
# =========================================================

class UpdateProfileRequest(BaseModel):

    full_name: Optional[str] = None

    email: Optional[str] = None

    phone_number: Optional[str] = None

    institution: Optional[str] = None

    location: Optional[str] = None

    date_of_birth: Optional[date] = None

    gender: Optional[str] = None

    bio: Optional[str] = None

    experience_level: Optional[str] = None

    learning_goals: Optional[str] = None

    preferred_debate_topics: Optional[str] = None

    presentation_domains: Optional[str] = None

    coaching_preferences: Optional[str] = None


# =========================================================
# Profile Response
# =========================================================

class ProfileResponse(BaseModel):

    id: int

    user_id: int

    full_name: Optional[str]

    email: Optional[str]

    phone_number: Optional[str]

    institution: Optional[str]

    location: Optional[str]

    date_of_birth: Optional[date]

    gender: Optional[str]

    bio: Optional[str]

    experience_level: Optional[str]

    learning_goals: Optional[str]

    preferred_debate_topics: Optional[str]

    presentation_domains: Optional[str]

    coaching_preferences: Optional[str]

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)