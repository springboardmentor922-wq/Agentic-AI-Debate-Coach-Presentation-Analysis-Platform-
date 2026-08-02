from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "Learner"
    experience: str = "Beginner"


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    experience: str

    class Config:
        from_attributes = True