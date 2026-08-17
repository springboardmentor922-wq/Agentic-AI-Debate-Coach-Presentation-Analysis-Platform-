from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    profile_completed: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    profile_completed: bool

    experience_level: Optional[str] = None

    learning_goal: Optional[str] = None

    college: Optional[str] = None

    branch: Optional[str] = None

    graduation_year: Optional[int] = None

    cgpa: Optional[float] = None

    github: Optional[str] = None

    linkedin: Optional[str] = None

    portfolio: Optional[str] = None

    class Config:
        from_attributes = True

class UpdateProfile(BaseModel):
    full_name: Optional[str] = None
    experience_level: Optional[str] = None
    learning_goal: Optional[str] = None
    college: Optional[str] = None

    branch: Optional[str] = None

    graduation_year: Optional[int] = None

    cgpa: Optional[float] = None

    github: Optional[str] = None

    linkedin: Optional[str] = None

    portfolio: Optional[str] = None