"""AI Debate Coach chat page (full-page assistant, distinct from the
per-turn Opponent agent). Routes the user's message to the right existing
agent based on intent -- analyze, fallacy-check, or counterargument -- and
falls back to general conversation otherwise.
"""

from typing import List, Optional

from services.fallacy_agent import analyze_argument
from services.scoring_agent import score_argument
from services.opponent_agent import generate_opponent_reply
from services.assistant_agent import generate_assistant_reply


def _extract_argument_text(message: str) -> str:
    """Pulls the actual argument out of a prompt like 'Analyze this argument: ...'."""
    if ":" in message:
        return message.split(":", 1)[1].strip()
    return message.strip()


def generate_coach_reply(message: str, history: List[dict], user_name: str, role_label: str) -> dict:
    lower = message.lower()
    argument_text = _extract_argument_text(message)

    if "fallac" in lower:
        report = analyze_argument(argument_text)
        if report.fallacy_detected:
            reply = (
                f"I found a {report.fallacy_type}. {report.explanation} "
                f"Try instead: {report.correction_suggestion}"
            )
        else:
            reply = "I didn't detect any clear logical fallacy in that -- the reasoning holds up."
        return {"reply": reply, "fallacy": report.dict(), "score": None}

    if "analy" in lower or "score" in lower:
        score = score_argument(argument_text)
        reply = f"Overall score: {score.overall_score}/100. {score.feedback or ''}".strip()
        return {"reply": reply, "fallacy": None, "score": score.dict()}

    if "counter" in lower or "rebuttal" in lower:
        rebuttal = generate_opponent_reply(
            topic="General Debate Practice",
            debate_format="AI Debate Simulation",
            position="For",
            history=[],
            user_message=argument_text,
            fallacy_report=None,
            difficulty="Advanced",
        )
        return {"reply": rebuttal.rebuttal_text, "fallacy": None, "score": None}

    # Plain conversational fallback
    reply = generate_assistant_reply(user_name, role_label, history, message)
    return {"reply": reply, "fallacy": None, "score": None}