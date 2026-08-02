from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

service = DashboardService()


@router.get(
    "/",
    response_model=DashboardResponse
)
async def dashboard(
    db: Session = Depends(get_db)
):
    return await service.get_dashboard(db)