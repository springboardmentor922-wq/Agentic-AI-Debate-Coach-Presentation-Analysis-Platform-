from pydantic import BaseModel
from typing import Optional


class CoachProfileCreate(BaseModel):
    phone: str
    bio: str
    experience: int
    qualification: str
    organization: str
    specialization: str
    languages: str
    availability: str
    linkedin: str

    mentor_tagline: str


class CoachProfileResponse(BaseModel):
    id: int
    user_id: int
    phone: str
    bio: str
    experience: int
    qualification: str
    organization: str
    specialization: str
    languages: str
    availability: str
    rating: str
    linkedin: str

    mentor_tagline: str

    students_mentored: int

    email_visible: bool

    class Config:
        from_attributes = True