from pathlib import Path
import shutil

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.evaluation_service import submit_evaluation
from app.utils.jwt_handler import get_current_user

router = APIRouter(
    prefix="/evaluation",
    tags=["Evaluation"]
)

UPLOAD_FOLDER = "uploads"

Path(UPLOAD_FOLDER).mkdir(
    exist_ok=True
)


@router.post("/submit")
def evaluate(
    topic: str = Form(...),
    argument: str = Form(...),
    audio: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    recording_path = None

    if audio:

        filename = f"{current_user.id}_{audio.filename}"

        filepath = f"{UPLOAD_FOLDER}/{filename}"

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(
                audio.file,
                buffer
            )

        recording_path = filepath

    return submit_evaluation(
        db=db,
        user_id=current_user.id,
        topic=topic,
        argument=argument,
        recording_path=recording_path
    )