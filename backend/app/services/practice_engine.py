"""
Practice Exercise Engine (Milestone 4, Part 9 of the spec).

Exercises are generated from a learner's real weaknesses and fallacy
history — via the same structured-output LLM pattern as
learning_plan_service.py — then persisted so completion can be tracked.
Difficulty is derived from the learner's real average score rather than
fixed, so it adapts automatically as performance changes.
"""
from datetime import datetime
import logging

from app.core.database import practice_exercises_collection, performance_scores_collection
from app.schemas.learning_hub import PracticeExerciseSet, PracticeExercise
from app.services.llm_provider import get_structured_result, AllProvidersUnavailableError

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a debate coach designing practice drills.
Given a learner's real recorded weaknesses, recurring logical fallacies, and
current skill level, generate 6 concrete practice exercises.

Rules:
- Draw exercise types from real debate pedagogy: e.g. Logical Fallacy
  Practice, Evidence Building, Quick Rebuttal, Case Building, Cross
  Examination, Opening Statement Practice, Closing Statement Practice,
  Argument Expansion, Counter Argument Practice — pick whichever best match
  the learner's actual weaknesses, don't force all of them in.
- Each exercise's `focus_area` must name the specific real weakness it
  targets — never generic filler.
- Set `difficulty` (Easy/Medium/Hard) based on the learner's stated skill
  level: lower average score -> more Easy/Medium exercises; higher ->
  more Medium/Hard.
- `instructions` must be concrete and actionable (a specific drill, not
  vague advice)."""


def _fallback_exercises(skill_level: str, evidence: dict) -> PracticeExerciseSet:
    """Deterministic fallback used only if every LLM provider is
    unavailable. Difficulty still adapts to the learner's real skill level
    string (computed from real scores in `_skill_level`), and focus areas
    still reference real weaknesses/fallacies passed in via `evidence` when
    available, so this never degrades into pure filler."""
    difficulty = "Easy" if "beginner" in skill_level else ("Hard" if "advanced" in skill_level else "Medium")
    weaknesses = evidence.get("weaknesses") or []
    fallacies = evidence.get("recent_fallacy_types") or evidence.get("fallacy_types") or []

    focus_1 = weaknesses[0] if weaknesses else "general evidence usage"
    focus_2 = f"avoiding {fallacies[0]}" if fallacies else "logical consistency"

    templates = [
        ("Evidence Building Drill", focus_1, "Take one of your recent claims and add two independent, specific sources or statistics to support it."),
        ("Quick Rebuttal Practice", "responding to counterarguments", "Record a 60-second rebuttal to the strongest counterargument you can think of for your last debate topic."),
        ("Logical Fallacy Spotting", focus_2, "Read a short news opinion piece and identify any logical fallacies present, then rewrite the flawed sentence."),
        ("Case Building Exercise", "argument structure", "Outline a full Claim -> Evidence -> Reasoning -> Impact case for a new debate topic of your choice."),
        ("Cross Examination Practice", "handling pointed questions", "Have a friend (or record yourself) ask 3 tough questions about your last argument and practice answering concisely."),
        ("Closing Statement Practice", "persuasive delivery", "Write and deliver a 90-second closing statement that summarizes your strongest 2 points without introducing new ones."),
    ]
    return PracticeExerciseSet(exercises=[
        PracticeExercise(title=t, focus_area=f, difficulty=difficulty, instructions=i)
        for t, f, i in templates
    ])


async def _skill_level(user_id: str) -> str:
    perf = [doc async for doc in performance_scores_collection.find({"user_id": user_id})]
    if not perf:
        return "beginner (no completed debates yet)"
    avg = sum(p["score"] for p in perf) / len(perf)
    if avg < 50:
        return f"beginner (average score {avg:.0f}/100)"
    if avg < 75:
        return f"intermediate (average score {avg:.0f}/100)"
    return f"advanced (average score {avg:.0f}/100)"


async def generate_practice_exercises(user_id: str, evidence: dict) -> list[dict]:
    skill_level = await _skill_level(user_id)
    try:
        result = await get_structured_result(
            system_prompt=SYSTEM_PROMPT,
            human_prompt="Skill level: {skill_level}\nEvidence (JSON): {evidence}",
            variables={"skill_level": skill_level, "evidence": evidence},
            output_schema=PracticeExerciseSet,
            temperature=0.4,
        )
    except AllProvidersUnavailableError:
        logger.warning("generate_practice_exercises: all LLM providers unavailable, using deterministic fallback")
        result = _fallback_exercises(skill_level, evidence)
    except Exception:
        logger.exception("generate_practice_exercises: unexpected error, using deterministic fallback")
        result = _fallback_exercises(skill_level, evidence)

    now = datetime.utcnow().isoformat()
    docs = []
    for ex in result.exercises:
        doc = {
            "user_id": user_id,
            "title": ex.title,
            "focus_area": ex.focus_area,
            "difficulty": ex.difficulty,
            "instructions": ex.instructions,
            "completed": False,
            "created_at": now,
        }
        docs.append(doc)
    if docs:
        insert_result = await practice_exercises_collection.insert_many(docs)
        for doc, _id in zip(docs, insert_result.inserted_ids):
            doc["id"] = str(_id)
    return docs


async def list_practice_exercises(user_id: str) -> list[dict]:
    cursor = practice_exercises_collection.find({"user_id": user_id}).sort("created_at", -1)
    out = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        out.append(doc)
    return out


async def mark_exercise_completed(user_id: str, exercise_id: str) -> dict | None:
    from bson import ObjectId
    from bson.errors import InvalidId
    try:
        oid = ObjectId(exercise_id)
    except InvalidId:
        return None
    doc = await practice_exercises_collection.find_one({"_id": oid})
    if not doc or doc["user_id"] != user_id:
        return None
    await practice_exercises_collection.update_one({"_id": oid}, {"$set": {"completed": True}})
    doc["completed"] = True
    doc["id"] = str(doc["_id"])
    return doc
