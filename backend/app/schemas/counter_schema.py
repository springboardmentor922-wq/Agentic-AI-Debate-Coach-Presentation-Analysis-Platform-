from pydantic import BaseModel

class CounterRequest(BaseModel):
    topic: str
    position: str


class CounterResponse(BaseModel):
    counter_arguments: list[str]