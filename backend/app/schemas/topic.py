from pydantic import BaseModel


class TopicCreate(BaseModel):
    title: str
    category: str
    difficulty: str
    description: str


class TopicResponse(TopicCreate):
    id: int

    class Config:
        from_attributes = True