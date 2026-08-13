from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.schemas.scoring import ArgumentScore

SYSTEM_PROMPT = """You are an impartial debate adjudicator. Score the learner's most recent \
speech turn against the four criteria below, each on a 0-10 scale. Be fair but rigorous — \
most solid turns should land in the 5-8 range; reserve 9-10 for exceptional clarity and rigor, \
and use low scores when a turn is genuinely weak, evasive, or fallacious.

- clarity: was the point easy to follow and precisely stated?
- evidence_strength: did they support claims with reasoning or evidence, not just assertion?
- rebuttal_quality: if there was a prior opponent point, did they directly engage with it?
- logical_consistency: is the reasoning internally sound, free of fallacies or contradictions?

Give one short, constructive sentence of feedback in overall_note — specific and actionable, \
never generic praise or generic criticism.
"""

_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        (
            "human",
            "Opponent's prior point (if any): {opponent_text}\n\n"
            "{format_note}\n\n"
            "Learner's turn to score:\n{user_text}",
        ),
    ]
)

FORMAT_SCORING_NOTES: dict[str, str] = {
    "policy": "This is a Policy debate — weigh evidence_strength and logical_consistency slightly "
    "more heavily; concrete data and cost-benefit reasoning matter most here.",
    "oxford": "This is an Oxford debate — weigh clarity and rebuttal_quality slightly more heavily; "
    "formal structure and direct engagement matter most here.",
    "public_forum": "This is a Public Forum debate — weigh clarity slightly more heavily; accessible, "
    "persuasive communication matters most here.",
}


def score_argument(user_text: str, opponent_text: str = "", debate_format: str | None = None) -> ArgumentScore:
    llm = ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, temperature=0)
    structured_llm = llm.with_structured_output(ArgumentScore)
    chain = _prompt | structured_llm
    format_note = FORMAT_SCORING_NOTES.get(debate_format, "")
    return chain.invoke(
        {
            "user_text": user_text,
            "opponent_text": opponent_text or "(This is the opening turn.)",
            "format_note": format_note,
        }
    )