from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.statistics import StatisticsResponse
from app.services.statistics.statistics_service import StatisticsService

router = APIRouter(
    prefix="/statistics",
    tags=["Statistics"]
)

service = StatisticsService()


@router.get(
    "/",
    response_model=StatisticsResponse
)
async def statistics(
    db: Session = Depends(get_db)
):
    return await service.get_statistics(db)