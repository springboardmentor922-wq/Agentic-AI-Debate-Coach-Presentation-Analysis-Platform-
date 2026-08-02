from fastapi import APIRouter, Depends ,status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.skill import SkillTracking
from app.schemas.skill import SkillCreate
from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/skills",
    tags=["Skill Tracking"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_skill_record(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_skill = SkillTracking(
        user_id=current_user.id,
        **skill.model_dump()
    )

    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)

    return new_skill

@router.get("/")
def get_skill_records(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(SkillTracking).filter(
        SkillTracking.user_id == current_user.id
    ).all()