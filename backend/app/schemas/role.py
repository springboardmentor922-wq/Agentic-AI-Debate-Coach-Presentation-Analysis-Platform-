from pydantic import BaseModel


class RoleCreate(BaseModel):
    name: str
    description: str


class RoleResponse(RoleCreate):
    id: int

    class Config:
        from_attributes = True