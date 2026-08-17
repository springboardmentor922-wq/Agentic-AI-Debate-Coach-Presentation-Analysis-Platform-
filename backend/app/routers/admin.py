from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.services.admin_service import (
    get_admin_dashboard_summary
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard/summary")
def admin_dashboard_summary(
    db: Session = Depends(get_db)
):

    return get_admin_dashboard_summary(db)