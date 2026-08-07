"""
Coaching Plans (Milestone 4, Part of Feedback & Coaching). Distinct from the
Personalized Learning Plan (services/learning_plan_service.py): a Coaching
Plan is a real trackable entity — weekly exercises with deadlines,
measurable objectives, and completion status — automatically generated from
a learner's AI analysis evidence AND, whenever available, their coach's or
educator's actual review notes / recommended exercises. Follows the same
LLM-provider-with-deterministic-fallback pattern as the rest of the AI
workflows in this codebase so it can never 500 or return empty content.
"""
import logging

from app.schemas.debate_simulation import CoachingPlan, CoachingPlanWeek, CoachingPlanExercise
from app.services.llm_provider import get_structured_result, AllProvidersUnavailableError

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert debate & communication skills coach designing a
personalized, trackable 4-week coaching plan.

You will be given real evidence about one learner: their AI-analyzed argument
scores, recurring fallacies, presentation/speech metrics, AND — if present —
notes and recommended exercises a human Debate Coach or Educator already gave
them after reviewing their debate.

Rules:
- Exactly 4 weeks, numbered 1-4
- Each week has: `focus` (one area), `objective` (ONE specific, measurable,
  verifiable objective — e.g. "Cut filler-word rate below 3% in your next
  recorded session", not vague advice like "improve fluency"), and 2-4
  `exercises` (title + one-sentence description)
- If human coach/educator notes or recommended_exercises are present in the
  evidence, you MUST fold them directly into the relevant week's exercises
  instead of inventing unrelated ones — this plan should feel like it
  actually incorporates what the human reviewer said
- `objectives`: 2-4 measurable objectives for the plan as a whole
- `summary`: 1-2 sentences on why this sequence was chosen, referencing the
  AI evidence and, if present, the human review notes
- Base everything on the evidence given — if evidence is sparse, default to
  general foundational debate/communication skills rather than inventing
  issues the learner doesn't have."""


def _deterministic_plan(evidence: dict) -> CoachingPlan:
    """Fallback used only if every LLM provider is unavailable. Still reads
    the real evidence dict — including any human review notes — rather than
    returning generic filler."""
    coach_notes = evidence.get("coach_notes") or {}
    recommended_exercises = coach_notes.get("recommended_exercises") or []
    review_notes = coach_notes.get("recommended_learning_plan_notes") or coach_notes.get("coach_comments")

    def week_exercises(base: list[str], extra: list[str] | None = None) -> list[CoachingPlanExercise]:
        items = [CoachingPlanExercise(title=t, description="") for t in base]
        for t in extra or []:
            items.append(CoachingPlanExercise(title=t, description="Recommended by your coach/educator review."))
        return items

    weeks = [
        CoachingPlanWeek(
            week=1,
            focus="Foundations",
            objective="State a clear main claim before adding supporting points in every practice turn this week.",
            exercises=week_exercises(
                ["Record a 2-minute argument and identify your strongest piece of evidence."],
                recommended_exercises[:1],
            ),
        ),
        CoachingPlanWeek(
            week=2,
            focus="Evidence & Support",
            objective="Add at least one concrete source or example to every claim you make this week.",
            exercises=week_exercises(
                ["Practice distinguishing evidence from opinion in a sample argument."],
                recommended_exercises[1:2],
            ),
        ),
        CoachingPlanWeek(
            week=3,
            focus="Logical Reasoning",
            objective="Identify and correct at least one logical gap in a past argument of yours.",
            exercises=week_exercises(
                ["Review common logical fallacies and spot them in a news article."],
                recommended_exercises[2:3],
            ),
        ),
        CoachingPlanWeek(
            week=4,
            focus="Delivery & Persuasion",
            objective="Deliver a 2-minute recorded speech at 130-160 words per minute with fewer filler words than last time.",
            exercises=week_exercises(
                ["Practice pacing and reduce filler words in a recorded 2-minute speech."],
                recommended_exercises[3:4],
            ),
        ),
    ]

    summary = (
        "This is a general foundational plan — personalized recommendations were "
        "temporarily unavailable, so this defaults to broadly useful debate skills."
    )
    if review_notes:
        summary = f"Built around your coach/educator's note: \"{review_notes[:140]}\" plus your recent evidence."

    return CoachingPlan(
        weeks=weeks,
        objectives=[
            "Complete every week's exercises on time.",
            "Show a measurable score improvement in your next AI-analyzed session.",
        ],
        summary=summary,
    )


async def generate_coaching_plan(evidence: dict) -> CoachingPlan:
    try:
        return await get_structured_result(
            system_prompt=SYSTEM_PROMPT,
            human_prompt="Learner evidence, including any human review notes (JSON):\n{evidence}",
            variables={"evidence": evidence},
            output_schema=CoachingPlan,
            temperature=0.3,
        )
    except AllProvidersUnavailableError:
        logger.warning("generate_coaching_plan: all LLM providers unavailable, using deterministic fallback")
        return _deterministic_plan(evidence)
    except Exception:
        logger.exception("generate_coaching_plan: unexpected error, using deterministic fallback")
        return _deterministic_plan(evidence)
