from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_any_role
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_skill import UserSkill
from app.models.coach_assignment import CoachAssignment
from app.models.coach_evaluation import CoachEvaluation
from app.models.practice_assignment import LearnerPracticeAssignment
from app.models.coaching_session import CoachingSession
from app.models.notification import Notification
from app.models.debate_session import DebateSession
from app.models.debate_topic import DebateTopic
from app.models.debate_evaluation import DebateEvaluation
from app.models.argument_analysis import ArgumentAnalysis, LogicalFallacyDetected
from app.models.counterargument import CounterargumentGenerated
from app.models.session_round import SessionRound
from app.models.presentation_analysis import PresentationAnalysis

from app.schemas.coach_schema import (
    CoachEvaluationCreate,
    CoachEvaluationResponse,
    PracticeAssignmentCreate,
    PracticeAssignmentResponse,
    CoachingSessionCreate,
    CoachingSessionResponse,
)

router = APIRouter(prefix="/coach", tags=["Coach Mentorship"])


@router.get("/learners")
def get_assigned_learners(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Debate Coach", "Administrator"]))
):

    """Retrieve all learners assigned to the current coach with practice task status."""
    assignments = db.query(CoachAssignment).filter(
        CoachAssignment.coach_id == current_user.id,
        CoachAssignment.status == "Active"
    ).all()

    learner_ids = [a.learner_id for a in assignments]
    if not learner_ids:
        return []
    
    learners = db.query(User).filter(User.id.in_(learner_ids)).all()

    result = []
    for learner in learners:
        profile = db.query(UserProfile).filter(UserProfile.user_id == learner.id).first()
        skill = db.query(UserSkill).filter(UserSkill.user_id == learner.id).first()
        tasks = db.query(LearnerPracticeAssignment).filter(
            LearnerPracticeAssignment.learner_id == learner.id,
            LearnerPracticeAssignment.coach_id == current_user.id
        ).order_by(LearnerPracticeAssignment.created_at.desc()).all()

        comm = float(skill.communication_score) if skill and skill.communication_score else 75.0
        conf = float(skill.confidence_score) if skill and skill.confidence_score else 75.0
        crit = float(skill.critical_thinking_score) if skill and skill.critical_thinking_score else 70.0
        arg = float(skill.argument_score) if skill and skill.argument_score else 74.0
        avg_score = round((comm + conf + crit + arg) / 4.0, 1)

        task_list = []
        for t in tasks:
            top = db.query(DebateTopic).filter(DebateTopic.id == t.topic_id).first() if t.topic_id else None
            task_list.append({
                "id": t.id,
                "topic_id": t.topic_id,
                "topic_title": top.title if top else t.title,
                "title": t.title,
                "description": t.description,
                "debate_format": t.debate_format or (top.debate_format if top else "Oxford Debate"),
                "difficulty": t.difficulty,
                "status": t.status,
                "session_id": t.session_id,
                "due_date": t.due_date,
                "coach_name": current_user.full_name
            })

        result.append({
            "id": learner.id,
            "full_name": learner.full_name,
            "email": learner.email,
            "institution": profile.institution if profile else "N/A",
            "experience_level": profile.experience_level if profile else "Beginner",
            "average_score": avg_score,
            "progress": int(avg_score),
            "practice_tasks": task_list,
            "weak_skills": [s for s, val in [("Logic", crit), ("Argumentation", arg), ("Communication", comm)] if val < 75],
            "strong_skills": [s for s, val in [("Logic", crit), ("Argumentation", arg), ("Communication", comm)] if val >= 75]
        })
    return result

@router.get("/my-coach")
def get_my_assigned_coach(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve assigned coach information for the current learner."""
    assignment = db.query(CoachAssignment).filter(
        CoachAssignment.learner_id == current_user.id,
        CoachAssignment.status == "Active"
    ).first()

    if not assignment:
        coach_user = db.query(User).filter(User.role_id == 2).first()
        if not coach_user:
            return {
                "assigned": False,
                "coach": None,
                "evaluations": [],
                "practice_tasks": []
            }
    else:
        coach_user = db.query(User).filter(User.id == assignment.coach_id).first()

    coach_profile = db.query(UserProfile).filter(UserProfile.user_id == coach_user.id).first() if coach_user else None
    evaluations = db.query(CoachEvaluation).filter(CoachEvaluation.learner_id == current_user.id).order_by(CoachEvaluation.created_at.desc()).all()
    tasks = db.query(LearnerPracticeAssignment).filter(LearnerPracticeAssignment.learner_id == current_user.id).order_by(LearnerPracticeAssignment.created_at.desc()).all()
    sessions = db.query(CoachingSession).filter(CoachingSession.learner_id == current_user.id).order_by(CoachingSession.scheduled_at.asc()).all()

    formatted_tasks = []
    for pt in tasks:
        if not pt.session_id and pt.topic_id:
            existing_session = db.query(DebateSession).filter(
                DebateSession.user_id == current_user.id,
                DebateSession.topic_id == pt.topic_id,
                DebateSession.created_at >= pt.created_at
            ).order_by(DebateSession.created_at.desc()).first()
            if existing_session:
                pt.session_id = existing_session.id
                if pt.status == "Assigned":
                    pt.status = "In Progress"
                db.commit()

        top = db.query(DebateTopic).filter(DebateTopic.id == pt.topic_id).first() if pt.topic_id else None
        formatted_tasks.append({
            "id": pt.id,
            "topic_id": pt.topic_id,
            "topic_title": top.title if top else pt.title,
            "session_id": pt.session_id,
            "title": pt.title,
            "description": pt.description,
            "debate_format": pt.debate_format or (top.debate_format if top else "Oxford Debate"),
            "difficulty": pt.difficulty,
            "coach_name": coach_user.full_name if coach_user else "Debate Coach",
            "due_date": pt.due_date,
            "status": pt.status
        })

    return {
        "assigned": True,
        "coach": {
            "id": coach_user.id if coach_user else 0,
            "full_name": coach_user.full_name if coach_user else "Senior Debate Coach",
            "email": coach_user.email if coach_user else "coach@debate.ai",
            "institution": coach_profile.institution if coach_profile else "Global Debate Academy",
            "bio": coach_profile.bio if coach_profile else "Expert debate coach specializing in Oxford & Parliamentary debate strategy."
        },
        "evaluations": [
            {
                "id": ev.id,
                "session_id": ev.session_id,
                "overall_score": float(ev.overall_score or 0),
                "communication_score": float(ev.communication_score or 0),
                "logic_score": float(ev.logic_score or 0),
                "rebuttal_score": float(ev.rebuttal_score or 0),
                "evidence_score": float(ev.evidence_score or 0),
                "comments": ev.comments,
                "recommendations": ev.recommendations,
                "created_at": ev.created_at
            } for ev in evaluations
        ],
        "practice_tasks": formatted_tasks,
        "sessions": [
            {
                "id": cs.id,
                "topic_title": cs.topic_title,
                "scheduled_at": cs.scheduled_at,
                "status": cs.status,
                "notes": cs.notes
            } for cs in sessions
        ]
    }

@router.get("/submission/{session_id}")
def get_learner_submission_for_coach(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Debate Coach", "Administrator"]))
):
    """Retrieve complete learner debate submission & AI analysis report for coach review."""
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Debate session submission not found.")

    learner = db.query(User).filter(User.id == session.user_id).first()
    topic = db.query(DebateTopic).filter(DebateTopic.id == session.topic_id).first()

    # Get submitted turns (rounds/analyses)
    rounds = db.query(SessionRound).filter(SessionRound.session_id == session_id).all()
    analyses = db.query(ArgumentAnalysis).filter(ArgumentAnalysis.session_id == session_id).all()

    submitted_turns = []
    if analyses:
        for idx, a in enumerate(analyses, start=1):
            submitted_turns.append({
                "turn_number": idx,
                "speaker": learner.full_name if learner else f"Learner #{session.user_id}",
                "speech_text": a.extracted_argument or a.claim_text or ""
            })
    elif rounds:
        for r in rounds:
            submitted_turns.append({
                "turn_number": r.round_number,
                "speaker": learner.full_name if learner else f"Learner #{session.user_id}",
                "speech_text": r.round_name or f"Round {r.round_number}"
            })
    else:
        submitted_turns.append({
            "turn_number": 1,
            "speaker": learner.full_name if learner else f"Learner #{session.user_id}",
            "speech_text": f"Submitted debate session for topic '{topic.title if topic else session_id}'."
        })

    # Scores
    evals = db.query(DebateEvaluation).filter(DebateEvaluation.session_id == session_id).order_by(DebateEvaluation.created_at.desc()).all()
    latest_eval = evals[0] if evals else None

    # Fallacies & counterarguments
    fallacies = db.query(LogicalFallacyDetected).filter(LogicalFallacyDetected.session_id == session_id).all()
    counterargs = db.query(CounterargumentGenerated).filter(CounterargumentGenerated.session_id == session_id).all()

    # Check for existing coach evaluation
    coach_eval = db.query(CoachEvaluation).filter(
        CoachEvaluation.session_id == session_id,
        CoachEvaluation.coach_id == current_user.id
    ).order_by(CoachEvaluation.created_at.desc()).first()

    arg_q = float(latest_eval.argument_quality_score) if latest_eval and latest_eval.argument_quality_score else 80.0
    ev_u = float(latest_eval.evidence_usage_score) if latest_eval and latest_eval.evidence_usage_score else 78.0
    log_c = float(latest_eval.logical_consistency_score) if latest_eval and latest_eval.logical_consistency_score else 82.0
    reb_e = float(latest_eval.rebuttal_effectiveness_score) if latest_eval and latest_eval.rebuttal_effectiveness_score else 76.0
    comm_s = float(latest_eval.communication_skills_score) if latest_eval and latest_eval.communication_skills_score else 80.0
    ov_s = float(latest_eval.overall_performance_score) if latest_eval and latest_eval.overall_performance_score else round((arg_q + ev_u + log_c + reb_e + comm_s) / 5.0, 1)

    return {
        "learner_id": session.user_id,
        "learner_name": learner.full_name if learner else f"Learner #{session.user_id}",
        "session_id": session.id,
        "topic_title": topic.title if topic else f"Debate #{session.id}",
        "topic_description": topic.description if topic else "",
        "debate_format": session.debate_format or "Oxford Debate",
        "position": session.debate_position or "Affirmative",
        "session_status": session.session_status or "Completed",
        "submitted_turns": submitted_turns,
        "overall_score": ov_s,
        "argument_quality": arg_q,
        "evidence_usage": ev_u,
        "logical_consistency": log_c,
        "rebuttal_effectiveness": reb_e,
        "communication_score": comm_s,
        "detected_fallacies": [
            {
                "type": f.fallacy_type,
                "text": f.detected_text,
                "explanation": f.explanation,
                "severity": f.severity_level
            } for f in fallacies
        ],
        "counterarguments": [
            {
                "claim": c.original_claim,
                "rebuttal": c.rebuttal_text,
                "question": c.challenge_question
            } for c in counterargs
        ],
        "recommendations": [
            "Strengthen evidence integration for empirical claims.",
            "Address opponent counter-points earlier in rebuttal phase."
        ],
        "has_evaluation": coach_eval is not None,
        "existing_evaluation": {
            "id": coach_eval.id,
            "overall_score": float(coach_eval.overall_score or 0),
            "communication_score": float(coach_eval.communication_score or 0),
            "logic_score": float(coach_eval.logic_score or 0),
            "rebuttal_score": float(coach_eval.rebuttal_score or 0),
            "evidence_score": float(coach_eval.evidence_score or 0),
            "comments": coach_eval.comments,
            "recommendations": coach_eval.recommendations,
            "created_at": coach_eval.created_at
        } if coach_eval else None
    }

@router.post("/evaluations", response_model=CoachEvaluationResponse, status_code=status.HTTP_201_CREATED)
def submit_coach_evaluation(
    eval_data: CoachEvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Debate Coach", "Administrator"]))
):
    """Submit a manual evaluation for an assigned learner's actual submitted debate session."""
    if not eval_data.session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coach evaluation requires an actual submitted debate session (session_id)."
        )

    session = db.query(DebateSession).filter(DebateSession.id == eval_data.session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Debate session #{eval_data.session_id} not found."
        )

    if session.user_id != eval_data.learner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debate session user does not match the learner being evaluated."
        )

    session_status = str(session.session_status or session.status or "").lower()
    if session_status not in ["completed", "submitted", "evaluated", "ai_analyzed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot evaluate an unsubmitted debate session. Learner must submit the debate first."
        )

    evaluation = CoachEvaluation(
        coach_id=current_user.id,
        learner_id=eval_data.learner_id,
        session_id=eval_data.session_id,
        communication_score=eval_data.communication_score,
        confidence_score=eval_data.confidence_score,
        logic_score=eval_data.logic_score,
        rebuttal_score=eval_data.rebuttal_score,
        evidence_score=eval_data.evidence_score,
        overall_score=eval_data.overall_score or ((eval_data.communication_score + eval_data.logic_score + eval_data.rebuttal_score + eval_data.evidence_score) / 4.0),
        comments=eval_data.comments,
        recommendations=eval_data.recommendations
    )
    db.add(evaluation)

    # Update associated practice task status to Evaluated / Completed if linked
    task = db.query(LearnerPracticeAssignment).filter(
        LearnerPracticeAssignment.session_id == eval_data.session_id
    ).first()
    if not task:
        task = db.query(LearnerPracticeAssignment).filter(
            LearnerPracticeAssignment.learner_id == eval_data.learner_id,
            LearnerPracticeAssignment.coach_id == current_user.id,
            LearnerPracticeAssignment.status.in_(["Submitted", "In Progress", "AI_Analyzed"])
        ).order_by(LearnerPracticeAssignment.updated_at.desc()).first()

    if task:
        task.status = "Evaluated"

    # Notify Learner
    notification = Notification(
        user_id=eval_data.learner_id,
        title="New Coach Evaluation Received",
        message=f"Coach {current_user.full_name} evaluated your debate session #{session.id}. Score: {evaluation.overall_score}%",
        notification_type="coach_evaluation"
    )
    db.add(notification)
    db.commit()
    db.refresh(evaluation)
    return evaluation

@router.post("/practice", response_model=PracticeAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_practice_task(
    task_data: PracticeAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Debate Coach", "Administrator"]))
):
    """Assign practice debate exercise to a learner."""
    topic = db.query(DebateTopic).filter(DebateTopic.id == task_data.topic_id).first() if task_data.topic_id else None
    topic_title = topic.title if topic else "Debate Practice"
    auto_title = task_data.title or f"{topic_title} Practice"
    format_val = task_data.debate_format or (topic.debate_format if topic else "Oxford Debate")
    diff_val = task_data.difficulty or (topic.difficulty_level if topic else "Intermediate")

    task = LearnerPracticeAssignment(
        coach_id=current_user.id,
        learner_id=task_data.learner_id,
        topic_id=task_data.topic_id,
        title=auto_title,
        description=task_data.description,
        debate_format=format_val,
        difficulty=diff_val,
        due_date=task_data.due_date,
        status="Assigned"
    )
    db.add(task)

    notification = Notification(
        user_id=task_data.learner_id,
        title="New Debate Practice Assigned",
        message=f"Coach {current_user.full_name} assigned you a practice debate on '{topic_title}' ({format_val})",
        notification_type="practice_assignment"
    )
    db.add(notification)
    db.commit()
    db.refresh(task)
    return task

@router.put("/practice/{task_id}/status")
def update_practice_task_status(
    task_id: int,
    task_status: str,
    session_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update status of a practice assignment (Assigned -> In Progress -> Submitted -> Evaluated -> Completed)."""
    task = db.query(LearnerPracticeAssignment).filter(
        LearnerPracticeAssignment.id == task_id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Practice assignment not found")

    task.status = task_status
    if session_id:
        task.session_id = session_id

    if task_status in ["Submitted", "Completed"] and task.coach_id:
        db.add(Notification(
            user_id=task.coach_id,
            title="Practice Task Submission Ready",
            message=f"Learner {current_user.full_name} submitted practice debate for task: '{task.title}'",
            notification_type="practice_completion"
        ))

    db.commit()
    return {"message": "Practice assignment status updated", "task_id": task_id, "status": task.status, "session_id": task.session_id}


@router.post("/sessions", response_model=CoachingSessionResponse, status_code=status.HTTP_201_CREATED)
def schedule_coaching_session(
    session_data: CoachingSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule a mentoring or mock debate session."""
    cs = CoachingSession(
        coach_id=current_user.id,
        learner_id=session_data.learner_id,
        topic_title=session_data.topic_title,
        scheduled_at=session_data.scheduled_at,
        notes=session_data.notes,
        status="Scheduled"
    )
    db.add(cs)

    notification = Notification(
        user_id=session_data.learner_id,
        title="Coaching Session Scheduled",
        message=f"Coach {current_user.full_name} scheduled a coaching session on '{session_data.topic_title}'",
        notification_type="coaching_session"
    )
    db.add(notification)
    db.commit()
    db.refresh(cs)
    return cs

@router.get("/analytics")
def get_coach_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve coaching performance analytics for coach dashboard."""
    assigned_count = db.query(CoachAssignment).filter(CoachAssignment.coach_id == current_user.id).count()
    evals_count = db.query(CoachEvaluation).filter(CoachEvaluation.coach_id == current_user.id).count()
    sessions_count = db.query(CoachingSession).filter(CoachingSession.coach_id == current_user.id).count()

    avg_learner_score = db.query(func.avg(CoachEvaluation.overall_score)).filter(CoachEvaluation.coach_id == current_user.id).scalar()
    avg_score = round(float(avg_learner_score), 1) if avg_learner_score else 0.0

    total_tasks = db.query(LearnerPracticeAssignment).filter(LearnerPracticeAssignment.coach_id == current_user.id).count()
    completed_tasks = db.query(LearnerPracticeAssignment).filter(
        LearnerPracticeAssignment.coach_id == current_user.id,
        LearnerPracticeAssignment.status.in_(["Evaluated", "Completed"])
    ).count()
    completion_rate = f"{round((completed_tasks / total_tasks) * 100, 1)}%" if total_tasks > 0 else "0%"

    return {
        "total_assigned_learners": assigned_count,
        "completed_evaluations": evals_count,
        "scheduled_sessions": sessions_count,
        "average_learner_score": avg_score,
        "coaching_effectiveness_rating": f"{avg_score}%" if avg_score > 0 else "N/A",
        "feedback_completion_rate": completion_rate
    }


class SendMessageRequest(BaseModel):
    learner_id: int
    content: str

class ReplyMessageRequest(BaseModel):
    receiver_id: int
    content: str


@router.post("/messages")
def send_coach_message(
    body: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Debate Coach", "Administrator"]))
):
    """Send a direct message from Coach to an assigned learner."""
    if current_user.role.name != "Administrator":
        assignment = db.query(CoachAssignment).filter(
            CoachAssignment.coach_id == current_user.id,
            CoachAssignment.learner_id == body.learner_id
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to coach this learner."
            )

    msg_doc = {
        "coach_id": current_user.id,
        "learner_id": body.learner_id,
        "sender_id": current_user.id,
        "sender_name": current_user.full_name,
        "sender_role": current_user.role.name,
        "content": body.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    mongodb.database["coach_messages"].insert_one(msg_doc)

    db.add(Notification(
        user_id=body.learner_id,
        title=f"Message from Coach {current_user.full_name}",
        message=body.content[:100],
        notification_type="coach_message"
    ))
    db.commit()

    return {"message": "Message sent successfully.", "data": {k: v for k, v in msg_doc.items() if k != "_id"}}


@router.get("/messages/{learner_id}")
def get_message_history(
    learner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve message history between a coach and a learner."""
    if current_user.role.name in ["Debate Coach", "Administrator"]:
        if current_user.role.name == "Debate Coach":
            assignment = db.query(CoachAssignment).filter(
                CoachAssignment.coach_id == current_user.id,
                CoachAssignment.learner_id == learner_id
            ).first()
            if not assignment:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not authorized to view messages for this learner."
                )
        coach_id = current_user.id
    elif current_user.role.name == "Learner":
        if current_user.id != learner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own messages."
            )
        coach_id = None
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    query = {"learner_id": learner_id}
    if coach_id:
        query["coach_id"] = coach_id

    messages = list(mongodb.database["coach_messages"].find(query, {"_id": 0}).sort("created_at", 1))
    return messages


@router.post("/messages/reply")
def reply_coach_message(
    body: ReplyMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a reply message in an existing coach-learner conversation."""
    if current_user.role.name == "Learner":
        learner_id = current_user.id
        coach_id = body.receiver_id
    else:
        coach_id = current_user.id
        learner_id = body.receiver_id

    msg_doc = {
        "coach_id": coach_id,
        "learner_id": learner_id,
        "sender_id": current_user.id,
        "sender_name": current_user.full_name,
        "sender_role": current_user.role.name,
        "content": body.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    mongodb.database["coach_messages"].insert_one(msg_doc)

    db.add(Notification(
        user_id=body.receiver_id,
        title=f"New Message from {current_user.full_name}",
        message=body.content[:100],
        notification_type="coach_message"
    ))
    db.commit()

    return {"message": "Reply sent successfully.", "data": {k: v for k, v in msg_doc.items() if k != "_id"}}


@router.get("/presentation-submissions")
def get_coach_learner_presentation_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Debate Coach", "Administrator"]))
):
    """Retrieve presentation submissions for learners assigned to this coach."""
    assignments = db.query(CoachAssignment).filter(
        CoachAssignment.coach_id == current_user.id,
        CoachAssignment.status == "Active"
    ).all()

    learner_ids = [a.learner_id for a in assignments]
    if not learner_ids:
        return []

    submissions = db.query(PresentationAnalysis).filter(
        PresentationAnalysis.user_id.in_(learner_ids),
        PresentationAnalysis.is_deleted == False
    ).order_by(PresentationAnalysis.created_at.desc()).all()

    result = []
    for s in submissions:
        learner = db.query(User).filter(User.id == s.user_id).first()
        result.append({
            "id": s.id,
            "learner_id": s.user_id,
            "learner_name": learner.full_name if learner else "Learner",
            "title": s.title,
            "overall_score": float(s.overall_score or 0.0),
            "speech_pace_wpm": float(s.speech_pace_wpm or 0.0),
            "filler_words_count": s.filler_words_count or 0,
            "confidence_score": float(s.confidence_score or 0.0),
            "clarity_score": float(s.clarity_score or 0.0),
            "processing_status": s.processing_status,
            "created_at": s.created_at
        })
    return result


