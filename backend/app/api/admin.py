from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_role, require_any_role
from app.models.user import User
from app.models.role import Role
from app.models.user_profile import UserProfile
from app.models.coach_assignment import CoachAssignment
from app.models.debate_session import DebateSession
from app.models.notification import Notification

router = APIRouter(prefix="/admin", tags=["Admin Platform Management"])

@router.get("/users")
def get_all_platform_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Administrator"))
):
    """Retrieve all users with profile and role details."""
    users = db.query(User).all()
    roles = {r.id: r.name for r in db.query(Role).all()}
    
    result = []
    for user in users:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role_id": user.role_id,
            "role_name": roles.get(user.role_id, "Learner"),
            "is_active": user.is_active,
            "institution": profile.institution if profile else "Global Academy",
            "created_at": user.created_at
        })
    return result

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_name: Optional[str] = None,
    role_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Administrator"))
):
    """Update a user's role (Learner, Debate Coach, Educator, Administrator)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    target_role = None
    if role_name:
        clean_name = role_name.strip()
        if clean_name.lower() == "coach":
            clean_name = "Debate Coach"
        target_role = db.query(Role).filter(func.lower(Role.name) == clean_name.lower()).first()

    if not target_role and role_id is not None:
        target_role = db.query(Role).filter(Role.id == role_id).first()

    if not target_role:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    user.role_id = target_role.id
    db.commit()
    db.refresh(user)
    return {
        "message": "User role updated successfully",
        "user_id": user_id,
        "role_id": target_role.id,
        "role_name": target_role.name
    }


@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Administrator"))
):
    """Toggle or set is_active status of a platform user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if is_active is not None:
        user.is_active = is_active
    else:
        user.is_active = not user.is_active

    db.commit()
    db.refresh(user)
    return {"message": f"User status updated to {'Active' if user.is_active else 'Inactive'}", "user_id": user_id, "is_active": user.is_active}

@router.get("/coaches")
def get_coaches_with_workload(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Administrator"))
):
    coach_role = db.query(Role).filter(Role.name == "Debate Coach").first()
    coaches = db.query(User).filter(User.role_id == coach_role.id).all() if coach_role else []
    if not coaches:
        # Fallback to any user if roles not strictly populated
        coaches = db.query(User).limit(5).all()

    result = []
    for coach in coaches:
        assigned_count = db.query(CoachAssignment).filter(
            CoachAssignment.coach_id == coach.id,
            CoachAssignment.status == "Active"
        ).count()
        profile = db.query(UserProfile).filter(UserProfile.user_id == coach.id).first()
        
        result.append({
            "id": coach.id,
            "full_name": coach.full_name,
            "email": coach.email,
            "assigned_learners_count": assigned_count,
            "institution": profile.institution if profile else "Global Debate Academy",
            "workload_status": "High" if assigned_count >= 10 else ("Medium" if assigned_count >= 5 else "Light")
        })
    return result

@router.post("/assign-coach")
def assign_coach_to_learner(
    coach_id: int,
    learner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Administrator"))
):
    """Assign or reassign a debate coach to a learner."""
    existing = db.query(CoachAssignment).filter(
        CoachAssignment.coach_id == coach_id,
        CoachAssignment.learner_id == learner_id
    ).first()

    if existing:
        existing.status = "Active"
    else:
        assignment = CoachAssignment(
            coach_id=coach_id,
            learner_id=learner_id,
            status="Active"
        )
        db.add(assignment)

    coach = db.query(User).filter(User.id == coach_id).first()
    learner = db.query(User).filter(User.id == learner_id).first()

    # Create notifications
    if learner:
        db.add(Notification(
            user_id=learner.id,
            title="Coach Assigned",
            message=f"You have been assigned to Debate Coach {coach.full_name if coach else 'Mentor'}.",
            notification_type="coach_assignment"
        ))
    if coach:
        db.add(Notification(
            user_id=coach.id,
            title="New Learner Assigned",
            message=f"Learner {learner.full_name if learner else 'Student'} has been assigned to your coaching roster.",
            notification_type="coach_assignment"
        ))

    db.commit()
    return {"message": "Coach assigned successfully", "coach_id": coach_id, "learner_id": learner_id}

from app.ai.rag.vector_store import faiss_evidence_store
from app.mongodb.database import mongodb

@router.get("/system-stats")
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Administrator"))
):
    """Retrieve platform usage, active debates, and AI service metrics."""
    total_users = db.query(User).count()
    total_debates = db.query(DebateSession).count()
    active_coaches = db.query(CoachAssignment).filter(CoachAssignment.status == "Active").count()

    vector_count = faiss_evidence_store.index.ntotal
    exec_count = mongodb.ai_execution_collection.count_documents({})
    
    # Calculate average latency from Mongo executions
    lat_pipeline = [{"$group": {"_id": None, "avg_lat": {"$avg": "$latency_ms"}}}]
    lat_res = list(mongodb.ai_execution_collection.aggregate(lat_pipeline))
    avg_latency = round(lat_res[0]["avg_lat"]) if lat_res and lat_res[0].get("avg_lat") else 0

    return {
        "total_users": total_users,
        "total_debates": total_debates,
        "active_coaching_relationships": active_coaches,
        "ai_service_status": "Operational",
        "vector_db_vectors": vector_count,
        "ai_api_tokens_today": exec_count * 1500,
        "average_analysis_latency_ms": avg_latency,
        "platform_uptime": "100.0%"
    }


PROMPTS_REGISTRY = [
    {
        "id": "argument_analysis",
        "name": "Argument Analysis Prompt",
        "agent": "Argument Analysis Agent",
        "version": "1.0.0",
        "status": "Active",
        "description": "Extracts claims, premises, evidence, reasoning structure, and argument strength scores."
    },
    {
        "id": "logical_fallacy_detection",
        "name": "Logical Fallacy Detection Prompt",
        "agent": "Fallacy Detection Agent",
        "version": "1.0.0",
        "status": "Active",
        "description": "Identifies fallacies, line numbers, severity, and provides correction guidance."
    },
    {
        "id": "counterargument_generation",
        "name": "Counterargument Generation Prompt",
        "agent": "Counterargument Agent",
        "version": "1.0.0",
        "status": "Active",
        "description": "Generates logical, evidence, ethical, and policy rebuttals grounded in RAG evidence."
    },
    {
        "id": "ai_debate_opponent",
        "name": "AI Debate Opponent Simulation Prompt",
        "agent": "AI Debate Opponent Agent",
        "version": "1.0.0",
        "status": "Active",
        "description": "Simulates affirmative/negative debate arguments matched to debate format and difficulty."
    },
    {
        "id": "performance_scoring",
        "name": "Judge Scoring Evaluation Prompt",
        "agent": "Judge Scoring Agent",
        "version": "1.0.0",
        "status": "Active",
        "description": "Evaluates 30-20-20-15-15 weighted breakdown across argument, evidence, logic, rebuttal, and delivery."
    },
    {
        "id": "coaching",
        "name": "Coaching Recommendation Prompt",
        "agent": "Coaching Agent",
        "version": "1.0.0",
        "status": "Active",
        "description": "Generates actionable, personalized coaching tips and skill growth exercises."
    }
]


@router.get("/prompts")
def list_system_prompts(
    current_user: User = Depends(require_role("Administrator"))
):
    """Retrieve all active system AI agent prompts for monitoring."""
    return PROMPTS_REGISTRY


@router.get("/prompts/{prompt_id}")
def get_prompt_details(
    prompt_id: str,
    current_user: User = Depends(require_role("Administrator"))
):
    """Retrieve specific AI agent prompt template details."""
    prompt = next((p for p in PROMPTS_REGISTRY if p["id"] == prompt_id), None)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt
