"""LangGraph nodes. Agents never communicate through REST."""
from datetime import datetime, timezone
from time import perf_counter
from sqlalchemy.orm import Session
from app.ai.agents.argument_analysis_agent import ArgumentAnalysisAgent
from app.ai.agents.fallacy_detection_agent import FallacyDetectionAgent
from app.ai.agents.counterargument_agent import CounterargumentAgent
from app.ai.agents.ai_debate_opponent_agent import AIDebateOpponentAgent
from app.ai.agents.judge_agent import JudgeAgent
from app.ai.agents.coaching_agent import CoachingAgent
from app.ai.agents.recommendation_agent import RecommendationAgent
from app.ai.agents.learning_path_agent import LearningPathAgent
from app.ai.memory.conversation_memory import conversation_memory
from app.ai.rag.retriever import evidence_retriever
from app.ai.scoring.scoring_engine import PerformanceScoringEngine
from app.ai.llm.llm import llm
from app.db.database import SessionLocal
from app.models.debate_session import DebateSession
from app.models.user_skill import UserSkill
from app.mongodb.debate_repository import debate_repository

argument_agent, fallacy_agent = ArgumentAnalysisAgent(), FallacyDetectionAgent()
counter_agent, opponent_agent, judge_agent = CounterargumentAgent(), AIDebateOpponentAgent(), JudgeAgent()
coaching_agent, recommendation_agent, learning_path_agent = CoachingAgent(), RecommendationAgent(), LearningPathAgent()

def _dump(value): return value.model_dump() if hasattr(value, "model_dump") else value

def load_context(state):
    context = {"profile": {}, "topic": {}, "previous_skill_snapshot": {}}
    db: Session = SessionLocal()
    try:
        debate = db.query(DebateSession).filter(DebateSession.id == state["session_id"]).first()
        if debate:
            state_user_id = debate.user_id
            context["user_id"] = state_user_id
            context["topic"] = {"id": debate.topic_id, "format": debate.debate_format}
            if debate.user and debate.user.profile:
                context["profile"] = {"experience_level": debate.user.profile.experience_level, "learning_goals": debate.user.profile.learning_goals, "coaching_preferences": debate.user.profile.coaching_preferences}
            if debate.user and debate.user.skills:
                skills = debate.user.skills
                context["previous_skill_snapshot"] = {"communication": float(skills.communication_score or 0), "critical_thinking": float(skills.critical_thinking_score or 0), "argument": float(skills.argument_score or 0)}
    except Exception as exc:
        return {"context": context, "errors": state.get("errors", []) + [f"context: {exc}"]}
    finally: db.close()
    return {"context": context, "user_id": state.get("user_id") or context.get("user_id")}

def load_memory(state):
    try:
        return {"memory": conversation_memory.load(state["session_id"])}
    except Exception as exc:
        # A temporary memory-store outage must not discard a completed debate.
        return {
            "memory": {"recent_turns": [], "summary": "", "previous_scores": []},
            "errors": state.get("errors", []) + [f"memory: {exc}"],
        }
def argument_analysis(state): return {"argument_analysis": _dump(argument_agent.analyze_argument(state["argument"]))}
def fallacy_detection(state): return {"logical_fallacy_analysis": _dump(fallacy_agent.detect_fallacies(state["argument"]))}
def counterargument_generation(state):
    evidence = evidence_retriever.retrieve(state["argument"])
    result = counter_agent.generate(argument=state["argument"], evidence=[_dump(item) for item in evidence], debate_format=state["debate_format"], difficulty=state["difficulty"])
    return {"evidence": [_dump(item) for item in evidence], "counterargument": _dump(result)}
def ai_debate_opponent(state):
    result = opponent_agent.respond(argument=state["argument"], counterargument=state["counterargument"], debate_format=state["debate_format"], difficulty=state["difficulty"], user_position=state["user_position"], memory=state["memory"])
    return {"ai_debate_opponent": _dump(result)}
def performance_scoring(state):
    categories = judge_agent.evaluate(argument_analysis=state["argument_analysis"], fallacies=state["logical_fallacy_analysis"], counterargument=state["counterargument"], opponent=state["ai_debate_opponent"])
    return {"judge_categories": _dump(categories), "performance": _dump(PerformanceScoringEngine.calculate(categories))}
def coaching(state):
    result = coaching_agent.coach(argument=state["argument"], score=state["performance"], rationale=state["judge_categories"].get("rationale", []))
    return {"coaching": _dump(result)}
def recommendations(state):
    result = recommendation_agent.recommend(score=state["performance"], weaknesses=state["coaching"].get("weaknesses", []), profile=state["context"].get("profile", {}))
    return {"recommendations": _dump(result)}
def learning_path(state):
    result = learning_path_agent.create(profile=state["context"].get("profile", {}), previous_scores=state["memory"].get("previous_scores", []), recommendations=state["recommendations"])
    return {"learning_path": _dump(result)}
def progress_update(state):
    db = SessionLocal()
    try:
        user_id = state.get("user_id")
        if user_id:
            skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).first()
            categories = state["performance"]["categories"]
            arg_s = round(categories["argument_quality"], 2)
            crit_s = round((categories["logical_consistency"] + categories["rebuttal_effectiveness"]) / 2, 2)
            comm_s = round(categories["communication_skills"], 2)

            if skills:
                skills.argument_score = arg_s
                skills.critical_thinking_score = crit_s
                skills.communication_score = comm_s
                skills.total_debates = (skills.total_debates or 0) + 1
            else:
                skills = UserSkill(
                    user_id=user_id,
                    argument_score=arg_s,
                    critical_thinking_score=crit_s,
                    communication_score=comm_s,
                    presentation_score=0.0,
                    confidence_score=70.0,
                    total_debates=1,
                    total_presentations=0
                )
                db.add(skills)

            db.commit()
        return {"progress_updated": True}
    except Exception as exc:
        db.rollback(); return {"progress_updated": False, "errors": state.get("errors", []) + [f"progress_update: {exc}"]}
    finally: db.close()
def persist_results(state):
    started = state["observability"].get("started_at")
    now = datetime.now(timezone.utc)
    execution_time = int((perf_counter() - state["observability"]["timer"]) * 1000)
    metadata = {"model_used": getattr(llm, "model_name", None) or getattr(llm, "model", "configured-provider"), "latency_ms": execution_time, "execution_time_ms": execution_time, "token_usage": {}, "errors": state.get("errors", []), "started_at": started, "completed_at": now.isoformat()}
    result = {key: value for key, value in state.items() if key not in {"observability", "errors"}}
    result["observability"] = metadata
    try:
        debate_repository.save_workflow_result(state["session_id"], state.get("user_id"), result)
        conversation_memory.save(state["session_id"], {"role": "user", "content": state["argument"], "round": state.get("current_round", 1)}, f"Latest claim: {state['argument'][:500]}", state["performance"]["overall_score"])
        debate_repository.save_observability({"session_id": state["session_id"], "user_id": state.get("user_id"), **metadata})
    except Exception as exc:
        metadata["errors"].append(f"persistence: {exc}")
    return {"observability": metadata}
