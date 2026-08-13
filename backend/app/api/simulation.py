"""
AI Debate Simulation API

Exposes endpoints for interactive AI debate simulations against an AI opponent.
Persists sessions in PostgreSQL and executes backend AI agents & deterministic scoring.
"""

from datetime import datetime, timezone
import uuid
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.debate_topic import DebateTopic
from app.models.debate_session import DebateSession
from app.models.session_participant import SessionParticipant
from app.models.session_round import SessionRound
from app.models.debate_evaluation import DebateEvaluation
from app.models.user_skill import UserSkill

from app.schemas.simulation_schema import (
    SimulationStartRequest,
    SimulationTurnRequest,
    SimulationResponse
)

from app.ai.orchestrator.debate_graph import debate_orchestrator

router = APIRouter(prefix="/debate", tags=["AI Debate Simulation"])


@router.post("/simulate/start")
def start_simulation(
    req: SimulationStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initialize an AI Debate Simulation session backed by PostgreSQL."""
    topic_id = req.topic_id
    if not topic_id:
        topic = db.query(DebateTopic).filter(DebateTopic.is_active == True).first()
        if not topic:
            topic = DebateTopic(
                title=req.topic_title or "Global Climate Policy Action",
                description="Debate on implementing aggressive global climate target policies.",
                category="Environment",
                difficulty_level=req.difficulty,
                debate_format=req.format,
                topic_type="OFFICIAL",
                visibility="PUBLIC"
            )
            db.add(topic)
            db.commit()
            db.refresh(topic)
        topic_id = topic.id
    else:
        topic = db.query(DebateTopic).filter(DebateTopic.id == topic_id).first()

    session = DebateSession(
        user_id=current_user.id,
        topic_id=topic_id,
        debate_format=req.format or (topic.debate_format if topic else "Oxford Debate"),
        debate_position=req.side or "Affirmative",
        scheduled_at=datetime.now(timezone.utc),
        started_at=datetime.now(timezone.utc),
        session_status="In Progress",
        created_by=current_user.id
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Participants
    p_user = SessionParticipant(
        session_id=session.id,
        user_id=current_user.id,
        role_in_session="Learner",
        position=session.debate_position
    )
    opp_position = "Negative" if session.debate_position in ["Affirmative", "Pro"] else "Affirmative"
    p_ai = SessionParticipant(
        session_id=session.id,
        user_id=current_user.id,
        role_in_session="AI Opponent",
        position=opp_position
    )
    db.add(p_user)
    db.add(p_ai)

    # Round 1
    s_round = SessionRound(
        session_id=session.id,
        round_number=1,
        round_name="Round 1 - Opening Constructive",
        duration_minutes=5,
        status="In Progress",
        started_at=datetime.now(timezone.utc)
    )
    db.add(s_round)
    db.commit()

    topic_title = topic.title if topic else (req.topic_title or "AI Debate Practice")
    opening_prompt = (
        f"Welcome to the {session.debate_format} simulation on '{topic_title}'. "
        f"You are arguing {session.debate_position} at {req.difficulty} difficulty level. "
        f"Deliver your opening statement when ready."
    )

    return {
        "session_id": str(session.id),
        "topic_id": topic_id,
        "topic_title": topic_title,
        "format": session.debate_format,
        "difficulty": req.difficulty,
        "side": session.debate_position,
        "opening_prompt": opening_prompt
    }


@router.post("/simulate/turn", response_model=SimulationResponse)
def execute_simulation_turn(
    req: SimulationTurnRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute a turn in the AI Debate Simulation using LangGraph orchestrator."""
    try:
        session_int_id = int(req.session_id.replace("sim-", ""))
    except ValueError:
        session_int_id = 1

    session = db.query(DebateSession).filter(DebateSession.id == session_int_id).first()
    debate_format = session.debate_format if session else "Oxford Debate"
    user_position = session.debate_position if session else "Affirmative"

    # Invoke full LangGraph workflow
    workflow_res = debate_orchestrator.invoke(
        session_id=session_int_id,
        argument=req.user_speech,
        user_id=current_user.id,
        debate_format=debate_format,
        difficulty=req.difficulty,
        user_position=user_position,
        current_round=req.round_number
    )

    opp_data = workflow_res.get("ai_debate_opponent", {})
    ai_reply = opp_data.get("opponent_response") if isinstance(opp_data, dict) else None

    counter_res = workflow_res.get("counterargument", {})
    if not ai_reply:
        rebuttal_text = counter_res.get("logical_rebuttal", "Policy feasibility and empirical evidence challenge your central premise.") if isinstance(counter_res, dict) else "Empirical evidence challenges your claim."
        ai_reply = (
            f"Regarding your Round {req.round_number} argument: '{req.user_speech[:150]}...'\n\n"
            f"Direct Counterargument: {rebuttal_text}"
        )

    if isinstance(counter_res, dict):
        challenge_qs = counter_res.get("challenge_questions", [])
        if challenge_qs and "question" not in ai_reply.lower():
            ai_reply = f"{ai_reply}\n\nRebuttal Question: {challenge_qs[0]}"

    performance = workflow_res.get("performance", {})
    categories = performance.get("categories", {})
    overall_score = float(performance.get("overall_score", 82.0))

    arg_quality = float(categories.get("argument_quality", 80.0))
    rebuttal_score = float(categories.get("rebuttal_effectiveness", 80.0))
    logic_score = float(categories.get("logical_consistency", 80.0))
    comm_score = float(categories.get("communication_skills", 80.0))
    ev_score = float(categories.get("evidence_usage", 80.0))

    # Persist turn evaluation in PostgreSQL
    evaluation = DebateEvaluation(
        session_id=session.id if session else 1,
        user_id=current_user.id,
        turn_number=req.round_number,
        argument_quality_score=arg_quality,
        evidence_usage_score=ev_score,
        logical_consistency_score=logic_score,
        rebuttal_effectiveness_score=rebuttal_score,
        communication_skills_score=comm_score,
        overall_performance_score=overall_score,
        feedback_summary=opp_data.get("next_turn_guidance", "Consolidate claim with empirical evidence.")
    )
    db.add(evaluation)

    # Update session status if completed
    is_completed = (req.round_number >= 3)
    if is_completed and session:
        session.session_status = "Completed"
        session.ended_at = datetime.now(timezone.utc)
        
        # Update user skills
        user_skill = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).first()
        if user_skill:
            user_skill.argument_score = round(arg_quality, 2)
            user_skill.critical_thinking_score = round((logic_score + rebuttal_score) / 2.0, 2)
            user_skill.communication_score = round(comm_score, 2)
            user_skill.total_debates = (user_skill.total_debates or 0) + 1

    db.commit()

    return SimulationResponse(
        session_id=req.session_id,
        ai_opponent_argument=ai_reply,
        judge_feedback={
            "verdict": user_position,
            "feedback": f"Evaluated Round {req.round_number}. Overall weighted performance: {overall_score}%.",
            "argument_score": arg_quality,
            "rebuttal_score": rebuttal_score,
            "logical_consistency": logic_score,
            "communication_skills": comm_score,
        },
        live_scores={
            "argument_quality": arg_quality,
            "rebuttal_effectiveness": rebuttal_score,
            "logical_consistency": logic_score,
            "overall_score": overall_score
        },
        is_completed=is_completed
    )
