from fastapi import APIRouter

from app.schemas.recommendation import RecommendationResponse
from app.services.recommendation.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)

service = RecommendationService()


@router.get(
    "/{session_id}",
    response_model=RecommendationResponse
)
async def recommendations(session_id: int):
    return await service.generate(session_id)