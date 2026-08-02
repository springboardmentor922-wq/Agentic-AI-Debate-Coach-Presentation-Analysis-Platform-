"""Agent 1: The Auditor.

Analyzes a single debate statement and returns a structured FallacyReport.
Temperature is pinned to 0.0 so the same input reliably produces the same
verdict -- this agent is meant to act as an objective, repeatable referee,
not a creative writer.

Runs on Groq's free-tier API (OpenAI-compatible via LangChain), so no paid
OpenAI credits are required.
"""

from langchain_groq import ChatGroq

from schemas.fallacy import FallacyReport

SYSTEM_PROMPT = """You are an elite debate coach and logical fallacy adjudicator.

Analyze the debate statement you are given. Decide whether it contains a
logical fallacy. If it does, identify exactly which one from this list:
Ad Hominem, Straw Man, False Dilemma, Slippery Slope, Appeal to Authority,
Circular Reasoning, Hasty Generalization, Red Herring.

Rules:
- Only flag a fallacy if it is clearly present. Do not invent one.
- offending_text must be an exact quote from the statement.
- explanation should be one or two plain-language sentences a student can
  understand -- name the pattern, don't just restate the sentence.
- correction_suggestion should show how to make the same point without the
  flawed reasoning.
- If there is no fallacy, set fallacy_detected to false and leave the other
  fields null.
"""

_llm = None


def _get_structured_llm():
    global _llm
    if _llm is None:
        base = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.0)
        _llm = base.with_structured_output(FallacyReport)
    return _llm


def analyze_argument(text: str) -> FallacyReport:
    """Runs the Auditor agent on a single debate statement."""
    llm = _get_structured_llm()
    result = llm.invoke(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ]
    )
    if isinstance(result, FallacyReport):
        return result
    return FallacyReport(**result)