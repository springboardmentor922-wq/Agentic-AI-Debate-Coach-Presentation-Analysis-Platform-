"""
Personalized Learning Plan generator (Module 10/11, Milestone 3 Part 8).
Generates a 4-week plan from a debater's real weaknesses/fallacy history —
never a static template — via the LLM provider fallback chain
(app/services/llm_provider.py). Falls back to a generic-but-still-useful
foundational plan only if every configured provider is unavailable.
"""
import logging

from app.schemas.debate_simulation import LearningPlan, LearningPlanWeek
from app.services.llm_provider import get_structured_result, AllProvidersUnavailableError

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a debate & communication skills curriculum designer.
Given a learner's real recorded weaknesses, recurring logical fallacies,
and presentation weak points, design a 4-week personalized learning plan.

Rules:
- Exactly 4 weeks, numbered 1-4, each with one clear `focus` area
- Each week has 2-4 concrete `tasks` (specific drills/exercises, not vague advice)
- Sequence weeks so foundational issues are addressed before advanced ones
- `summary`: 1-2 sentences on why this sequence was chosen for this specific learner
- Base every week directly on the evidence provided — if evidence is sparse,
  default to general foundational debate skills rather than inventing
  issues the learner doesn't have."""


def _fallback_plan() -> LearningPlan:
    return LearningPlan(
        weeks=[
            LearningPlanWeek(week=1, focus="Foundations", tasks=[
                "Practice stating a clear main claim before adding supporting points.",
                "Record a 2-minute argument and identify your strongest piece of evidence.",
            ]),
            LearningPlanWeek(week=2, focus="Evidence & Support", tasks=[
                "Add one concrete source or example to each claim you make.",
                "Practice distinguishing evidence from opinion in a sample argument.",
            ]),
            LearningPlanWeek(week=3, focus="Logical Reasoning", tasks=[
                "Review common logical fallacies and spot them in a news article.",
                "Rewrite one of your past arguments to remove a logical gap.",
            ]),
            LearningPlanWeek(week=4, focus="Delivery & Persuasion", tasks=[
                "Practice pacing at 130-160 words per minute.",
                "Reduce filler words in a recorded 2-minute speech.",
            ]),
        ],
        summary=(
            "This is a general foundational plan — personalized recommendations were "
            "temporarily unavailable, so this defaults to broadly useful debate skills."
        ),
    )


async def generate_learning_plan(evidence: dict) -> LearningPlan:
    try:
        return await get_structured_result(
            system_prompt=SYSTEM_PROMPT,
            human_prompt="Learner evidence (JSON):\n{evidence}",
            variables={"evidence": evidence},
            output_schema=LearningPlan,
            temperature=0.3,
        )
    except AllProvidersUnavailableError:
        logger.warning("generate_learning_plan: all LLM providers unavailable, using generic fallback plan")
        return _fallback_plan()
    except Exception:
        logger.exception("generate_learning_plan: unexpected error, using generic fallback plan")
        return _fallback_plan()
