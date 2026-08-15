"""
Global AI Debate Coach — Conversation Orchestrator + 8 specialized agents.

This is the platform-wide assistant (floating chatbot, every page, every
role) described in the Requirement PDF's Agentic AI section. It is a
DIFFERENT system from `app/agents/chatbot_engine.py` (the in-debate AI
opponent) and from `app/services/mentor_service.py` (the learner-only
Learning Hub mentor) — those are reused here as building blocks where it
makes sense, never duplicated.

Architecture
------------
1. Conversation Orchestrator Agent (this module's `handle_message`)
   - Resolves which specialized agents are relevant from (a) the current
     page the widget detected and (b) keywords in the user's message, so
     agent activation is genuinely context-aware, not hardcoded per page.
   - Gathers REAL grounding evidence for the user's role (their own debate
     history for a learner; their roster for a coach; class analytics for
     an educator; platform stats for an admin) — never invents data.
   - Runs the selected specialist agents, then synthesizes one coherent,
     markdown-formatted reply via the LLM provider chain, conditioned on
     everything the agents found.
   - Falls back to a deterministic, still-grounded reply if every LLM
     provider is unavailable (same resilience pattern as the rest of the
     platform), so the chatbot never 500s or returns an empty message.

2. Seven specialized agents (each a thin, reusable wrapper around an
   existing, already-battle-tested engine — no reimplementation):
   - Argument Analysis Agent        -> fallacy_agent.analyze_argument
   - Logical Fallacy Detection Agent -> fallacy_agent.detect_fallacy
   - Counterargument Agent          -> counterargument_service.generate_counterarguments
   - Presentation Analysis Agent    -> reads the learner's real presentation_analysis docs
   - Recommendation & Coaching Agent -> coaching_service.generate_coaching_feedback
   - Performance Analytics Agent    -> reads real performance/score collections per role
   - Report Generation Agent        -> summarizes the user's real recent reports
"""
from __future__ import annotations

import logging
from datetime import datetime

from app.core.database import (
    debate_feedback_reports_collection,
    fallacy_reports_collection,
    presentation_analysis_collection,
    performance_scores_collection,
    performance_history_collection,
    debate_sessions_collection,
    coach_assignments_collection,
    coach_reviews_collection,
    educator_assignments_collection,
    coaching_plans_collection,
    learning_plans_collection,
    users_collection,
)
from app.services import fallacy_agent, counterargument_service
from app.services.coaching_service import generate_coaching_feedback
from app.services.llm_provider import (
    get_text_result_with_history,
    AllProvidersUnavailableError,
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# Page -> default agent map (mirrors the mentor's "Where to implement the
# chatbot" reference table exactly). Keys are the `page_key` values the
# frontend widget sends, resolved from the current route.
# --------------------------------------------------------------------------
PAGE_AGENT_MAP: dict[str, list[str]] = {
    "learner_dashboard": ["performance_analytics", "recommendation_coaching"],
    "my_debates": ["argument_analysis", "fallacy_detection"],
    "debate_session": ["argument_analysis", "fallacy_detection", "counterargument"],
    "practice_topics": ["recommendation_coaching"],
    "argument_analyzer": ["argument_analysis"],
    "fallacy_detector": ["fallacy_detection"],
    "counterargument_generator": ["counterargument"],
    "presentation_analysis": ["presentation_analysis"],
    "performance_dashboard": ["performance_analytics", "recommendation_coaching"],
    "feedback_coaching": ["recommendation_coaching"],
    "coach_dashboard": ["recommendation_coaching", "performance_analytics"],
    "coach_evaluation_queue": ["argument_analysis", "fallacy_detection"],
    "educator_dashboard": ["performance_analytics", "report_generation"],
    "educator_class_analytics": ["performance_analytics", "report_generation"],
    "admin_dashboard": ["performance_analytics", "report_generation"],
    "help_support": [],
    "general": [],
}

# Human-readable labels used in the widget header ("Active agents: ...").
AGENT_LABELS: dict[str, str] = {
    "argument_analysis": "Argument Analysis Agent",
    "fallacy_detection": "Logical Fallacy Detection Agent",
    "counterargument": "Counterargument Agent",
    "presentation_analysis": "Presentation Analysis Agent",
    "recommendation_coaching": "Recommendation & Coaching Agent",
    "performance_analytics": "Performance Analytics Agent",
    "report_generation": "Report Generation Agent",
}

# Keyword -> agent, layered on top of the page default so a user can pull in
# a specialist agent by asking for it explicitly, regardless of what page
# they're on (e.g. asking "check this for fallacies" from the dashboard).
_KEYWORD_AGENTS = {
    # Fallacy detection
    "fallacy": "fallacy_detection",
    "logical fallacy": "fallacy_detection",
    "ad hominem": "fallacy_detection",
    "straw man": "fallacy_detection",

    # Counterargument generation
    "counterargument": "counterargument",
    "counter argument": "counterargument",
    "counter-argument": "counterargument",
    "rebuttal": "counterargument",
    "opposition": "counterargument",

    # Argument analysis
    "analyze argument": "argument_analysis",
    "analyse argument": "argument_analysis",
    "analyze my argument": "argument_analysis",
    "analyse my argument": "argument_analysis",
    "check my argument": "argument_analysis",
    "evaluate my argument": "argument_analysis",
    "analyze this claim": "argument_analysis",
    "analyse this claim": "argument_analysis",

    # Presentation analysis
    "presentation": "presentation_analysis",
    "speech": "presentation_analysis",
    "public speaking": "presentation_analysis",
    "confidence": "presentation_analysis",
    "filler word": "presentation_analysis",
    "filler words": "presentation_analysis",

    # Coaching
    "coach": "recommendation_coaching",
    "recommend": "recommendation_coaching",
    "recommendation": "recommendation_coaching",
    "improve": "recommendation_coaching",
    "how can i improve": "recommendation_coaching",

    # Performance analytics
    "score": "performance_analytics",
    "performance": "performance_analytics",
    "analytics": "performance_analytics",
    "trend": "performance_analytics",
    "progress": "performance_analytics",

    # Report generation
    "report": "report_generation",
    "generate report": "report_generation",
}

def resolve_agents(page_key: str, message: str, has_argument_text: bool) -> list[str]:
    """Decide which specialist agents this turn should activate."""

    if page_key in ("general", "global_chatbot"):
        agents = []

    else:
        # Global chatbot should answer normally.
        # Page-specific agents should only run when the user explicitly requests analysis.

        if page_key in ("my_debates", "debate_session") and not has_argument_text:
            agents = []
        else:
            agents = list(dict.fromkeys(PAGE_AGENT_MAP.get(page_key, [])))

    lowered = message.lower()

    # Activate specialist agents only when user explicitly asks for them
    for kw, agent in _KEYWORD_AGENTS.items():
        if kw in lowered and agent not in agents:
            agents.append(agent)

    # Run argument-related agents only when actual argument text is provided
    if has_argument_text:
        for agent in ("argument_analysis", "fallacy_detection", "counterargument"):
            if agent not in agents:
                agents.append(agent)

    return agents[:4]

# --------------------------------------------------------------------------
# Role-aware evidence gathering — every role gets REAL data, never invented.
# --------------------------------------------------------------------------
async def _gather_learner_evidence(user_id: str) -> dict:
    reports = [d async for d in debate_feedback_reports_collection.find({"user_id": user_id}).sort("updated_at", -1).limit(5)]
    fallacies = [d async for d in fallacy_reports_collection.find({"user_id": user_id, "report.fallacy_detected": True}).sort("created_at", -1).limit(10)]
    presentations = [d async for d in presentation_analysis_collection.find({"user_id": user_id}).sort("created_at", -1).limit(3)]
    scores = [d async for d in performance_scores_collection.find({"user_id": user_id}).sort("created_at", -1).limit(5)]
    coaching_plan = await coaching_plans_collection.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    learning_plan = await learning_plans_collection.find_one({"user_id": user_id}, sort=[("created_at", -1)])
    return {
        "role": "learner",
        "recent_feedback_reports": [r.get("report") for r in reports],
        "recent_fallacies": [{"type": f["report"].get("fallacy_type"), "severity": f["report"].get("severity")} for f in fallacies],
        "recent_presentation_scores": [
            {"speech_metrics": p.get("speech_metrics"), "presentation_score": p.get("presentation_score")} for p in presentations
        ],
        "recent_performance_scores": [s.get("scores") or s for s in scores],
        "current_coaching_plan": (
            {
                "source": coaching_plan.get("source"),
                "objectives": coaching_plan.get("objectives"),
                "summary": coaching_plan.get("summary"),
                "completion_percent": coaching_plan.get("completion_percent"),
                "status": coaching_plan.get("status"),
            }
            if coaching_plan
            else None
        ),
        "current_learning_plan": (
            {"summary": learning_plan.get("plan", {}).get("summary"), "progress": learning_plan.get("progress")}
            if learning_plan
            else None
        ),
    }


async def _gather_coach_evidence(user_id: str) -> dict:
    roster = [d async for d in coach_assignments_collection.find({"coach_id": user_id}).limit(50)]
    pending = await coach_reviews_collection.count_documents({"status": "pending"})
    claimed = await coach_reviews_collection.count_documents({"coach_id": user_id, "status": "claimed"})
    recent_reviews = [d async for d in coach_reviews_collection.find({"coach_id": user_id}).sort("updated_at", -1).limit(5)]
    return {
        "role": "debate_coach",
        "assigned_learner_count": len(roster),
        "pending_evaluation_queue": pending,
        "claimed_by_me": claimed,
        "recent_reviews": [
            {"learner_id": r.get("learner_id"), "topic": r.get("topic"), "ai_overall_score": r.get("ai_overall_score"), "status": r.get("status")}
            for r in recent_reviews
        ],
    }


async def _gather_educator_evidence(user_id: str) -> dict:
    total_learners = await users_collection.count_documents({"role": "learner"})
    assignments = [d async for d in educator_assignments_collection.find({"educator_id": user_id}).sort("assigned_at", -1).limit(10)]
    return {
        "role": "educator",
        "total_learners_on_platform": total_learners,
        "recent_topic_assignments": [
            {"learner_id": a.get("learner_id"), "topic": a.get("topic"), "debate_format": a.get("debate_format")} for a in assignments
        ],
    }


async def _gather_admin_evidence() -> dict:
    total_users = await users_collection.count_documents({})
    by_role = {}
    for role in ("learner", "debate_coach", "educator", "administrator"):
        by_role[role] = await users_collection.count_documents({"role": role})
    total_sessions = await debate_sessions_collection.count_documents({})
    return {
        "role": "administrator",
        "total_users": total_users,
        "users_by_role": by_role,
        "total_debate_sessions": total_sessions,
    }


async def gather_evidence(user: dict) -> dict:
    role = user.get("role")
    if role == "learner":
        return await _gather_learner_evidence(user["id"])
    if role == "debate_coach":
        return await _gather_coach_evidence(user["id"])
    if role == "educator":
        return await _gather_educator_evidence(user["id"])
    if role == "administrator":
        return await _gather_admin_evidence()
    return {"role": role}


# --------------------------------------------------------------------------
# Specialist agents — each returns {"agent": ..., "label": ..., "summary": str, "data": dict}
# --------------------------------------------------------------------------
async def _run_argument_analysis(text: str) -> dict:
    result = await fallacy_agent.analyze_argument(text)
    summary = (
        f"Overall score {result.overall_argument_score}/10. "
        f"Claims: {', '.join(result.claims[:3]) or 'none extracted'}. "
        f"Reasoning quality: {result.reasoning_quality}."
    )
    return {"agent": "argument_analysis", "label": AGENT_LABELS["argument_analysis"], "summary": summary, "data": result.model_dump()}


async def _run_fallacy_detection(text: str, arg_analysis=None) -> dict:
    result = await fallacy_agent.detect_fallacy(text, arg_analysis)
    if result.fallacy_detected:
        summary = f"Detected {result.fallacy_type} (severity: {result.severity}). {result.explanation or ''}"
    else:
        summary = "No logical fallacy detected in this text."
    return {"agent": "fallacy_detection", "label": AGENT_LABELS["fallacy_detection"], "summary": summary, "data": result.model_dump()}


async def _run_counterargument(text: str, topic: str | None) -> dict:
    result = await counterargument_service.generate_counterarguments(text, topic)
    summary = f"Generated {len(result.counterarguments)} rebuttal angle(s) and {len(result.opponent_questions)} likely opponent question(s)."
    return {"agent": "counterargument", "label": AGENT_LABELS["counterargument"], "summary": summary, "data": result.model_dump()}


async def _run_presentation_analysis(evidence: dict) -> dict:
    recent = evidence.get("recent_presentation_scores") or []
    if not recent:
        summary = "No presentation recordings analyzed yet — upload one on the Presentation Analysis page to get scored on clarity, pace, and confidence."
    else:
        latest = recent[0].get("presentation_score") or {}
        summary = f"Most recent presentation score: {latest}."
    return {"agent": "presentation_analysis", "label": AGENT_LABELS["presentation_analysis"], "summary": summary, "data": {"recent": recent}}


async def _run_recommendation_coaching(evidence: dict) -> dict:
    feedback = await generate_coaching_feedback(evidence)
    summary = f"Priority focus: {feedback.priority_focus}. Strengths: {', '.join(feedback.strengths[:2]) or 'building up evidence'}."
    return {"agent": "recommendation_coaching", "label": AGENT_LABELS["recommendation_coaching"], "summary": summary, "data": feedback.model_dump()}


async def _run_performance_analytics(evidence: dict) -> dict:
    role = evidence.get("role")
    if role == "learner":
        scores = evidence.get("recent_performance_scores") or []
        summary = f"{len(scores)} recent scored debate(s) on file." if scores else "No scored debates yet."
    elif role == "debate_coach":
        summary = (
            f"{evidence.get('assigned_learner_count', 0)} learners assigned, "
            f"{evidence.get('pending_evaluation_queue', 0)} items pending platform-wide review."
        )
    elif role == "educator":
        summary = f"{evidence.get('total_learners_on_platform', 0)} learners on the platform, {len(evidence.get('recent_topic_assignments', []))} recent topic assignments by you."
    elif role == "administrator":
        summary = f"{evidence.get('total_users', 0)} total users, {evidence.get('total_debate_sessions', 0)} debate sessions run to date."
    else:
        summary = "No performance data available for this role yet."
    return {"agent": "performance_analytics", "label": AGENT_LABELS["performance_analytics"], "summary": summary, "data": evidence}


async def _run_report_generation(evidence: dict) -> dict:
    role = evidence.get("role")
    if role == "learner":
        reports = evidence.get("recent_feedback_reports") or []
        summary = f"{len(reports)} debate feedback report(s) available to download as PDF from the Reports page."
    else:
        summary = "Use the Reports / export tools on your dashboard to generate a full PDF or Excel report from this real data."
    return {"agent": "report_generation", "label": AGENT_LABELS["report_generation"], "summary": summary, "data": {}}


_AGENT_RUNNERS = {
    "argument_analysis": _run_argument_analysis,
    "fallacy_detection": _run_fallacy_detection,
    "counterargument": _run_counterargument,
    "presentation_analysis": _run_presentation_analysis,
    "recommendation_coaching": _run_recommendation_coaching,
    "performance_analytics": _run_performance_analytics,
    "report_generation": _run_report_generation,
}


async def run_agents(agents: list[str], *, text: str | None, topic: str | None, evidence: dict) -> list[dict]:
    outputs: list[dict] = []
    arg_analysis_result = None

    # Argument analysis first if selected, so fallacy detection can use its output
    # (two-stage pipeline, same pattern as app/services/fallacy_agent.py's docstring).
    ordered = sorted(agents, key=lambda a: 0 if a == "argument_analysis" else 1)

    for agent in ordered:
        try:
            if agent == "argument_analysis" and text:
                out = await _run_argument_analysis(text)
                arg_analysis_result = fallacy_agent.ArgumentAnalysis(**out["data"])
                outputs.append(out)
            elif agent == "fallacy_detection" and text:
                outputs.append(await _run_fallacy_detection(text, arg_analysis_result))
            elif agent == "counterargument" and text:
                outputs.append(await _run_counterargument(text, topic))
            elif agent == "presentation_analysis":
                outputs.append(await _run_presentation_analysis(evidence))
            elif agent == "recommendation_coaching":
                outputs.append(await _run_recommendation_coaching(evidence))
            elif agent == "performance_analytics":
                outputs.append(await _run_performance_analytics(evidence))
            elif agent == "report_generation":
                outputs.append(await _run_report_generation(evidence))
        except Exception:
            logger.exception("Agent '%s' failed inside orchestrator; skipping it for this turn", agent)

    return outputs


# --------------------------------------------------------------------------
# Conversation Orchestrator Agent — synthesizes the final reply
# --------------------------------------------------------------------------
ORCHESTRATOR_SYSTEM_PROMPT = """You are the AI Debate Coach — the platform-wide agentic assistant for a
debate coaching and presentation analysis platform. You coordinate specialized AI agents and speak to the
user directly, in your own voice, as a knowledgeable, encouraging coach.

The user's role is: {role}
The page they are currently on: {page_label}
Specialist agents that ran this turn and what they found (JSON, may be empty if none were needed):
{agent_outputs}

Real evidence about this user/role from the database (JSON — never contradict or invent beyond this):
{evidence}

Rules:
- Ground every specific claim (scores, counts, fallacy names) in the agent outputs or evidence above. Never invent a number.
- If no agents ran and no evidence is relevant, just answer the debate/presentation coaching question directly and helpfully.
- Keep responses focused, under 180 words, markdown-formatted (short bullet points where useful).
- Speak as "I" (the AI Debate Coach), not "the agents"."""


# def _deterministic_reply(message: str, agent_outputs: list[dict], evidence: dict) -> str:
#     """Grounded, non-LLM fallback so the chatbot is never empty/dummy even
#     if every provider is down."""
#     if agent_outputs:
#         lines = [f"**{o['label']}**: {o['summary']}" for o in agent_outputs]
#         return "Here's what I found:\n\n" + "\n\n".join(lines)
#     role = evidence.get("role", "there")
#     return (
#         f"I hear you — as your AI Debate Coach I can analyze arguments, catch logical fallacies, "
#         f"generate counterarguments, review your presentation scores, and give you coaching "
#         f"recommendations grounded in your real activity. Try pasting an argument to analyze, or ask "
#         f"about your recent performance, {role}."
#     )

def _deterministic_reply(message, agent_outputs, evidence):
    text = message.lower()

    if "debate format" in text or "debate formats" in text:
        return """
There are several popular debate formats:

1. One-on-One Debate
- Direct head-to-head debate between two learners, or a learner and the AI opponent.

2. Parliamentary Debate
- Government vs Opposition format with structured speaking roles.

3. Oxford Debate
- Formal proposition/opposition format with a motion, rebuttals, and closing statements.

4. Policy Debate
- Evidence-heavy format focused on a specific policy proposal and its real-world impact.

5. Public Forum Debate
- Accessible, persuasion-focused format aimed at a general audience.

6. AI Debate Simulation
- Practice against the platform's AI opponent, which adapts difficulty and argument style.

Each format develops different skills such as research, reasoning, and communication.
"""

    return """
I can help you with debate preparation, argument analysis,
logical reasoning, counterarguments, and presentation improvement.
Please ask me a specific debate-related question.
"""


def _suggested_questions(page_key: str, agent_outputs: list[dict]) -> list[str]:
    base = {
        "learner_dashboard": ["What should I focus on improving next?", "Summarize my last debate."],
        "debate_session": ["Any fallacies in my last argument?", "Give me a stronger counterargument."],
        "presentation_analysis": ["How was my speaking pace?", "How do I sound more confident?"],
        "performance_dashboard": ["Why did my score change?", "Compare this month to last month."],
        "coach_dashboard": ["Which learners need review most urgently?", "Summarize the evaluation queue."],
        "educator_dashboard": ["Which class needs the most attention?", "Summarize recent assignments."],
        "admin_dashboard": ["Give me a platform health summary.", "How many active users today?"],
    }
    qs = base.get(page_key, ["What can you help me with here?", "Analyze this argument for me."])
    if any(o["agent"] == "fallacy_detection" for o in agent_outputs):
        qs = ["How do I fix this fallacy?"] + qs
    return qs[:3]


async def handle_message(
    *,
    user: dict,
    page_key: str,
    page_label: str,
    message: str,
    argument_text: str | None,
    history: list[tuple[str, str]],
) -> dict:
    """Main entry point for the Conversation Orchestrator Agent (non-streaming,
    used by clients that just want the final result — e.g. tests, or a
    fallback if the streaming endpoint's connection drops)."""
    prep = await _prepare_turn(user, page_key, message, argument_text)
    messages = [("system", ORCHESTRATOR_SYSTEM_PROMPT)] + history + [("human", "{message}")]

    try:
        reply = await get_text_result_with_history(
            messages=messages,
            variables=_turn_variables(user, page_label, prep, message),
            temperature=0.4,
        )
    except AllProvidersUnavailableError:
        logger.warning("orchestrator: all LLM providers unavailable, using deterministic fallback")
        reply = _deterministic_reply(message, prep["agent_outputs"], prep["evidence"])
    except Exception:
        logger.exception("orchestrator: unexpected error, using deterministic fallback")
        reply = _deterministic_reply(message, prep["agent_outputs"], prep["evidence"])

    return {
        "reply": reply,
        "agents_used": [o["agent"] for o in prep["agent_outputs"]],
        "suggested_questions": _suggested_questions(page_key, prep["agent_outputs"]),
    }


async def _prepare_turn(user: dict, page_key: str, message: str, argument_text: str | None) -> dict:
    """Shared setup for both the streaming and non-streaming entry points:
    resolves agents, gathers evidence, runs specialists. Kept as one place
    so streaming and non-streaming can never disagree on which agents ran."""
    text_for_agents = argument_text or (message if PAGE_AGENT_MAP.get(page_key) else None)
    active_agents = resolve_agents(
        page_key,
        message,
        has_argument_text=bool(argument_text) and len(argument_text.split()) > 8
    )
    evidence = await gather_evidence(user)
    agent_outputs = await run_agents(active_agents, text=text_for_agents, topic=None, evidence=evidence)
    return {"evidence": evidence, "agent_outputs": agent_outputs}


def _turn_variables(user: dict, page_label: str, prep: dict, message: str) -> dict:
    return {
        "role": user.get("role"),
        "page_label": page_label,
        "agent_outputs": [{"agent": o["agent"], "summary": o["summary"]} for o in prep["agent_outputs"]],
        "evidence": prep["evidence"],
        "message": message,
    }


async def stream_message(
    *,
    user: dict,
    page_key: str,
    page_label: str,
    message: str,
    argument_text: str | None,
    history: list[tuple[str, str]],
):
    """Streaming variant of handle_message. Yields text chunks as they're
    generated (real token streaming from the LLM provider), then a final
    dict with the complete reply + metadata so the caller can persist it.
    Falls back to word-chunked streaming of the deterministic reply if every
    LLM provider is unavailable, so the UI still gets a progressive, real
    (non-canned-per-chunk) response either way."""
    from app.services.llm_provider import stream_text_result_with_history

    prep = await _prepare_turn(user, page_key, message, argument_text)
    messages = [("system", ORCHESTRATOR_SYSTEM_PROMPT)] + history + [("human", "{message}")]

    full_reply = ""
    try:
        async for chunk in stream_text_result_with_history(
            messages=messages,
            variables=_turn_variables(user, page_label, prep, message),
            temperature=0.4,
        ):

            if isinstance(chunk, list):
                chunk = "".join(
                    item.get("text", "") if isinstance(item, dict) else str(item)
                    for item in chunk
                )

            elif isinstance(chunk, dict):
                chunk = chunk.get("text", "")

            else:
                chunk = str(chunk)

            full_reply += chunk

            yield {
                "type": "chunk",
                "text": chunk,
            }

    except AllProvidersUnavailableError:
        logger.warning("orchestrator (stream): all LLM providers unavailable, using deterministic fallback")
        fallback = _deterministic_reply(message, prep["agent_outputs"], prep["evidence"])
        for word in fallback.split(" "):
            piece = word + " "
            full_reply += piece
            yield {"type": "chunk", "text": piece}
    except Exception:
        logger.exception("orchestrator (stream): unexpected error, using deterministic fallback")
        fallback = _deterministic_reply(message, prep["agent_outputs"], prep["evidence"])
        for word in fallback.split(" "):
            piece = word + " "
            full_reply += piece
            yield {"type": "chunk", "text": piece}

    yield {
        "type": "done",
        "full_text": full_reply.strip(),
        "agents_used": [o["agent"] for o in prep["agent_outputs"]],
        "suggested_questions": _suggested_questions(page_key, prep["agent_outputs"]),
    }
