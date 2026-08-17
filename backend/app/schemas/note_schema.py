from pydantic import BaseModel


class NoteCreate(BaseModel):

    title: str

    content: str


class NoteResponse(BaseModel):

    id: int

    user_id: int

    title: str

    content: str

    created_at: object

    class Config:

        from_attributes = True