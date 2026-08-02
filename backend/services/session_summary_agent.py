"""Session-level debate feedback report (Milestone 2/4: Generate debate feedback reports).

Aggregates all of a user's turns in a completed session and asks the LLM for
a holistic closing assessment -- short, punchy coaching remarks, not essay-
style paragraphs. Runs on Groq's free tier.
"""

from langchain_groq import ChatGroq

from schemas.session_summary import SessionSummary

SYSTEM_PROMPT = """You are a debate coach giving quick, punchy end-of-session
notes to a debater -- like a coach's clipboard, not an essay.

You will be given the debate topic, format, the position they argued, and
aggregate statistics from their turns.

STRICT STYLE RULES:
- overall_assessment: ONE short sentence, max 20 words. No fluff, no "the
  debater demonstrated." Talk TO them directly ("You..." not "The debater...").
- strengths: 2-3 items, each a SHORT phrase (under 10 words), not a full
  sentence. E.g. "Strong topic relevance" not "You demonstrated excellent
  relevance to the topic throughout."
- areas_to_improve: 2-3 items, each a SHORT phrase (under 10 words). E.g.
  "Needs more concrete evidence" not a full explanatory sentence.
- suggested_next_steps: 2-3 items, each a SHORT actionable phrase (under 12
  words). E.g. "Practice citing one stat per argument."

Be specific to the actual numbers given, not generic. Never write a full
paragraph anywhere -- everything must be short and scannable, like sticky
notes, not a report.
"""

_llm = None


def _get_structured_llm():
    global _llm
    if _llm is None:
        base = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3)
        _llm = base.with_structured_output(SessionSummary)
    return _llm


def generate_session_summary(topic: str, debate_format: str, position: str, stats: dict) -> SessionSummary:
    user_content = (
        f"Topic: {topic}\n"
        f"Format: {debate_format}\n"
        f"Position argued: {position}\n"
        f"Turns taken: {stats['turns_count']}\n"
        f"Average overall score: {stats['avg_overall']}\n"
        f"Average clarity: {stats['avg_clarity']}\n"
        f"Average relevance: {stats['avg_relevance']}\n"
        f"Average evidence strength: {stats['avg_evidence']}\n"
        f"Average logical consistency: {stats['avg_consistency']}\n"
        f"Average persuasiveness: {stats['avg_persuasiveness']}\n"
        f"Logical fallacies committed: {stats['fallacy_count']}\n"
    )
    llm = _get_structured_llm()
    result = llm.invoke(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ]
    )
    if isinstance(result, SessionSummary):
        return result
    return SessionSummary(**result)