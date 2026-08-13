from typing import Annotated, TypedDict

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages

from app.core.config import settings
from app.agents.format_prompts import get_format_style, get_experience_style

DOMAIN_COACHING_HINTS = {
    "Technical": "Encourage precise technical vocabulary and structured, step-by-step explanations.",
    "Business": "Encourage persuasive, professional communication with a strategic framing.",
    "Education": "Favor clear, pedagogical explanations suited to a teaching context.",
    "Marketing": "Emphasize brand-conscious framing and audience persuasion.",
    "Healthcare": "Favor careful, precise language appropriate to clinical or patient-facing contexts.",
    "Finance": "Emphasize rigor with numbers, risk framing, and financial reasoning.",
    "Sales": "Emphasize persuasive framing and handling objections confidently.",
    "Human Resources": "Favor diplomatic, people-centered framing.",
    "Public Speaking": "Emphasize clarity, pacing, and audience engagement.",
    "Interview Preparation": "Favor concise, confident answers with a professional tone.",
    "Entrepreneurship": "Favor founder-style storytelling and conviction.",
    "Research": "Favor academic rigor and evidence-based framing.",
    "Legal": "Favor precise, argumentative framing suited to legal reasoning.",
    "Environmental": "Favor evidence-based framing around sustainability topics.",
    "Social Issues": "Favor empathetic, civic-minded framing on social topics.",
}

DIFFICULTY_HINTS = {
    "easy": "Use simpler arguments, fewer rebuttals, and a less aggressive tone.",
    "medium": "Use balanced difficulty with strong counterarguments.",
    "hard": "Be highly persuasive with advanced logical reasoning, strong rebuttals, and a more challenging tone.",
}

FEEDBACK_STYLE_HINTS = {
    "encouraging": "Keep your in-character tone constructive — this only affects your framing, not your fallacy rate or rigor.",
    "balanced": "",
    "strict": "Be direct and don't soften your rebuttals.",
}


def _domain_context_hint(domain_names: list[str]) -> str:
    hints = [DOMAIN_COACHING_HINTS[d] for d in domain_names if d in DOMAIN_COACHING_HINTS]
    if not hints:
        return ""
    return "\n\nAdditional coaching focus based on the learner's chosen domains:\n" + "\n".join(
        f"- {h}" for h in hints
    )


class DebateState(TypedDict):
    messages: Annotated[list, add_messages]
    topic_title: str
    user_stance: str  # "for" or "against" — the AI opponent argues the opposite
    debate_format: str | None  # The format of the debate (e.g., "one_on_one", "oxford")
    aggressiveness: str
    sophistication: str
    fallacy_rate: float
    experience_level: str | None
    domain_names: list[str]
    opponent_difficulty: str | None
    feedback_style: str | None
    turn_number: int        
    max_turns: int

def _get_phase_label(turn_number: int, max_turns: int) -> str:
    """Maps a turn number to a debate phase label, injected into the prompt so the AI
    knows where it is in the round structure without new graph nodes."""
    if turn_number <= 1:
        return "OPENING STATEMENT — introduce your position clearly."
    if turn_number >= max_turns:
        return "CLOSING STATEMENT — summarize your strongest points and conclude."
    return "REBUTTAL — directly engage with the opponent's most recent point."

def _build_system_prompt(state: DebateState) -> str:
    ai_stance = "against" if state["user_stance"] == "for" else "for"
    fallacy_pct = int(state["fallacy_rate"] * 100)
    format_style = get_format_style(state.get("debate_format"))
    experience_style = get_experience_style(state.get("experience_level"))
    domain_hint = _domain_context_hint(state.get("domain_names", []))
    difficulty_hint = DIFFICULTY_HINTS.get(state.get("opponent_difficulty"), "")
    feedback_style_hint = FEEDBACK_STYLE_HINTS.get(state.get("feedback_style"), "")

    return f"""You are an AI debate opponent practicing with a learner on the motion: \
"{state['topic_title']}"

You are arguing {ai_stance.upper()} this motion. The learner is arguing {state['user_stance'].upper()}.

Your personality settings for this session:
- Aggressiveness: {state['aggressiveness']} (how forcefully/combatively you push back)
- Sophistication: {state['sophistication']} (how advanced and layered your arguments are)
- Deliberate fallacy rate: approximately {fallacy_pct}% of your responses should contain ONE \
subtle, realistic logical fallacy (e.g. Straw Man, Slippery Slope, Ad Hominem, False Dilemma), \
woven naturally into an otherwise reasonable-sounding rebuttal. This gives the learner practice \
spotting flawed reasoning. The rest of the time, argue as soundly and rigorously as possible.

{format_style}

{experience_style}
{domain_hint}
{difficulty_hint}
{feedback_style_hint}
Current phase: {_get_phase_label(state.get("turn_number", 1), state.get("max_turns", 6))}

Rules:
- Stay in character as a debate opponent, not an assistant.
- Keep responses to 2-4 sentences — this is a spoken debate round, not an essay.
- Directly respond to the learner's most recent point.
- Never break character to explain that you used a fallacy — that's for the coaching layer to flag separately.
"""


def _ai_opponent_node(state: DebateState) -> dict:
    llm = ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, temperature=0.8)
    system_prompt = _build_system_prompt(state)
    response = llm.invoke([SystemMessage(content=system_prompt), *state["messages"]])
    return {"messages": [response]}


def build_debate_graph():
    graph = StateGraph(DebateState)
    graph.add_node("ai_opponent", _ai_opponent_node)
    graph.add_edge(START, "ai_opponent")
    graph.add_edge("ai_opponent", END)

    # MemorySaver keeps conversation state in-process, keyed by thread_id, so a session
    # survives a page refresh as long as the backend process itself hasn't restarted.
    # Upgrade path: swap MemorySaver for a SQLite or Postgres checkpointer for durability
    # across server restarts, once that's needed.
    checkpointer = MemorySaver()
    return graph.compile(checkpointer=checkpointer)


_compiled_graph = build_debate_graph()


def run_debate_turn(
    session_id: int,
    topic_title: str,
    user_stance: str,
    user_text: str,
    aggressiveness: str,
    sophistication: str,
    fallacy_rate: float,
    debate_format: str = "one_on_one",
    experience_level: str = "beginner",
    domain_names: list[str] | None = None,
    opponent_difficulty: str = "medium",
    feedback_style: str = "balanced",
    turn_number: int = 1,        
    max_turns: int = 6,  
) -> str:
    config = {"configurable": {"thread_id": str(session_id)}}
    result = _compiled_graph.invoke(
        {
            "messages": [HumanMessage(content=user_text)],
            "topic_title": topic_title,
            "user_stance": user_stance,
            "aggressiveness": aggressiveness,
            "sophistication": sophistication,
            "fallacy_rate": fallacy_rate,
            "debate_format": debate_format,
            "experience_level": experience_level,
            "domain_names": domain_names or [],
            "opponent_difficulty": opponent_difficulty,
            "feedback_style": feedback_style,
            "turn_number": turn_number,
            "max_turns": max_turns,
        },
        config=config,
    )
    last_message: AIMessage = result["messages"][-1]
    return last_message.content