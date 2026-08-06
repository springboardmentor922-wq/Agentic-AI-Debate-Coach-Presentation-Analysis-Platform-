"""Agent 2: The Opponent (Milestone 3: Counterargument Generation + AI Debate Simulation).

Generates the AI debate opponent's next line as STRUCTURED output -- not just
plain text -- categorizing the rebuttal type (Logical / Evidence-Based /
Ethical / Practical-Policy per the spec), plus a challenge question and a
debate strategy suggestion. Also adapts to a selectable difficulty level
(Novice / Advanced / Master).

Context-window management: only the last few turns are sent verbatim to keep
latency and token usage low on long debates, rather than replaying the
entire transcript every turn.

Runs on Groq's free tier.
"""

from typing import List, Optional

from langchain_groq import ChatGroq

from schemas.fallacy import FallacyReport
from schemas.rebuttal import OpponentRebuttal

FORMAT_STYLES = {
    "One-on-One Debate": (
        "Speak directly and conversationally, like a sharp, respectful peer debater."
    ),
    "Parliamentary Debate": (
        "Use formal parliamentary address (e.g. 'The Honorable Member argues...') "
        "and speak as if addressing a chamber."
    ),
    "Oxford Debate": (
        "Take a firm, formal position against the motion. Structure your rebuttal "
        "like a formal Oxford-style speech."
    ),
    "Policy Debate": (
        "Focus on concrete policy mechanisms, evidence, and real-world impact analysis."
    ),
    "Public Forum Debate": (
        "Speak persuasively and accessibly, as if addressing an educated general audience."
    ),
    "AI Debate Simulation": (
        "Simulate a well-informed, articulate opponent that adapts closely to the "
        "user's specific arguments."
    ),
}

DIFFICULTY_STYLES = {
    "Novice": (
        "Keep your rebuttals gentle and straightforward. Point out only the most "
        "obvious weaknesses. Avoid subtle logical traps -- this debater is just starting out."
    ),
    "Advanced": (
        "Debate at a solid competitive level. Point out real weaknesses and press "
        "the user to defend their position with evidence."
    ),
    "Master": (
        "Debate aggressively and skillfully. Actively hunt for subtle logical gaps, "
        "weak assumptions, and unsupported claims. Do not go easy."
    ),
}

MAX_HISTORY_TURNS = 6  # last N messages sent verbatim; keeps latency/tokens low

_llm = None


def _get_structured_llm():
    global _llm
    if _llm is None:
        base = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
        _llm = base.with_structured_output(OpponentRebuttal)
    return _llm


def _build_system_prompt(
    topic: str,
    debate_format: str,
    position: str,
    difficulty: str,
    fallacy_report: Optional[FallacyReport],
) -> str:
    style = FORMAT_STYLES.get(debate_format, FORMAT_STYLES["One-on-One Debate"])
    difficulty_style = DIFFICULTY_STYLES.get(difficulty, DIFFICULTY_STYLES["Advanced"])
    opposite_position = "Against" if position == "For" else "For"

    prompt = (
        f"You are the AI debate opponent in a structured practice debate.\n"
        f"Topic: {topic}\n"
        f"Format: {debate_format}\n"
        f"Difficulty: {difficulty}\n"
        f"The user is arguing '{position}'. You must argue '{opposite_position}'.\n"
        f"Style: {style}\n"
        f"Difficulty behavior: {difficulty_style}\n\n"
        f"Produce a structured rebuttal with these parts:\n"
        f"- rebuttal_type: classify your rebuttal as exactly one of 'Logical', "
        f"'Evidence-Based', 'Ethical', or 'Practical-Policy', based on the angle you take.\n"
        f"- rebuttal_text: your actual counterargument, 3-5 sentences, always advancing "
        f"a specific point, not just disagreeing in the abstract.\n"
        f"- challenge_question: one probing question that pushes the user to defend "
        f"or clarify their position further.\n"
        f"- strategy_suggestion: one brief, friendly tip for the user on how to "
        f"strengthen their next argument (e.g. what kind of evidence to bring, or "
        f"which angle to attack next)."
    )

    if fallacy_report and fallacy_report.fallacy_detected:
        prompt += (
            f"\n\nThe user's last statement contains a logical fallacy: "
            f"{fallacy_report.fallacy_type}. Briefly and respectfully call this out "
            f"in-character inside rebuttal_text before continuing -- don't be harsh, "
            f"treat it as a coaching moment."
        )

    return prompt


def generate_opponent_reply(
    topic: str,
    debate_format: str,
    position: str,
    history: List[dict],
    user_message: str,
    fallacy_report: Optional[FallacyReport],
    difficulty: str = "Advanced",
) -> OpponentRebuttal:
    """Runs the Opponent agent for one turn and returns a structured OpponentRebuttal."""
    system_prompt = _build_system_prompt(topic, debate_format, position, difficulty, fallacy_report)

    # Context-window management: only replay the last MAX_HISTORY_TURNS turns
    # verbatim instead of the entire debate transcript (keeps latency/tokens low).
    recent_history = history[-MAX_HISTORY_TURNS:] if len(history) > MAX_HISTORY_TURNS else history

    messages = [{"role": "system", "content": system_prompt}]
    for turn in recent_history:
        role = "assistant" if turn["speaker"] == "opponent" else "user"
        messages.append({"role": role, "content": turn["message"]})
    messages.append({"role": "user", "content": user_message})

    llm = _get_structured_llm()
    result = llm.invoke(messages)
    if isinstance(result, OpponentRebuttal):
        return result
    return OpponentRebuttal(**result)