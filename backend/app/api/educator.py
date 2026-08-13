"""
Educator API

Provides endpoints for educators to manage classes, enrollments, debate assignments,
and monitor student analytics and rankings.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_any_role
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_skill import UserSkill
from app.models.educator_class import EducatorClass, ClassEnrollment
from app.models.debate_assignment import DebateAssignment
from app.models.notification import Notification
from app.models.presentation_analysis import PresentationAnalysis

router = APIRouter(prefix="/educator", tags=["Educator Class Management"])



@router.get("/classes")
def get_educator_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Educator", "Administrator"]))
):
    """Retrieve all classes managed by the current educator (or all for Administrator)."""
    if current_user.role.name == "Administrator":
        classes = db.query(EducatorClass).all()
    else:
        classes = db.query(EducatorClass).filter(EducatorClass.educator_id == current_user.id).all()

    result = []
    for cls in classes:
        enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id == cls.id).all()
        student_ids = [e.learner_id for e in enrollments]
        if student_ids:
            skills = db.query(UserSkill).filter(UserSkill.user_id.in_(student_ids)).all()
            total_avg = sum((float(s.communication_score or 0) + float(s.confidence_score or 0) + float(s.critical_thinking_score or 0) + float(s.argument_score or 0)) / 4.0 for s in skills)
            cls_avg = round(total_avg / len(skills), 1) if skills else 0.0
        else:
            cls_avg = 0.0

        result.append({
            "id": cls.id,
            "name": cls.name,
            "description": cls.description,
            "enrolled_learners_count": len(enrollments),
            "average_score": cls_avg,
            "created_at": cls.created_at
        })
    return result


@router.get("/learners")
def get_enrolled_learners(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Educator", "Administrator"]))
):
    """Retrieve all learners enrolled in the educator's classes."""
    if current_user.role.name == "Administrator":
        learners = db.query(User).filter(User.role_id == 4).all()
    else:
        classes = db.query(EducatorClass).filter(EducatorClass.educator_id == current_user.id).all()
        class_ids = [c.id for c in classes]

        if not class_ids:
            return []

        enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id.in_(class_ids)).all()
        learner_ids = list({e.learner_id for e in enrollments})
        if not learner_ids:
            return []
        learners = db.query(User).filter(User.id.in_(learner_ids)).all()

    result = []
    for learner in learners:
        skill = db.query(UserSkill).filter(UserSkill.user_id == learner.id).first()
        profile = db.query(UserProfile).filter(UserProfile.user_id == learner.id).first()

        comm = float(skill.communication_score) if skill and skill.communication_score else 75.0
        conf = float(skill.confidence_score) if skill and skill.confidence_score else 75.0
        crit = float(skill.critical_thinking_score) if skill and skill.critical_thinking_score else 70.0
        arg = float(skill.argument_score) if skill and skill.argument_score else 74.0
        avg_score = round((comm + conf + crit + arg) / 4.0, 1)

        result.append({
            "id": learner.id,
            "full_name": learner.full_name,
            "name": learner.full_name,
            "email": learner.email,
            "institution": profile.institution if profile else "N/A",
            "score": avg_score,
            "progress": int(avg_score),
            "total_debates": skill.total_debates if skill else 0
        })
    return result


@router.post("/classes", status_code=status.HTTP_201_CREATED)
def create_educator_class(
    name: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Educator", "Administrator"]))
):
    """Create a new class or batch."""
    cls = EducatorClass(
        educator_id=current_user.id,
        name=name,
        description=description
    )
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls


@router.post("/assign-debate", status_code=status.HTTP_201_CREATED)
def assign_debate_topic(
    learner_id: int,
    topic_id: int,
    class_id: Optional[int] = None,
    due_at: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Educator", "Administrator"]))
):
    """Assign a debate topic to a learner or batch."""
    assignment = DebateAssignment(
        assigned_by=current_user.id,
        learner_id=learner_id,
        topic_id=topic_id,
        class_id=class_id,
        status="Assigned"
    )
    db.add(assignment)

    db.add(Notification(
        user_id=learner_id,
        title="Debate Assigned by Educator",
        message=f"Educator {current_user.full_name} assigned you a new debate topic.",
        notification_type="debate_assignment"
    ))

    db.commit()
    db.refresh(assignment)
    return assignment


from app.models.debate_session import DebateSession
from app.models.debate_evaluation import DebateEvaluation
from app.models.debate_topic import DebateTopic

@router.get("/class-analytics")
def get_class_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Educator", "Administrator"]))
):
    """Retrieve performance analytics across classes using real database student records."""
    learners = get_enrolled_learners(db=db, current_user=current_user)
    classes = get_educator_classes(db=db, current_user=current_user)
    learner_ids = [l["id"] for l in learners]

    sorted_learners = sorted(learners, key=lambda l: l["score"], reverse=True)

    top_students = [
        {"name": l["name"], "score": l["score"], "class": "Enrolled"}
        for l in sorted_learners[:3]
    ]

    students_requiring_attention = [
        {"name": l["name"], "score": l["score"], "weak_skill": "Rebuttal Strategy & Evidence"}
        for l in sorted_learners if l["score"] < 75
    ]

    batch_comp = [
        {"batch": c["name"], "average_score": c["average_score"]}
        for c in classes
    ]

    # 1. Real Class Radar from UserSkill model across enrolled learners
    class_radar = []
    if learner_ids:
        skills = db.query(UserSkill).filter(UserSkill.user_id.in_(learner_ids)).all()
        if skills:
            avg_comm = round(sum(float(s.communication_score or 75.0) for s in skills) / len(skills), 1)
            avg_conf = round(sum(float(s.confidence_score or 75.0) for s in skills) / len(skills), 1)
            avg_crit = round(sum(float(s.critical_thinking_score or 70.0) for s in skills) / len(skills), 1)
            avg_arg = round(sum(float(s.argument_score or 74.0) for s in skills) / len(skills), 1)
            avg_pres = round(sum(float(s.presentation_score or 72.0) for s in skills) / len(skills), 1)
            class_radar = [
                {"label": "Communication", "score": avg_comm},
                {"label": "Confidence", "score": avg_conf},
                {"label": "Reasoning", "score": avg_crit},
                {"label": "Argument", "score": avg_arg},
                {"label": "Presentation", "score": avg_pres},
            ]

    # 2. Real Topic Coverage from DebateTopic + DebateSession + DebateEvaluation
    topics = db.query(DebateTopic).filter(DebateTopic.is_active == True).slice(0, 8).all()
    topic_coverage = []
    if learner_ids and topics:
        for t in topics:
            sessions = db.query(DebateSession).filter(
                DebateSession.topic_id == t.id,
                DebateSession.user_id.in_(learner_ids)
            ).all()
            session_count = len(sessions)

            evals = db.query(DebateEvaluation).filter(
                DebateEvaluation.user_id.in_(learner_ids),
                DebateEvaluation.session_id.in_([s.id for s in sessions]) if sessions else False
            ).all()

            if evals:
                avg_score = round(sum(float(e.overall_performance_score or 0) for e in evals) / len(evals), 1)
            elif session_count > 0:
                avg_score = float(min(100, session_count * 25))
            else:
                avg_score = 0.0

            topic_coverage.append({
                "label": t.title[:22] + "..." if len(t.title) > 25 else t.title,
                "score": avg_score,
                "session_count": session_count
            })

    # 3. Real Session Trend from DebateEvaluation or PresentationAnalysis
    session_trend = []
    if learner_ids:
        evals = db.query(DebateEvaluation).filter(
            DebateEvaluation.user_id.in_(learner_ids)
        ).order_by(DebateEvaluation.created_at.asc()).slice(0, 8).all()

        if evals:
            for idx, e in enumerate(evals):
                date_str = e.created_at.strftime("%b %d") if e.created_at else f"S{idx + 1}"
                session_trend.append({
                    "label": date_str,
                    "score": float(e.overall_performance_score or 0.0)
                })
        else:
            presentations = db.query(PresentationAnalysis).filter(
                PresentationAnalysis.user_id.in_(learner_ids),
                PresentationAnalysis.is_deleted == False
            ).order_by(PresentationAnalysis.created_at.asc()).slice(0, 8).all()

            for idx, p in enumerate(presentations):
                date_str = p.created_at.strftime("%b %d") if p.created_at else f"S{idx + 1}"
                session_trend.append({
                    "label": date_str,
                    "score": float(p.overall_score or 0.0)
                })

    return {
        "top_students": top_students,
        "students_requiring_attention": students_requiring_attention,
        "batch_comparison": batch_comp,
        "topic_coverage": topic_coverage,
        "session_trend": session_trend,
        "class_radar": class_radar
    }


@router.get("/presentation-analytics")
def get_class_presentation_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(["Educator", "Administrator"]))
):
    """Retrieve presentation analytics for enrolled learners in educator's classes."""
    if current_user.role.name == "Administrator":
        student_ids = [u.id for u in db.query(User.id).all()]
        educator_class_ids = [c.id for c in db.query(EducatorClass.id).all()]
    else:
        educator_class_ids = [c.id for c in db.query(EducatorClass.id).filter(EducatorClass.educator_id == current_user.id).all()]
        if not educator_class_ids:
            return {"class_count": 0, "total_submissions": 0, "average_overall_score": 0.0, "average_pace_wpm": 0.0, "average_filler_count": 0, "submissions": []}
        
        enrollments = db.query(ClassEnrollment).filter(ClassEnrollment.class_id.in_(educator_class_ids)).all()
        student_ids = list(set(e.learner_id for e in enrollments))

    if not student_ids:
        return {"class_count": len(educator_class_ids), "total_submissions": 0, "average_overall_score": 0.0, "average_pace_wpm": 0.0, "average_filler_count": 0, "submissions": []}

    submissions = db.query(PresentationAnalysis).filter(
        PresentationAnalysis.user_id.in_(student_ids),
        PresentationAnalysis.is_deleted == False
    ).order_by(PresentationAnalysis.created_at.desc()).all()

    completed = [s for s in submissions if s.processing_status == "COMPLETED"]

    avg_overall = round(sum(float(s.overall_score or 0) for s in completed) / max(1, len(completed)), 2) if completed else 0.0
    avg_pace = round(sum(float(s.speech_pace_wpm or 0) for s in completed) / max(1, len(completed)), 2) if completed else 0.0
    avg_fillers = round(sum(s.filler_words_count or 0 for s in completed) / max(1, len(completed)), 1) if completed else 0.0

    sub_list = []
    for s in submissions:
        student = db.query(User).filter(User.id == s.user_id).first()
        sub_list.append({
            "id": s.id,
            "student_id": s.user_id,
            "student_name": student.full_name if student else "Student",
            "title": s.title,
            "overall_score": float(s.overall_score or 0.0),
            "speech_pace_wpm": float(s.speech_pace_wpm or 0.0),
            "filler_words_count": s.filler_words_count or 0,
            "processing_status": s.processing_status,
            "created_at": s.created_at
        })

    return {
        "class_count": len(educator_class_ids),
        "total_submissions": len(submissions),
        "average_overall_score": avg_overall,
        "average_pace_wpm": avg_pace,
        "average_filler_count": avg_fillers,
        "submissions": sub_list
    }

