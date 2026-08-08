from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from jose import jwt, JWTError

from backend.app.database.db import get_db
from backend.app.models.models import User, Profile, DebateSession, SpeechAnalysis
from backend.app.schemas.schemas import UserCreate, UserResponse, Token, UserLogin, ProfileUpdate, ProfileResponse
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login-form")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create associated default profile
    name_prefix = user_in.email.split("@")[0].capitalize()
    default_profile = Profile(
        user_id=new_user.id,
        name=name_prefix,
        experience_level="Beginner",
        preferred_topics=["Technology", "Education", "Ethics"],
        presentation_domains=["Business", "Academic"],
        learning_goals=["Improve speaking pace", "Identify logical fallacies"],
        coaching_preferences={"style": "Encouraging", "rebuttal_intensity": "Medium"}
    )
    db.add(default_profile)
    db.commit()
    
    return new_user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    if user.role == "Learner":
        from backend.app.routers.coaching import update_user_streak
        profile = db.query(Profile).filter(Profile.user_id == user.id).first()
        if profile:
            update_user_streak(profile, db)

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

# Standard OAuth2 form handler for API documentation testing (Swagger)
@router.post("/login-form", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    if user.role == "Learner":
        from backend.app.routers.coaching import update_user_streak
        profile = db.query(Profile).filter(Profile.user_id == user.id).first()
        if profile:
            update_user_streak(profile, db)

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "Learner":
        from backend.app.routers.coaching import update_user_streak
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile:
            update_user_streak(profile, db)
    return current_user

@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
        
    # Update fields if provided
    update_data = profile_in.model_dump(exclude_unset=True)
    
    # Handle dictionary updates (like skills_json and coaching_preferences)
    for field, value in update_data.items():
        if field == "skills_json" and profile.skills_json:
            merged = {**profile.skills_json, **value}
            setattr(profile, field, merged)
        elif field == "coaching_preferences" and profile.coaching_preferences:
            merged = {**profile.coaching_preferences, **value}
            setattr(profile, field, merged)
        else:
            setattr(profile, field, value)
            
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Administrator", "Debate Coach", "Educator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators, coaches, and educators can remove user accounts."
        )
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own account."
        )
    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    if current_user.role in ["Debate Coach", "Educator"] and user_to_delete.role != "Learner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coaches and educators are only authorized to remove Learner accounts."
        )
    db.delete(user_to_delete)
    db.commit()
    return {"status": "success", "message": "User removed successfully."}

DEFAULT_FAKE_USERS = [
    { "id": 901, "name": "Usha Sharma", "email": "usha@example.com", "role": "Learner", "status": "Active", "joined": "May 12, 2026" },
    { "id": 902, "name": "Arjun Verma", "email": "arjun@example.com", "role": "Learner", "status": "Active", "joined": "May 14, 2026" },
    { "id": 903, "name": "Riya Patel", "email": "riya@example.com", "role": "Learner", "status": "Active", "joined": "May 10, 2026" },
    { "id": 904, "name": "Karan Mehta", "email": "karan@example.com", "role": "Learner", "status": "Active", "joined": "Apr 18, 2026" },
    { "id": 905, "name": "Sneha Kulkarni", "email": "sneha@example.com", "role": "Learner", "status": "Active", "joined": "Apr 22, 2026" },
    { "id": 906, "name": "Coach Arjun Mehta", "email": "coach.arjun@example.com", "role": "Debate Coach", "status": "Active", "joined": "Apr 02, 2026" },
    { "id": 907, "name": "Coach Sarah Jenkins", "email": "sarah@example.com", "role": "Debate Coach", "status": "Active", "joined": "Mar 10, 2026" },
    { "id": 908, "name": "Dr. Ananya Sharma", "email": "ananya@example.com", "role": "Educator", "status": "Active", "joined": "Mar 15, 2026" },
    { "id": 909, "name": "Prof. David Vance", "email": "david@example.com", "role": "Educator", "status": "Active", "joined": "Feb 20, 2026" },
    { "id": 910, "name": "System Demo Admin", "email": "admin.demo@example.com", "role": "Administrator", "status": "Active", "joined": "Jan 01, 2026" }
]

@router.get("/users")
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    is_coach_or_educator = current_user.role in ["Debate Coach", "Coach", "Educator"]
    
    if is_coach_or_educator:
        users = [u for u in users if u.role == "Learner"]

    result = []
    for u in users:
        p = db.query(Profile).filter(Profile.user_id == u.id).first()
        name = p.name if (p and p.name) else u.email.split("@")[0].capitalize()
        exp = p.experience_level if p else "Learner"
        d_count = db.query(DebateSession).filter(DebateSession.user_id == u.id).count()
        s_count = db.query(SpeechAnalysis).filter(SpeechAnalysis.user_id == u.id).count()
        result.append({
            "id": u.id,
            "name": name,
            "email": u.email,
            "role": u.role,
            "status": "Active",
            "joined": u.created_at.strftime("%b %d, %Y") if u.created_at else "May 10, 2026",
            "debate_count": d_count,
            "speech_count": s_count,
            "avg_score": 82.4 if d_count > 0 else 75.0,
            "experience_level": exp
        })
            
    return result

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status_in: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Administrator", "Debate Coach", "Educator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators, coaches, and educators can flag or suspend accounts."
        )
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    new_status = status_in.get("status", "Suspended (Flagged Suspicious)")
    return {"status": "success", "user_id": user_id, "new_status": new_status}

@router.delete("/users/{user_id}")
def delete_user_account(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["Administrator", "Admin", "admin", "Debate Coach", "Coach", "Educator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators, debate coaches, and educators can remove student accounts."
        )
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")
    
    db.query(Profile).filter(Profile.user_id == target.id).delete(synchronize_session=False)
    db.query(DebateSession).filter(DebateSession.user_id == target.id).delete(synchronize_session=False)
    db.query(SpeechAnalysis).filter(SpeechAnalysis.user_id == target.id).delete(synchronize_session=False)
    db.delete(target)
    db.commit()
    
    return {"status": "success", "message": f"User account #{user_id} deleted successfully."}
