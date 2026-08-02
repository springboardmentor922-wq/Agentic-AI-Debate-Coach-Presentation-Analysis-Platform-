from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.analytics import (
    AnalyticsOverview,
    PerformanceAnalytics,
    HistoryAnalytics,
)
from app.services.analytics.analytics_service import AnalyticsService

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

service = AnalyticsService()


@router.get(
    "/overview",
    response_model=AnalyticsOverview,
)
async def overview(
    db: Session = Depends(get_db),
):
    return await service.get_overview(db)


@router.get(
    "/performance/{session_id}",
    response_model=PerformanceAnalytics,
)
async def performance(
    session_id: int,
):
    return await service.get_performance(session_id)


@router.get(
    "/history",
    response_model=list[HistoryAnalytics],
)
async def history(
    db: Session = Depends(get_db),
):
    return await service.get_history(db)