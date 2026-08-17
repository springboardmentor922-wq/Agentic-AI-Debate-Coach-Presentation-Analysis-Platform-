from pydantic import BaseModel


class EducatorProfileCreate(BaseModel):
    phone: str
    bio: str
    institution: str
    department: str
    designation: str
    experience: int
    subjects: str
    office_hours: str
    research_interests: str
    courses_handled: str


class EducatorProfileResponse(BaseModel):
    id: int
    user_id: int

    phone: str
    bio: str
    institution: str
    department: str
    designation: str
    experience: int
    subjects: str
    office_hours: str
    research_interests: str
    courses_handled: str

    class Config:
        from_attributes = True