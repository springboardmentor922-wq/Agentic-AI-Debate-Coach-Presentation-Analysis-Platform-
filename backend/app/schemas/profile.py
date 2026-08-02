from pydantic import BaseModel


class ProfileCreate(BaseModel):
    learning_goal: str
    preferred_topics: str
    bio: str
    experience_level: str


class ProfileResponse(ProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True