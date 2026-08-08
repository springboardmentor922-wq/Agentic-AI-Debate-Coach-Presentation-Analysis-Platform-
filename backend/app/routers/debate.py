from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from backend.app.database.db import get_db
from backend.app.models.models import User, DebateSession, DebateTurn, Profile, DebateTopic, Notification
from backend.app.schemas.schemas import (
    DebateSessionCreate, DebateSessionResponse, DebateSessionScheduleRequest,
    PositionAssignmentRequest, DebateTurnCreate, DebateTurnResponse,
    DebateTopicCreate, DebateTopicResponse, ArgumentAnalysisRequest,
    CombinedSpeechEvaluationResponse, ArgumentAnalysisResponse, FallacyDetectionResponse
)
from backend.app.routers.auth import get_current_user
from backend.app.services.debate_ai import analyze_user_argument, generate_ai_response, generate_rebuttal_strategies
from backend.app.services.fallacy import calculate_credibility_assessment, analyze_fallacies
from backend.app.services.argument_analysis import analyze_argument_structure

router = APIRouter(prefix="/debates", tags=["Debate Session Management"])

@router.post("/sessions", response_model=DebateSessionResponse)
def create_session(
    session_in: DebateSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if session_in.challenge_type in ["weekly", "monthly"]:
        if current_user.role != "Administrator":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can create challenges for all students."
            )
        students = db.query(User).filter(User.role == "Learner").all()
        if not students:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No learner accounts registered to assign challenge."
            )
            
        days = 7 if session_in.challenge_type == "weekly" else 30
        deadline = datetime.utcnow() + timedelta(days=days)
        first_session = None
        for student in students:
            sess = DebateSession(
                user_id=student.id,
                topic=session_in.topic,
                format=session_in.format,
                user_position=session_in.user_position,
                position_role=session_in.position_role or session_in.user_position,
                ai_personality=session_in.ai_personality,
                provider=session_in.provider or "Local Simulation Engine",
                status="active",
                is_challenge=True,
                deadline=deadline,
                challenge_type=session_in.challenge_type,
                assigned_by_id=current_user.id
            )
            db.add(sess)
            db.commit()
            db.refresh(sess)
            if not first_session:
                first_session = sess
                
            challenge_label = "Weekly Challenge" if session_in.challenge_type == "weekly" else "Monthly Challenge"
            duration_label = "1 week" if session_in.challenge_type == "weekly" else "1 month"
            notification = Notification(
                user_id=student.id,
                title=f"{challenge_label} Assigned",
                message=f"Administrator ({current_user.email}) has posted a new {challenge_label} on the topic: '{session_in.topic}'. Complete it within {duration_label}!",
                type="info"
            )
            db.add(notification)
            db.commit()
            
        return first_session

    if session_in.target_all or session_in.student_id == -1:
        if current_user.role not in ["Debate Coach", "Educator", "Administrator"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only coaches, educators, or administrators can assign live debate sessions to all students."
            )
        
        if current_user.role == "Debate Coach":
            students = db.query(User).filter(User.role == "Learner", User.coach_id == current_user.id).all()
            if not students:
                students = db.query(User).filter(User.role == "Learner").all()
        elif current_user.role == "Educator":
            students = db.query(User).filter(User.role == "Learner", User.educator_id == current_user.id).all()
            if not students:
                students = db.query(User).filter(User.role == "Learner").all()
        else:
            students = db.query(User).filter(User.role == "Learner").all()

        if not students:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No student accounts found to create debate session."
            )

        first_session = None
        for student in students:
            sess = DebateSession(
                user_id=student.id,
                assigned_by_id=current_user.id,
                topic=session_in.topic,
                format=session_in.format,
                user_position=session_in.user_position,
                position_role=session_in.position_role or session_in.user_position,
                ai_personality=session_in.ai_personality,
                provider=session_in.provider or "Local Simulation Engine",
                status="active",
                scheduled_at=session_in.scheduled_at,
                duration_minutes=session_in.duration_minutes or 30,
                round_structure=session_in.round_structure or "Standard"
            )
            db.add(sess)
            db.commit()
            db.refresh(sess)
            if not first_session:
                first_session = sess

            notification = Notification(
                user_id=student.id,
                title="Live Debate Session Created",
                message=f"Your {current_user.role} ({current_user.email}) has created a live debate session for you on topic: '{session_in.topic}'.",
                type="info"
            )
            db.add(notification)
            db.commit()

        return first_session

    target_user_id = current_user.id
    assigned_by_id = None
    if session_in.student_id is not None:
        if current_user.role not in ["Debate Coach", "Educator", "Administrator"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only coaches, educators, or administrators can assign debate sessions to students."
            )
        student = db.query(User).filter(User.id == session_in.student_id).first()
        if not student:
            from backend.app.core.security import get_password_hash
            from backend.app.routers.auth import DEFAULT_FAKE_USERS
            fake = next((f for f in DEFAULT_FAKE_USERS if f["id"] == session_in.student_id), None)
            if fake:
                student = User(email=fake["email"], hashed_password=get_password_hash("password123"), role=fake["role"])
                db.add(student)
                db.commit()
                db.refresh(student)
                p = Profile(user_id=student.id, name=fake["name"], experience_level="Learner")
                db.add(p)
                db.commit()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student user not found."
            )
        target_user_id = student.id
        assigned_by_id = current_user.id

    session = DebateSession(
        user_id=target_user_id,
        assigned_by_id=assigned_by_id,
        topic=session_in.topic,
        format=session_in.format,
        user_position=session_in.user_position,
        position_role=session_in.position_role or session_in.user_position,
        ai_personality=session_in.ai_personality,
        provider=session_in.provider or "Local Simulation Engine",
        status="active",
        scheduled_at=session_in.scheduled_at,
        duration_minutes=session_in.duration_minutes or 30,
        round_structure=session_in.round_structure or "Standard"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    if session_in.student_id is not None:
        notification = Notification(
            user_id=target_user_id,
            title="New Assigned Debate Session",
            message=f"Your coach ({current_user.email}) has created a debate session for you on the topic: '{session_in.topic}'.",
            type="info"
        )
        db.add(notification)
        db.commit()

    return session

@router.post("/sessions/schedule", response_model=DebateSessionResponse)
def schedule_session(
    schedule_in: DebateSessionScheduleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedules a debate session for a specified date and time in advance."""
    session = DebateSession(
        user_id=current_user.id,
        topic=schedule_in.topic,
        format=schedule_in.format,
        user_position=schedule_in.user_position,
        position_role=schedule_in.user_position,
        ai_personality=schedule_in.ai_personality or "Socrates",
        provider="Local Simulation Engine",
        status="scheduled",
        scheduled_at=schedule_in.scheduled_at,
        duration_minutes=schedule_in.duration_minutes
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/sessions/{session_id}/assign-position", response_model=DebateSessionResponse)
def assign_position(
    session_id: int,
    assignment: PositionAssignmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dynamically sets or swaps the participant position role in an active or scheduled session."""
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found.")
        
    session.user_position = assignment.user_position
    session.position_role = assignment.position_role or assignment.user_position
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions", response_model=List[DebateSessionResponse])
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(DebateSession).filter(DebateSession.user_id == current_user.id).order_by(DebateSession.created_at.desc()).all()

@router.get("/sessions/{session_id}", response_model=DebateSessionResponse)
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found.")
        
    if session.user_id != current_user.id and current_user.role not in ["Debate Coach", "Educator", "Administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this debate session."
        )
        
    if session.is_challenge and session.status == "active" and session.deadline and datetime.utcnow() > session.deadline:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This weekly challenge has expired and can no longer be accessed."
        )
    return session

@router.post("/sessions/{session_id}/turns", response_model=List[DebateTurnResponse])
def submit_turn(
    session_id: int,
    turn_in: DebateTurnCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found.")
        
    if session.is_challenge and session.status == "active" and session.deadline and datetime.utcnow() > session.deadline:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This weekly challenge has expired and can no longer be accessed."
        )
        
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Cannot add arguments to a completed debate session.")
        
    # Transition scheduled to active if submitting turn
    if session.status == "scheduled":
        session.status = "active"
        
    # Module 4 & 5 Hand-in-Hand Analysis
    analysis = analyze_user_argument(turn_in.text, session.topic, session.format)
    
    # Save User Turn
    user_turn = DebateTurn(
        session_id=session.id,
        speaker="User",
        text=turn_in.text,
        analysis_json=analysis
    )
    db.add(user_turn)
    db.commit()
    db.refresh(user_turn)
    
    # Update current round
    user_turns_count = db.query(DebateTurn).filter(
        DebateTurn.session_id == session.id,
        DebateTurn.speaker == "User"
    ).count()
    session.current_round = user_turns_count
    db.commit()
    
    # Fetch History for AI Context
    turns = db.query(DebateTurn).filter(DebateTurn.session_id == session.id).order_by(DebateTurn.timestamp.asc()).all()
    history = [{"speaker": t.speaker, "text": t.text} for t in turns]
    
    # Generate AI Turn
    ai_text = generate_ai_response(
        topic=session.topic,
        format=session.format,
        user_position=session.user_position,
        ai_personality=session.ai_personality,
        conversation_history=history,
        provider=session.provider
    )
    
    ai_turn = DebateTurn(
        session_id=session.id,
        speaker="AI",
        text=ai_text,
        analysis_json={}
    )
    db.add(ai_turn)
    db.commit()
    db.refresh(ai_turn)
    
    return [user_turn, ai_turn]

@router.put("/sessions/{session_id}/complete", response_model=DebateSessionResponse)
def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found.")
        
    session.status = "completed"
    
    turns = db.query(DebateTurn).filter(
        DebateTurn.session_id == session.id,
        DebateTurn.speaker == "User"
    ).all()
    
    if turns:
        avg_scores = {
            "clarity": 0.0,
            "relevance": 0.0,
            "evidence_strength": 0.0,
            "logical_consistency": 0.0,
            "persuasiveness": 0.0
        }
        for t in turns:
            scores = t.analysis_json.get("scores", {})
            for k in avg_scores.keys():
                avg_scores[k] += scores.get(k, 50.0)
                
        num_turns = len(turns)
        for k in avg_scores.keys():
            avg_scores[k] = round(avg_scores[k] / num_turns, 1)
            
        session.score = round(sum(avg_scores.values()) / len(avg_scores), 1)

        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile:
            skills = dict(profile.skills_json or {})
            skills["argumentation"] = round((skills.get("argumentation", 82.0) * 0.7) + (avg_scores["persuasiveness"] * 0.3), 1)
            skills["evidence_usage"] = round((skills.get("evidence_usage", 78.0) * 0.7) + (avg_scores["evidence_strength"] * 0.3), 1)
            skills["logical_consistency"] = round((skills.get("logical_consistency", 88.0) * 0.7) + (avg_scores["logical_consistency"] * 0.3), 1)
            skills["communication_skills"] = round((skills.get("communication_skills", 80.0) * 0.7) + (avg_scores["clarity"] * 0.3), 1)
            skills["rebuttal_effectiveness"] = round((skills.get("rebuttal_effectiveness", 75.0) * 0.7) + (avg_scores["relevance"] * 0.3), 1)
            profile.skills_json = skills
    elif session.score is None:
        session.score = 82.0
            
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions/{session_id}/rebuttals")
def get_rebuttals(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DebateSession).filter(
        DebateSession.id == session_id,
        DebateSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found.")
        
    last_ai_turn = db.query(DebateTurn).filter(
        DebateTurn.session_id == session_id,
        DebateTurn.speaker == "AI"
    ).order_by(DebateTurn.timestamp.desc()).first()
    
    if not last_ai_turn:
        last_ai_text = f"The core premise of why {session.topic} is valid."
    else:
        last_ai_text = last_ai_turn.text
        
    strategies = generate_rebuttal_strategies(
        topic=session.topic,
        format=session.format,
        user_position=session.user_position,
        ai_personality=session.ai_personality,
        last_ai_turn=last_ai_text,
        provider=session.provider
    )
    return strategies

@router.post("/analyze-argument", response_model=CombinedSpeechEvaluationResponse)
def analyze_argument_endpoint(
    req: ArgumentAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Direct endpoint for evaluating speech/text reasoning hand-in-hand using
    Module 4 (Argument Analysis Engine) and Module 5 (Logical Fallacy Detection Engine).
    """
    fallacies = analyze_fallacies(req.text)
    credibility = calculate_credibility_assessment(fallacies, req.text)
    struct = analyze_argument_structure(req.text, topic=req.topic or "General Debate", fallacy_count=len(fallacies))
    
    fallacy_items = []
    for f in fallacies:
        fallacy_items.append({
            "fallacy": f["fallacy"],
            "offending_text": f.get("match", f.get("offending_text", "")),
            "explanation": f["explanation"],
            "correction_suggestion": f["correction"],
            "severity": f.get("severity", "Medium")
        })
        
    rec_list = []
    if fallacies:
        rec_list.append(f"Correct Logical Foul: Eliminate {fallacies[0]['fallacy']} by rephrasing offending section.")
    if struct["scores"]["evidence_strength"] < 60:
        rec_list.append("Strengthen Evidence: Cite verifiable statistics, research studies, or case studies.")
    if struct["scores"]["logical_consistency"] < 70:
        rec_list.append("Improve Coherence: Explicitly connect premises to claims using logical transitional linkers.")
    if not rec_list:
        rec_list.append("Exemplary reasoning structure and evidence grounding.")
        
    return CombinedSpeechEvaluationResponse(
        argument_analysis=ArgumentAnalysisResponse(
            extracted_claims=struct["extracted_claims"],
            evaluated_evidence=struct["evaluated_evidence"],
            reasoning_quality=struct["reasoning_quality"],
            argument_strength=struct["argument_strength"],
            scores=struct["scores"]
        ),
        fallacy_detection=FallacyDetectionResponse(
            fallacies_found=fallacy_items,
            has_fallacy=len(fallacies) > 0,
            credibility_score=credibility["credibility_score"],
            reasoning_analysis=credibility["reasoning_analysis"],
            summary=credibility["summary"]
        ),
        overall_reasoning_score=round((struct["argument_strength"] * 0.6) + (credibility["credibility_score"] * 0.4), 1),
        coach_recommendations=rec_list
    )

@router.get("/topics", response_model=List[DebateTopicResponse])
def get_topics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(DebateTopic).filter(
        (DebateTopic.is_predefined == True) | 
        (DebateTopic.created_by_id == current_user.id) |
        (DebateTopic.assigned_to_id == current_user.id)
    ).order_by(DebateTopic.created_at.desc()).all()

@router.post("/topics", response_model=DebateTopicResponse)
def create_topic(
    topic_in: DebateTopicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows creating custom debate topics for debate sessions."""
    topic = DebateTopic(
        title=topic_in.title,
        category=topic_in.category or "General",
        description=topic_in.description,
        target_format=topic_in.target_format or "One-on-One Debate",
        difficulty=topic_in.difficulty or "Intermediate",
        tags=topic_in.tags or [],
        is_predefined=topic_in.is_predefined if current_user.role in ["Debate Coach", "Educator", "Administrator"] else False,
        created_by_id=current_user.id,
        assigned_to_id=topic_in.assigned_to_id
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic
