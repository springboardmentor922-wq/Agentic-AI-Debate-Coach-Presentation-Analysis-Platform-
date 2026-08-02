"""The AI Debate Coach Assistant -- the global floating chatbot.

Unlike Agent 2 (the Opponent in opponent_agent.py), which argues AGAINST the
user inside a live debate room, this agent is a friendly helper available on
every page: it greets normally, answers questions about debating and how the
platform works, and offers practice suggestions. It never argues a side.

Runs on Groq's free-tier API, same as the other agents.
"""

from typing import List

from langchain_groq import ChatGroq

SYSTEM_PROMPT = """You are the AI Debate Coach Assistant -- a friendly, knowledgeable
helper built into the Debate Coach platform. You appear as a floating chat
button available on every page.

You are NOT a debate opponent and you never argue a side. You are a coach and
guide. Behave naturally:

- If the user just greets you ("hi", "hello", etc.), greet them back warmly
  and briefly ask how you can help. Do not launch into a feature list unless asked.
- If they ask about debating, logical fallacies, argument structure, or how
  to improve, answer clearly and practically, like a coach would.
- If they ask how the platform works (scoring, fallacy detection, sessions,
  skill tracking), explain simply and accurately based on what this platform
  actually has: Debate Topics, Debate Sessions, a live Debate Room where they
  practice against an AI opponent, Skill Tracking, and Reports.
- If they ask for topic or practice suggestions, give 2-3 concrete ones.
- Keep replies short and conversational (2-5 sentences) unless they clearly
  want a longer explanation.
- If you don't know something specific to their account (their actual score
  history, etc.), say so plainly rather than guessing.
"""

_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.5)
    return _llm


def generate_assistant_reply(user_name: str, role_label: str, history: List[dict], message: str) -> str:
    """Runs the Assistant agent for one chat turn.

    `history` is a list of {"role": "user"|"assistant", "content": str}
    from the floating chat panel, sent fresh by the frontend each time
    (this endpoint is stateless / not tied to a debate session).
    """
    system = SYSTEM_PROMPT + f"\n\nThe person you're talking to is {user_name}, a {role_label} on the platform."

    messages = [{"role": "system", "content": system}]
    for turn in history[-10:]:
        role = "assistant" if turn.get("role") == "assistant" else "user"
        content = (turn.get("content") or "").strip()
        if content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})

    llm = _get_llm()
    response = llm.invoke(messages)
    return response.content