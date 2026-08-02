"""
=========================================================
Debate Topic Schemas

Defines request and response models for:

- Create Debate Topic
- Update Debate Topic
- View Debate Topic

Used By:
- Debate Topic API
- Debate Topic Service

=========================================================
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# Create Debate Topic Request
# =========================================================

class CreateDebateTopicRequest(BaseModel):
    """
    Request schema for creating a debate topic.
    """

    title: str = Field(
        ...,
        min_length=5,
        max_length=255
    )

   
    category: str = Field(
        ...,
        max_length=100
    )

    difficulty_level: str = Field(
        ...,
        max_length=30
    )

    debate_format: str = Field(
        ...,
        max_length=100
    )


    topic_type: str = "CUSTOM"

    visibility: str = "PUBLIC"

    estimated_duration: int = 20

    learning_goal: Optional[str] = None

# =========================================================
# Update Debate Topic Request
# =========================================================

class UpdateDebateTopicRequest(BaseModel):
    """
    Request schema for updating a debate topic.
    """

    title: Optional[str] = Field(
        default=None,
        min_length=5,
        max_length=255
    )

   

    category: Optional[str] = Field(
        default=None,
        max_length=100
    )

    difficulty_level: Optional[str] = Field(
        default=None,
        max_length=30
    )

    debate_format: Optional[str] = Field(
        default=None,
        max_length=100
    )

    is_active: Optional[bool] = None


# =========================================================
# Debate Topic Response
# =========================================================

class DebateTopicResponse(BaseModel):
    """
    Response schema returned to the frontend.
    """

    id: int

    title: str

    

    category: Optional[str]

    difficulty_level: Optional[str]

    debate_format: str

    is_active: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )

    topic_type: str

    visibility: str

    estimated_duration: int

    learning_goal: Optional[str]

    is_system_generated: bool

    created_by: Optional[int]