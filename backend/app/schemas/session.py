from pydantic import BaseModel


class SessionCreate(BaseModel):
    title: str
    topic: str
    position: str


class SessionUpdate(BaseModel):
    title: str
    topic: str
    position: str
    status: str