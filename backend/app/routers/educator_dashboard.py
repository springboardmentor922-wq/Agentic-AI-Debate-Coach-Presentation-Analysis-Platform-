from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.utils.jwt_handler import get_current_user

from app.services.educator_dashboard_service import (
    get_educator_dashboard_summary
)


router = APIRouter(
    prefix="/educator/dashboard",
    tags=["Educator Dashboard"]
)


# ============================================================
# EDUCATOR DASHBOARD SUMMARY
# ============================================================

@router.get("/summary")
def educator_dashboard_summary(

    period: str = Query(
        "6w",
        pattern="^(6w|3m|year)$"
    ),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    # --------------------------------------------------------
    # ROLE CHECK
    # --------------------------------------------------------

    if current_user.role != "Educator":

        raise HTTPException(
            status_code=403,
            detail="Educator access required"
        )


    # --------------------------------------------------------
    # GET DASHBOARD DATA
    # --------------------------------------------------------

    return get_educator_dashboard_summary(

        educator_id=current_user.id,

        db=db,

        period=period

    )