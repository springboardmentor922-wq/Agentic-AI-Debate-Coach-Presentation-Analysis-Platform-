from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings
from app.schemas.fallacy import FallacyReportSchema
from app.services.timing import timed_invoke


_referee_llm = ChatGoogleGenerativeAI(
    model=settings.REFEREE_MODEL,
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.0
)
_referee_agent = _referee_llm.with_structured_output(FallacyReportSchema)

_REFEREE_SYSTEM_PROMPT = """You are an elite, impartial debate adjudicator.
Analyze the user's argument for logical fallacies ONLY. Do not comment on
grammar, tone, or delivery.

Check specifically for these 8 fallacies:
- Ad Hominem: attacking the person instead of their argument.
- Straw Man: misrepresenting the opponent's position to make it easier to attack.
- False Dilemma: presenting only two options when more exist.
- Slippery Slope: claiming a small first step inevitably leads to an extreme outcome without justification.
- Appeal to Authority: treating a claim as true purely because an authority said it.
- Circular Reasoning: using the conclusion itself as a premise ("X is true because X is true").
- Hasty Generalization: drawing a broad conclusion from a small or unrepresentative sample.
- Red Herring: introducing an irrelevant point to distract from the actual argument.

If the argument is logically sound, set fallacy_detected to False and
fallacy_type to "None". Be conservative — only flag a fallacy when it is
clearly present, not merely because the argument is weak or unpopular.

{difficulty_note}"""

DIFFICULTY_STRICTNESS = {
    "Beginner": "Only flag fallacies that are blatant and unambiguous — give the learner the benefit of the doubt on borderline cases.",
    "Intermediate": "Flag fallacies that a competent debate judge would reasonably catch, including moderately subtle ones.",
    "Hard": "Be strict — flag subtle, borderline, and easily-missed fallacies too, the way an expert competitive judge would."
}

_referee_prompt = ChatPromptTemplate.from_messages([
    ("system", _REFEREE_SYSTEM_PROMPT),
    ("user", "{text}")
])
_referee_chain = _referee_prompt | _referee_agent


async def analyze_argument(text: str, difficulty: str = None, session_id: str = None) -> FallacyReportSchema:
    note = DIFFICULTY_STRICTNESS.get(difficulty, DIFFICULTY_STRICTNESS["Intermediate"])
    return await timed_invoke(
        _referee_chain, {"text": text, "difficulty_note": note},
        agent_name="Auditor (Fallacy Detection)", model=settings.REFEREE_MODEL, session_id=session_id
    )
