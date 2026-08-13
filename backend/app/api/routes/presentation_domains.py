from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.postgres import get_db
from app.models.presentation_domain import PresentationDomainOption
from app.models.user import User
from app.schemas.presentation_domain import PresentationDomainOut

router = APIRouter(prefix="/api/v1/presentation-domains", tags=["Presentation Domains"])


@router.get("", response_model=list[PresentationDomainOut])
def list_presentation_domains(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return db.query(PresentationDomainOption).order_by(PresentationDomainOption.name).all()