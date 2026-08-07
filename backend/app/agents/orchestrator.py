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

from app.core.database import (
    debate_feedback_reports_collection,
    fallacy_reports_collection,
    presentation_analysis_collection,
    performance_scores_collection,
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
    "fallacy": "fallacy_detection",
    "fallacies": "fallacy_detection",
    "ad hominem": "fallacy_detection",
    "straw man": "fallacy_detection",
    "counterargument": "counterargument",
    "counter-argument": "counterargument",
    "counterarguments": "counterargument",
    "rebuttal": "counterargument",
    "argument": "argument_analysis",
    "arguments": "argument_analysis",
    "claim": "argument_analysis",
    "presentation": "presentation_analysis",
    "speech": "presentation_analysis",
    "confidence": "presentation_analysis",
    "filler word": "presentation_analysis",
    "coach": "recommendation_coaching",
    "recommend": "recommendation_coaching",
    "improve": "recommendation_coaching",
    "score": "performance_analytics",
    "performance": "performance_analytics",
    "trend": "performance_analytics",
    "report": "report_generation",
}

# Which specialist agents each role is even allowed to activate. This is the
# hard boundary that keeps a coach/educator/admin turn from accidentally
# pulling in learner-only debate-practice agents (argument analysis, fallacy
# detection, counterargument, presentation analysis) just because a keyword
# matched — those agents operate on a learner's own text/voice, which coaches
# and admins don't have in this context. Without this gate, keyword matching
# alone made every role's chatbot capable of drifting into learner behavior.
ROLE_ALLOWED_AGENTS: dict[str, set[str]] = {
    "learner": {
        "argument_analysis",
        "fallacy_detection",
        "counterargument",
        "presentation_analysis",
        "recommendation_coaching",
        "performance_analytics",
        "report_generation",
    },
    "debate_coach": {"performance_analytics", "recommendation_coaching", "report_generation"},
    "educator": {"performance_analytics", "report_generation"},
    "administrator": {"performance_analytics", "report_generation"},
}


def _is_conversational_smalltalk(message: str) -> bool:
    """Detects greetings/small talk ("Hi", "thanks", "how are you", "bye")
    so the orchestrator can skip specialist-agent activation entirely and
    let the reply be a plain conversational one — this is what stops a bare
    "Hi" from triggering the Recommendation/Performance agents just because
    of the page the user happens to be on."""
    normalized = message.strip().lower().strip("!?. ")
    if not normalized:
        return True
    smalltalk_phrases = {
        "hi", "hii", "hiii", "hello", "hey", "heyy", "yo", "sup", "hi there", "hello there",
        "good morning", "good afternoon", "good evening", "good night",
        "how are you", "how are you doing", "how's it going", "hows it going", "whats up", "what's up",
        "thanks", "thank you", "thankyou", "thanks a lot", "thank you so much", "ty",
        "ok", "okay", "cool", "nice", "great", "awesome", "got it", "sounds good",
        "bye", "goodbye", "see you", "see ya", "later", "good bye",
        "who are you", "what are you", "what can you do", "help",
    }
    if normalized in smalltalk_phrases:
        return True
    # Short messages (<=5 words) that start with a smalltalk opener and have
    # no debate/coaching-relevant keyword are still smalltalk, e.g.
    # "hi, how are you doing" or "hey there!".
    word_count = len(normalized.split())
    starts_with_smalltalk = any(normalized.startswith(p) for p in ("hi", "hello", "hey", "thank", "bye", "good morning", "good evening", "good afternoon", "how are you"))
    if word_count <= 6 and starts_with_smalltalk:
        return not any(kw in normalized for kw in _KEYWORD_AGENTS)
    return False


def resolve_agents(page_key: str, message: str, has_argument_text: bool, role: str | None = None) -> list[str]:
    """Decide which specialist agents this turn should activate, constrained
    to what the user's role is allowed to use. Greetings/small talk never
    activate any agent, regardless of page — a page's default agents are
    only a *ceiling* for what's relevant there, not something that should
    fire on every single message sent while that page happens to be open."""
    if not has_argument_text and _is_conversational_smalltalk(message):
        return []

    allowed = ROLE_ALLOWED_AGENTS.get(role or "", ROLE_ALLOWED_AGENTS["learner"])

    agents = [a for a in dict.fromkeys(PAGE_AGENT_MAP.get(page_key, [])) if a in allowed]

    lowered = message.lower()
    for kw, agent in _KEYWORD_AGENTS.items():
        if kw in lowered and agent in allowed and agent not in agents:
            agents.append(agent)

    if has_argument_text and role == "learner":
        for agent in ("argument_analysis", "fallacy_detection", "counterargument"):
            if agent in allowed and agent not in agents:
                agents.append(agent)

    return agents[:4]  # keep the turn focused — max 4 specialists at once


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
#
# Each role gets its OWN system prompt with a distinct persona, scope, and
# hard "never do X" boundary, rather than one shared prompt with a `{role}`
# variable swapped in. A shared prompt only changes what facts get quoted
# back — the voice, scope, and behavior stayed identical across roles, which
# was the root cause of every role "sounding the same." These four prompts
# are deliberately non-overlapping in subject matter.
# --------------------------------------------------------------------------
_SHARED_RULES = """Ground every specific claim (scores, counts, names) in the agent outputs or evidence JSON below —
never invent a number or fact that isn't in it. Keep responses focused, under 180 words, markdown-formatted
(short bullet points where useful). Speak as "I", not "the agents" or "the system".

NEVER mention internal agent/system names (e.g. "Recommendation Agent", "Performance Analytics Agent",
"Fallacy Detection Agent") anywhere in your reply — merge whatever they found into your own natural sentences,
as if you personally looked it up. If the agent_outputs JSON is empty and the user just sent a greeting, thanks,
or casual remark, reply like a normal person would — a short, warm, conversational line. Do NOT force in
debate/coaching content, statistics, or a feature pitch unless the user actually asked for help with something."""

LEARNER_SYSTEM_PROMPT = f"""You are the AI Debate Coach for a LEARNER on a debate-coaching platform. You are a
personal debate & public-speaking tutor. You specialize ONLY in: debate preparation, logical reasoning and
logical fallacies, grammar and pronunciation, public speaking and confidence, argument and speech improvement,
presentation feedback, quizzes, learning plans, practice exercises, debate strategy, and encouragement/motivation.

The page they are currently on: {{page_label}}
Specialist agents that ran this turn (JSON, may be empty): {{agent_outputs}}
Real evidence about this learner from the database (JSON): {{evidence}}

{_SHARED_RULES}
You do not have visibility into other learners, coach queues, class rosters, or platform administration — if asked
about those, say that's outside what you can see as their learner coach and redirect to debate/speaking help."""

COACH_SYSTEM_PROMPT = f"""You are the AI Debate Coach ASSISTANT for a DEBATE COACH on a debate-coaching platform.
You specialize ONLY in coaching-workflow tasks: learner evaluation support, presentation/debate review help,
the pending-review queue, evaluation status, coaching recommendations, identifying weak learners and top
performers, performance analytics across the coach's roster, coaching plans, and review summaries.

The page they are currently on: {{page_label}}
Specialist agents that ran this turn (JSON, may be empty): {{agent_outputs}}
Real evidence about this coach's roster/queue from the database (JSON): {{evidence}}

{_SHARED_RULES}
You do not tutor learners directly, generate counterarguments, or run fallacy/argument analysis on raw text — that
is the learner-side tool. You do not have visibility into other coaches' rosters, class curricula, or platform
administration. If asked for those, say so and redirect to coaching-queue and roster-analytics help instead."""

EDUCATOR_SYSTEM_PROMPT = f"""You are the AI Debate Coach ASSISTANT for an EDUCATOR on a debate-coaching platform.
You specialize ONLY in: class analytics, student performance trends, learning/progress reports, curriculum
guidance, debate topic and assignment ideas, course insights, learning outcomes, and academic/grading support
at the class level.

The page they are currently on: {{page_label}}
Specialist agents that ran this turn (JSON, may be empty): {{agent_outputs}}
Real evidence about this educator's classes from the database (JSON): {{evidence}}

{_SHARED_RULES}
You do not tutor individual learners one-on-one, run the coach's review queue, or perform platform
administration — if asked for those, say so and redirect to class-analytics and curriculum help instead."""

ADMIN_SYSTEM_PROMPT = f"""You are the AI Debate Coach ASSISTANT for a PLATFORM ADMINISTRATOR on a debate-coaching
platform. You specialize ONLY in: platform health, system status, user and role management, AI provider/service
status, database health, platform-wide analytics, security and audit information, configuration, integrations,
infrastructure, and overall platform summaries.

The page they are currently on: {{page_label}}
Specialist agents that ran this turn (JSON, may be empty): {{agent_outputs}}
Real platform-wide evidence from the database (JSON): {{evidence}}

{_SHARED_RULES}
You do not tutor learners, run coaching-queue workflows, or produce class curricula — those are other roles'
tools. If asked for those, say so and redirect to platform-health and administration help instead."""

ROLE_SYSTEM_PROMPTS: dict[str, str] = {
    "learner": LEARNER_SYSTEM_PROMPT,
    "debate_coach": COACH_SYSTEM_PROMPT,
    "educator": EDUCATOR_SYSTEM_PROMPT,
    "administrator": ADMIN_SYSTEM_PROMPT,
}


def system_prompt_for_role(role: str | None) -> str:
    return ROLE_SYSTEM_PROMPTS.get(role or "", LEARNER_SYSTEM_PROMPT)


_GREETING_REPLIES = {
    "learner": "Hi! 👋 Good to see you. How can I help with your debate prep today — practice, feedback, or something specific you're working on?",
    "debate_coach": "Hi there! Ready to help with your coaching workflow — reviews, learner progress, whatever you need.",
    "educator": "Hello! Happy to help with class analytics, reports, or curriculum ideas — what's on your mind?",
    "administrator": "Hi! I'm here for platform health, users, or analytics — what would you like to check?",
}
_THANKS_REPLIES = "You're welcome! Let me know if there's anything else I can help with."
_BYE_REPLIES = "Goodbye! Have a great one — come back anytime you need help."


def _deterministic_reply(message: str, agent_outputs: list[dict], evidence: dict) -> str:
    """Grounded, non-LLM fallback so the chatbot is never empty/dummy even
    if every provider is down. Never surfaces raw internal agent names —
    agent findings are merged into flowing natural sentences instead of a
    labeled dump, since the person talking to this should never see
    "Recommendation & Coaching Agent" as literal text."""
    role = evidence.get("role") or "learner"
    normalized = message.strip().lower().strip("!?. ")

    if not agent_outputs:
        if normalized in {"thanks", "thank you", "thankyou", "thanks a lot", "thank you so much", "ty"}:
            return _THANKS_REPLIES
        if normalized in {"bye", "goodbye", "good bye", "see you", "see ya", "later"}:
            return _BYE_REPLIES
        if not normalized or normalized in {
            "hi", "hii", "hiii", "hello", "hey", "heyy", "yo", "sup", "hi there", "hello there",
            "good morning", "good afternoon", "good evening", "good night",
            "how are you", "how are you doing", "how's it going", "hows it going",
        }:
            return _GREETING_REPLIES.get(role, _GREETING_REPLIES["learner"])

    if agent_outputs:
        # Merge every agent's summary into one flowing paragraph — no
        # "**Agent Name**:" labels, no bullet-per-agent structure that
        # reveals the internal pipeline.
        sentences = [o["summary"].rstrip(".") for o in agent_outputs if o.get("summary")]
        merged = ". ".join(sentences)
        if merged and not merged.endswith("."):
            merged += "."
        return f"Here's what I found: {merged}" if merged else _GREETING_REPLIES.get(role, _GREETING_REPLIES["learner"])

    role_fallbacks = {
        "learner": (
            "I can help you analyze arguments, catch logical fallacies, generate counterarguments, "
            "review your presentation scores, and give coaching recommendations grounded in your real "
            "activity. Try pasting an argument to analyze, or ask about your recent performance."
        ),
        "debate_coach": (
            "I can help with your coaching workflow — pending reviews, your roster's recent performance, "
            "weak-vs-top learners, and coaching-plan recommendations. Ask about your evaluation queue or "
            "a specific learner's recent scores."
        ),
        "educator": (
            "I can help with class analytics, learner performance trends, curriculum and assignment ideas, "
            "and academic reporting. Ask about a class's recent progress or recommended debate topics."
        ),
        "administrator": (
            "I can help with platform health, user/role management, AI provider status, and platform-wide "
            "analytics. Ask about total users, session volume, or system status."
        ),
    }
    return role_fallbacks.get(role, role_fallbacks["learner"])


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
    messages = [("system", system_prompt_for_role(user.get("role")))] + history + [("human", "{message}")]

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
        page_key, message, has_argument_text=bool(argument_text), role=user.get("role")
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
    messages = [("system", system_prompt_for_role(user.get("role")))] + history + [("human", "{message}")]

    full_reply = ""
    try:
        async for chunk in stream_text_result_with_history(
            messages=messages,
            variables=_turn_variables(user, page_label, prep, message),
            temperature=0.4,
        ):
            full_reply += chunk
            yield {"type": "chunk", "text": chunk}
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
