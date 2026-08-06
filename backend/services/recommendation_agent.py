"""Recommendation & Coaching Engine (Milestone 3, Step 4).

Looks at a learner's FULL debate history (not just one session) and produces
a standing, personalized coaching recommendation: a focus area, an insight
explaining the pattern, and concrete drills/topics to practice.

Handles cold-start: if the learner has no scored debates yet, no AI call is
made -- a friendly onboarding default is returned instead, since the agent
has nothing to reason about yet.

Runs on Groq's free tier.
"""

from schemas.recommendation import CoachingRecommendation
from langchain_groq import ChatGroq

SYSTEM_PROMPT = """You are a debate coach building a standing, personalized
recommendation for a learner based on their historical performance stats
across ALL of their past debates (not just one session).

You will be given average scores per criterion, how many debates they've
done, and their most frequently committed logical fallacy (if any).

Identify the SINGLE weakest area and focus the recommendation there. Keep
insight to one short sentence, grounded in the actual numbers given -- not
generic advice. recommended_drills should be short, concrete, actionable
phrases (under 12 words each). recommended_topics should be real debate
topics well suited to practicing that specific weak area.
"""

_llm = None


def _get_structured_llm():
    global _llm
    if _llm is None:
        base = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3)
        _llm = base.with_structured_output(CoachingRecommendation)
    return _llm


def _cold_start_recommendation() -> CoachingRecommendation:
    """Fallback for brand-new learners with no scored debate history yet."""
    return CoachingRecommendation(
        focus_area="Getting Started",
        insight="You haven't completed a scored debate yet -- start one to unlock personalized coaching.",
        recommended_drills=[
            "Complete your first debate session",
            "Try both a One-on-One and an Oxford format",
        ],
        recommended_topics=[
            "Should AI tools be allowed in classroom debate preparation?",
            "Is remote work better than office work?",
        ],
    )


def generate_recommendation(stats: dict) -> CoachingRecommendation:
    if stats.get("turns_count", 0) == 0:
        return _cold_start_recommendation()

    user_content = (
        f"Total scored turns: {stats['turns_count']}\n"
        f"Average overall score: {stats['avg_overall']}\n"
        f"Average clarity: {stats['avg_clarity']}\n"
        f"Average relevance: {stats['avg_relevance']}\n"
        f"Average evidence strength: {stats['avg_evidence']}\n"
        f"Average logical consistency: {stats['avg_consistency']}\n"
        f"Average persuasiveness: {stats['avg_persuasiveness']}\n"
        f"Most common fallacy committed: {stats.get('most_common_fallacy') or 'None'}\n"
    )
    llm = _get_structured_llm()
    result = llm.invoke(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ]
    )
    if isinstance(result, CoachingRecommendation):
        return result
    return CoachingRecommendation(**result)