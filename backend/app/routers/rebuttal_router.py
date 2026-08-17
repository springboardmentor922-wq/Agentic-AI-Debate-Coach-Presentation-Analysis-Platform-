from fastapi import APIRouter

from app.schemas.rebuttal_schema import (
    RebuttalRequest,
    RebuttalResponse
)

from app.services.rebuttal_service import (
    generate_rebuttal
)

router = APIRouter(
    prefix="/ai",
    tags=["Rebuttal Generator"]
)

@router.post(
    "/rebuttal",
    response_model=RebuttalResponse
)
def rebuttal(data: RebuttalRequest):

    return generate_rebuttal(
        data.opponent_argument
    )