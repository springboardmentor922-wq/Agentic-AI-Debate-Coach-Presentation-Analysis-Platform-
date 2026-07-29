"""
Milestone 4 — Achievement Engine & Certificate Engine endpoints.

Both lists are purely a read of what evaluate_achievements_for_user /
evaluate_certificates_for_user have actually unlocked/issued for this
learner (triggered from debate_live.py::finish_debate) — there is no
seed data and no way for a fake entry to appear here.
"""
from fastapi import APIRouter, Depends

from app.core.deps import require_roles
from app.schemas.user import UserRole
from app.schemas.achievements import AchievementOut, CertificateOut
from app.services.achievement_engine import list_achievements_for_user
from app.services.certificate_engine import list_certificates_for_user

router = APIRouter(prefix="/api/v1", tags=["Achievements & Certificates"])


@router.get("/achievements", response_model=list[AchievementOut])
async def get_my_achievements(current_user: dict = Depends(require_roles(UserRole.learner))):
    docs = await list_achievements_for_user(current_user["id"])
    return [AchievementOut(id=str(d["_id"]), **{k: v for k, v in d.items() if k not in ("_id", "id")}) for d in docs]


@router.get("/certificates", response_model=list[CertificateOut])
async def get_my_certificates(current_user: dict = Depends(require_roles(UserRole.learner))):
    docs = await list_certificates_for_user(current_user["id"])
    return [CertificateOut(id=str(d["_id"]), **{k: v for k, v in d.items() if k not in ("_id", "id")}) for d in docs]
