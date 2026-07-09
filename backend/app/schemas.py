from pydantic import BaseModel


class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role: str


class UserLogin(BaseModel):
    email: str
    password: str

from pydantic import BaseModel

class ProfileCreate(BaseModel):
    college: str
    department: str
    year: str
    language: str
    experience: str


class ProfileResponse(ProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class DebateCreate(BaseModel):
    topic: str
    difficulty: str


class DebateResponse(DebateCreate):
    id: int
    user_id: int
    status: str

    class Config:
        from_attributes = True