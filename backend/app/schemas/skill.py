from typing import Optional
from pydantic import BaseModel, Field


class SkillCreate(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    level: int = Field(ge=0, le=100, description="Skill proficiency, 0-100")
    category: Optional[str] = Field(default=None, description="e.g. Argumentation, Delivery, Research")
    notes: Optional[str] = None


class SkillUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=60)
    level: Optional[int] = Field(default=None, ge=0, le=100)
    category: Optional[str] = None
    notes: Optional[str] = None


class SkillOut(BaseModel):
    id: str
    user_id: str
    name: str
    level: int
    category: Optional[str] = None
    notes: Optional[str] = None
    updated_at: str
