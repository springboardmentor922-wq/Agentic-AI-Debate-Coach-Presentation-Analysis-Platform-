from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.schemas.fallacy_schema import (
    FallacyRequest,
    FallacyResponse,
)

from app.services.fallacy_service import (
    detect_fallacies
)

from app.services.fallacy_report_service import (
    create_fallacy_report,
    get_fallacy_reports,
    get_fallacy_report
)

from app.database.database import get_db

from app.models.user import User

from app.utils.jwt_handler import get_current_user


router = APIRouter(
    prefix="/ai",
    tags=["Fallacy Detector"]
)


@router.post(
    "/fallacies",
    response_model=FallacyResponse
)
def detect(
    data: FallacyRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    result = detect_fallacies(
        data.argument
    )

    create_fallacy_report(
        learner_id=current_user.id,
        argument=data.argument,
        result=result,
        db=db
    )

    return result


@router.get(
    "/fallacy-reports"
)
def fallacy_reports(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    return get_fallacy_reports(db)


@router.get(
    "/fallacy-reports/{report_id}"
)
def fallacy_report_details(
    report_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    report = get_fallacy_report(
        report_id,
        db
    )

    if not report:

        raise HTTPException(
            status_code=404,
            detail="Fallacy report not found"
        )

    return report