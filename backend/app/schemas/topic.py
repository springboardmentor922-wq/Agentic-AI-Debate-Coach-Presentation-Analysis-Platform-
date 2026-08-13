from datetime import datetime, timedelta

from pydantic import BaseModel, ConfigDict, Field

from app.models.debate_topic import TopicDifficulty


class TopicCreate(BaseModel):
    title: str = Field(min_length=10)
    category: str | None = None
    description: str | None = None
    difficulty: TopicDifficulty = TopicDifficulty.MEDIUM

    compatible_formats: list[str] = Field(default_factory=list)
    estimated_duration: timedelta | None = None
    background_notes: str | None = None
    scope: str = "global"
    assigned_class_id: int | None = None
    assigned_coach_id: int | None = None


class TopicOut(BaseModel):
    id: int
    title: str
    category: str | None = None
    description: str | None = None
    difficulty: TopicDifficulty
    compatible_formats: list[str] = Field(default_factory=list)
    estimated_duration: timedelta | None = None
    background_notes: str | None = None
    scope: str = "global"
    created_by_id: int | None = None
    assigned_class_id: int | None = None
    assigned_coach_id: int | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)