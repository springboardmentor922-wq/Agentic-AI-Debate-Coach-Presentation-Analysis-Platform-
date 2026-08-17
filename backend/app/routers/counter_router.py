from fastapi import APIRouter

from app.schemas.counter_schema import (
    CounterRequest,
    CounterResponse
)

from app.services.counter_service import (
    generate_counter_arguments
)

router = APIRouter(
    prefix="/ai",
    tags=["Counter Arguments"]
)

@router.post(
    "/counterarguments",
    response_model=CounterResponse
)
def counter(data: CounterRequest):

    return generate_counter_arguments(
        data.topic,
        data.position
    )