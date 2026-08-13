from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.postgres import get_db
from app.models.presentation_history import PresentationDomain, PresentationHistory, PresentationStatus
from app.models.user import User
from app.schemas.presentation_history import (
    PresentationHistoryCreate,
    PresentationHistoryList,
    PresentationHistoryResponse,
)

router = APIRouter(prefix="/api/v1/presentation-history", tags=["Presentation History"])

SORT_OPTIONS = {
    "newest": desc(PresentationHistory.created_at),
    "oldest": asc(PresentationHistory.created_at),
    "highest_score": desc(PresentationHistory.overall_score),
}


@router.get("", response_model=PresentationHistoryList)
def list_presentation_history(
    domain: PresentationDomain | None = None,
    status: PresentationStatus | None = None,
    sort: str = Query(default="newest", description="newest | oldest | highest_score"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(PresentationHistory).filter(PresentationHistory.user_id == current_user.id)

    if domain:
        query = query.filter(PresentationHistory.domain == domain)
    if status:
        query = query.filter(PresentationHistory.status == status)

    total = query.count()
    order_clause = SORT_OPTIONS.get(sort, SORT_OPTIONS["newest"])
    items = (
        query.order_by(order_clause)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PresentationHistoryList(total=total, page=page, page_size=page_size, items=items)


@router.get("/{presentation_id}", response_model=PresentationHistoryResponse)
def get_presentation_history_detail(
    presentation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    record = (
        db.query(PresentationHistory)
        .filter(PresentationHistory.id == presentation_id, PresentationHistory.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Presentation record not found")
    return record


@router.delete("/{presentation_id}", status_code=204)
def delete_presentation_history(
    presentation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    record = (
        db.query(PresentationHistory)
        .filter(PresentationHistory.id == presentation_id, PresentationHistory.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Presentation record not found")
    db.delete(record)
    db.commit()