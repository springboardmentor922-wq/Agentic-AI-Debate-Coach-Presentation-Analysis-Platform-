import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.db.postgres import get_db
from app.models.presentation_domain import PresentationDomainOption
from app.models.role import Role, RoleName
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.user import OnboardingRequest, ProfileOut, ProfileUpdateRequest, UserOut

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/me/profile", response_model=ProfileOut)
def read_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.put("/me/profile", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = payload.model_dump(exclude_unset=True)
    domain_ids = update_data.pop("presentation_domain_ids", None)

    for field, value in update_data.items():
        setattr(profile, field, value)

    if domain_ids is not None:
        unique_ids = list(dict.fromkeys(domain_ids))  # de-dupe, preserve order
        domains = db.query(PresentationDomainOption).filter(PresentationDomainOption.id.in_(unique_ids)).all()
        found_ids = {d.id for d in domains}
        invalid_ids = set(unique_ids) - found_ids
        if invalid_ids:
            raise HTTPException(status_code=400, detail=f"Invalid domain id(s): {sorted(invalid_ids)}")
        profile.presentation_domains = domains

    db.commit()
    db.refresh(profile)

    return profile


@router.patch("/me/onboarding", response_model=UserOut)
def complete_onboarding(
    payload: OnboardingRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if payload.role == RoleName.ADMINISTRATOR:
        raise HTTPException(status_code=403, detail="You cannot self-select the Administrator role.")

    # Verify the reCAPTCHA token with Google before proceeding
    verify_response = httpx.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={"secret": settings.RECAPTCHA_SECRET_KEY, "response": payload.recaptcha_token},
        timeout=10,
    )
    result = verify_response.json()
    if not result.get("success"):
        raise HTTPException(status_code=400, detail="reCAPTCHA verification failed. Please try again.")

    role = db.query(Role).filter(Role.name == payload.role.value).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    current_user.role_id = role.id
    current_user.onboarding_completed = True
    db.commit()
    db.refresh(current_user)

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    for field in ("bio", "institution", "learning_goals", "preferred_topics", "experience_level"):
        value = getattr(payload, field)
        if value is not None:
            setattr(profile, field, value)

    db.commit()

    return current_user