from pydantic import BaseModel

from typing import Optional

from datetime import datetime


class AnnouncementCreate(BaseModel):

    title: str

    message: str

    classroom_id: Optional[int] = None

    priority: str = "Normal"


class AnnouncementResponse(BaseModel):

    id: int

    educator_id: int

    classroom_id: Optional[int]

    title: str

    message: str

    priority: str

    created_at: datetime

    class Config:

        from_attributes = True