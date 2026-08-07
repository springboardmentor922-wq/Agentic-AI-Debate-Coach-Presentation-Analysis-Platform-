"""
Agent 2: The Opponent.

Handles Module 6 (Counterargument Generation) and Module 8 (AI Debate Simulation)
for Milestone 2.
"""

import logging

from app.services.llm_provider import (
    get_text_result,
    AllProvidersUnavailableError,
)
from app.services import deterministic_analysis as det

logger = logging.getLogger(__name__)


FORMAT_RULES = {
    "one_on_one":
        "You are a respectful opposing debater.",

    "public_forum":
        "Debate in Public Forum style. Give concise persuasive rebuttals.",

    "oxford":
        "Debate in Oxford style with formal reasoning.",

    "parliamentary":
        "Debate as an Opposition Leader using formal parliamentary language.",

    "policy":
        "Debate in Policy style. Focus on counter-plans and impacts.",

    "ai_simulation":
        "Act as a realistic AI debate opponent.",

    "popularity":
        "Debate for a general audience using persuasive and relatable language.",

    "group_debate":
        "Respond as one member of the opposing team with one focused argument.",
}


PERSONALITY_RULES = {
    "beginner":
        "Simple, friendly, one main rebuttal.",

    "intermediate":
        "1-2 logical rebuttals with practical examples.",

    "advanced":
        "Strong logical attacks and finish with one counter-question.",

    "expert":
        "Professional debate. Identify logical weaknesses and ask one cross-examination question.",
}


def _personality_instruction(ai_personality: str | None) -> str:
    return PERSONALITY_RULES.get(
        (ai_personality or "intermediate").lower(),
        PERSONALITY_RULES["intermediate"],
    )


async def generate_opponent_rebuttal(
    topic: str,
    debate_format: str,
    user_text: str,
    fallacy_flag: dict | None = None,
    ai_personality: str | None = None,
) -> str:

    format_instruction = FORMAT_RULES.get(
        debate_format,
        FORMAT_RULES["one_on_one"],
    )

    personality_instruction = _personality_instruction(ai_personality)

    fallacy_note = ""

    if (
        fallacy_flag
        and fallacy_flag.get("fallacy_detected")
    ):
        fallacy_note = (
            f"The user's argument contains a "
            f"{fallacy_flag.get('fallacy_type')} fallacy. "
            "Mention it briefly."
        )

    system_prompt = f"""
You are an AI debate opponent.

Topic:
{topic}

Style:
{format_instruction}

Difficulty:
{personality_instruction}

Rules:
- Respond naturally.
- Give only one strong rebuttal.
- Keep under 90 words.
- End with one short question.
{fallacy_note}
"""

    try:
        return await get_text_result(
            system_prompt=system_prompt,
            human_prompt="{user_text}",
            variables={
                "user_text": user_text,
            },
            temperature=0.3,
        )

    except AllProvidersUnavailableError:
        logger.warning(
            "LLM unavailable. Using deterministic rebuttal."
        )

        return det.generate_opponent_rebuttal_deterministic(
            topic=topic,
            debate_format=debate_format,
            user_text=user_text,
            fallacy_flag=fallacy_flag,
            ai_personality=ai_personality,
        )

    except Exception:
        logger.exception(
            "Unexpected error. Using deterministic rebuttal."
        )

        return det.generate_opponent_rebuttal_deterministic(
            topic=topic,
            debate_format=debate_format,
            user_text=user_text,
            fallacy_flag=fallacy_flag,
            ai_personality=ai_personality,
        )