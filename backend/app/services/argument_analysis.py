from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.schemas.argument_analysis import ArgumentAnalysisResult

SYSTEM_PROMPT = """You are an elite debate coach and argument analyst. Your job is to read a \
single piece of debate/argument text and break it down into its underlying logical structure.

Extract the following components:
- Claim: the main point or assertion the speaker is making.
- Secondary claims: any additional claims beyond the primary one — empty list if none.
- Evidence: a list of facts, examples, statistics, or supporting reasons used to support the claim.
- Assumptions: hidden or implied assumptions that must hold true for the argument to be valid.
- Counterarguments: any opposing points the speaker acknowledges or addresses — empty list if none.
- Reasoning: an explanation of how the evidence connects to and supports the claim.
- Reasoning quality: one of "valid", "weak", "unsupported_assumptions", or "inconsistent".
- Conclusion: the final takeaway or conclusion reached by the speaker.
- Argument strength: a 0-10 score with a one-sentence reason, weighing evidence quality, completeness, \
coherence, and logical flow.
- Evaluation: score relevance (does it stay on-topic) and persuasiveness (how convincing it is), each \
0-10 with brief feedback.

Rules:
- Be objective — never invent information that isn't present or clearly implied in the text.
- Only extract information explicitly stated or logically implied by the argument as given.
- If a section is missing or cannot be determined (for example, no explicit evidence is given),
  return an empty list for list fields, an empty string for text fields, or null for optional
  nested objects — do not hallucinate content to fill a gap.
- Keep every field concise and high-quality; do not pad with filler or repeat the input verbatim.
"""

_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        ("human", "Analyze this debate statement:\n\n{text}"),
    ]
)


def _get_llm() -> ChatGroq:
    """Build a ChatGroq client for argument analysis, raising early if the API key is missing."""
    if not settings.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to backend/.env before calling the argument analysis service."
        )
    return ChatGroq(
        model=settings.GROQ_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0,
    )


def analyze_argument(text: str) -> ArgumentAnalysisResult:
    """Extract the claim, evidence, assumptions, reasoning, conclusion, strength assessment,
    and relevance/persuasiveness evaluation from a single piece of debate argument text using
    a structured-output LLM call."""
    llm = _get_llm()
    structured_llm = llm.with_structured_output(ArgumentAnalysisResult)
    chain = _prompt | structured_llm
    result: ArgumentAnalysisResult = chain.invoke({"text": text})
    return result