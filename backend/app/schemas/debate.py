from pydantic import BaseModel


class DebateTopicCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    category: str


class DebateTopicResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    category: str

    class Config:
        from_attributes = True