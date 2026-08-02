"""Agent 2: The Opponent.

Generates the AI debate opponent's next line, adapting tone/rules per the
selected debate format, and calling out any fallacy the Auditor just flagged.

Runs on Groq's free-tier API (OpenAI-compatible via LangChain), so no paid
OpenAI credits are required.
"""

from typing import List, Optional

from langchain_groq import ChatGroq

from schemas.fallacy import FallacyReport

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

_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
    return _llm


def _build_system_prompt(topic: str, debate_format: str, position: str, fallacy_report: Optional[FallacyReport]) -> str:
    style = FORMAT_STYLES.get(debate_format, FORMAT_STYLES["One-on-One Debate"])
    opposite_position = "Against" if position == "For" else "For"

    prompt = (
        f"You are the AI debate opponent in a structured practice debate.\n"
        f"Topic: {topic}\n"
        f"Format: {debate_format}\n"
        f"The user is arguing '{position}'. You must argue '{opposite_position}'.\n"
        f"Style: {style}\n"
        f"Keep each reply to 3-5 sentences. Always advance a specific counter-argument, "
        f"don't just disagree in the abstract."
    )

    if fallacy_report and fallacy_report.fallacy_detected:
        prompt += (
            f"\n\nThe user's last statement contains a logical fallacy: "
            f"{fallacy_report.fallacy_type}. Briefly and respectfully call this out "
            f"in-character before continuing your rebuttal -- don't be harsh, treat it "
            f"as a coaching moment."
        )

    return prompt


def generate_opponent_reply(
    topic: str,
    debate_format: str,
    position: str,
    history: List[dict],
    user_message: str,
    fallacy_report: Optional[FallacyReport],
) -> str:
    """Runs the Opponent agent for one turn and returns its reply text."""
    system_prompt = _build_system_prompt(topic, debate_format, position, fallacy_report)

    messages = [{"role": "system", "content": system_prompt}]
    for turn in history:
        role = "assistant" if turn["speaker"] == "opponent" else "user"
        messages.append({"role": role, "content": turn["message"]})
    messages.append({"role": "user", "content": user_message})

    llm = _get_llm()
    response = llm.invoke(messages)
    return response.content