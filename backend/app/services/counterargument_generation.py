from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings


class CounterargumentResult(BaseModel):
    """Structured counterarguments and coaching output for a single debate argument."""

    logical_rebuttal: str = Field(
        default="",
        description="Weaknesses in the argument's reasoning, assumptions, or logic, and why it's vulnerable.",
    )
    evidence_rebuttal: str = Field(
        default="",
        description="A fact-, research-, or statistic-based challenge to the argument. If no factual "
        "rebuttal exists, this should state that clearly rather than inventing one.",
    )
    ethical_counterargument: str = Field(
        default="",
        description="A challenge based on moral assumptions, fairness, societal impact, or ethical principles.",
    )
    practical_counterargument: str = Field(
        default="",
        description="A challenge based on feasibility, implementation, cost, real-world limitations, "
        "or unintended consequences.",
    )
    policy_counterargument: str = Field(
        default="",
        description="A challenge based on regulatory, precedent, or systemic/institutional consequences — "
        "distinct from practical feasibility; focused on what a policy or rule change would mean at scale.",
    )
    challenge_questions: list[str] = Field(
        default_factory=list,
        description="3-5 respectful, thought-provoking questions that push the speaker to defend or "
        "clarify their argument.",
    )
    strategy_suggestions: list[str] = Field(
        default_factory=list,
        description="Concise, actionable coaching suggestions — e.g. strengthen evidence, improve "
        "rebuttal, clarify assumptions, anticipate objections, improve persuasiveness.",
    )


SYSTEM_PROMPT = """You are an experienced, impartial debate coach generating counterarguments to help \
a learner stress-test their position. You will be given the learner's argument, the debate topic, and \
the position they are arguing.

Produce counterarguments across five categories:
- Logical rebuttal: identify weaknesses in the argument's reasoning, assumptions, or internal logic.
- Evidence-based rebuttal: challenge the argument using facts, research, statistics, or expert opinion.
  If no genuine factual rebuttal exists for this argument, say so plainly instead of inventing one.
- Ethical counterargument: challenge moral assumptions, fairness, societal impact, or ethical principles,
  using balanced reasoning — not a one-sided moral judgment.
- Practical counterargument: discuss feasibility, implementation, cost, real-world limitations, or
  unintended consequences.
- Policy counterargument: challenge regulatory, precedent, or systemic/institutional consequences —
  distinct from practical feasibility; focus on what a policy or rule change would mean at scale.

Also generate:
- 3 to 5 challenge questions that expose weak assumptions and encourage deeper reasoning, phrased
  respectfully — never as an attack.
- A short list of actionable debate strategy suggestions for the learner (e.g. strengthen evidence,
  improve rebuttal, clarify assumptions, anticipate opponent objections, improve persuasiveness).

Rules:
- Remain objective and avoid political bias — critique the argument's structure and support, not the
  speaker's character or personal beliefs.
- Never invent facts, statistics, studies, or expert names that weren't given to you. If you don't have
  a real evidence-based rebuttal, state that clearly in evidence_rebuttal rather than fabricating one.
- Be concise and substantive — no filler, no repeating the argument back verbatim.
- Challenge respectfully. This is coaching, not a personal attack.
"""

_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        (
            "human",
            "Debate topic: {debate_topic}\n"
            "The speaker's position: {user_position}\n\n"
            "The speaker's argument to counter:\n{user_argument}",
        ),
    ]
)


def _get_llm() -> ChatGroq:
    """Build a ChatGroq client for counterargument generation, raising early if the API key is missing."""
    if not settings.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to backend/.env before calling the counterargument generation service."
        )
    return ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0.3,
    )


def generate_counterarguments(
    user_argument: str,
    debate_topic: str,
    user_position: str,
) -> CounterargumentResult:
    """Generate structured, multi-category counterarguments, challenge questions, and debate
    strategy suggestions for a single argument, using a structured-output LLM call."""
    if not user_argument or not user_argument.strip():
        raise ValueError("user_argument cannot be empty or whitespace only.")
    if not debate_topic or not debate_topic.strip():
        raise ValueError("debate_topic cannot be empty or whitespace only.")
    if not user_position or not user_position.strip():
        raise ValueError("user_position cannot be empty or whitespace only.")

    llm = _get_llm()
    structured_llm = llm.with_structured_output(CounterargumentResult)
    chain = _prompt | structured_llm
    result: CounterargumentResult = chain.invoke(
        {
            "user_argument": user_argument,
            "debate_topic": debate_topic,
            "user_position": user_position,
        }
    )
    return result