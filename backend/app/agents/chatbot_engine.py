"""
Agent 2: The Opponent.

Handles Module 6 (Counterargument Generation) and Module 8 (AI Debate Simulation)
for Milestone 2. One core orchestration function reads `debate_format` from the
request payload and dynamically changes prompt behavior/routing - it does not
fork into separate routers per format (per the PDF's execution note).
"""

import logging

from app.services.llm_provider import get_text_result, AllProvidersUnavailableError
from app.services import deterministic_analysis as det

logger = logging.getLogger(__name__)

FORMAT_RULES = {
    "one_on_one": "Respond as a single respectful opposing debater in a casual 1-on-1 debate.",
    "public_forum": "Respond as a Public Forum opponent, focusing on concise, persuasive counterpoints.",
    "oxford": "Respond as the Oxford-style opposition, formally opposing the motion with structured data.",
    "parliamentary": (
        "Respond as an AI Opposition Leader in a Parliamentary debate. "
        "Use formal political terminology such as 'The Honorable Member'."
    ),
    "policy": "Respond as a Policy Debate opponent, focusing on plan flaws, counter-plans, and impact calculus.",
    "ai_simulation": "Respond as a general AI debate simulation opponent, adapting to the user's tone.",
    "popularity": (
        "Respond as the opposing side in a Popularity Debate, where an audience vote decides the winner. "
        "Prioritize persuasive, relatable, audience-friendly language over dense technical argument, and "
        "keep rebuttals punchy and quotable."
    ),
    "group_debate": (
        "Respond as one voice among several opposing team members in a group debate. "
        "Keep your turn focused on a single point so other 'teammates' would have room to add more, "
        "and reference that you're building on your side's case as a team."
    ),
}

# Milestone 3, Part 5 — AI Opponent personalities. Each personality maps to a
# distinct prompt behavior, not just a label: it changes argument complexity,
# rebuttal density, and whether cross-examination/fallacy-calling is used.
PERSONALITY_RULES = {
    "beginner": (
        "Personality: Beginner opponent. Use simple, accessible logic with a single main point per turn. "
        "Offer only 1 light rebuttal, avoid technical jargon, and keep a friendly, encouraging tone so the "
        "human debater isn't overwhelmed."
    ),
    "intermediate": (
        "Personality: Intermediate opponent. Offer 1-2 solid rebuttals with a mix of logic and everyday "
        "examples. Push back on weak points but don't chain multiple attacks in one turn."
    ),
    "advanced": (
        "Personality: Advanced opponent. Use strong evidence-style claims, layered logical attacks, and end "
        "your turn with a pointed counter-question that forces the human debater to defend a specific claim."
    ),
    "expert": (
        "Personality: Expert opponent. Debate at a professional/championship level: apply critical reasoning, "
        "proactively flag any fallacy you notice in the human's argument by name, and include a brief "
        "cross-examination question that probes the weakest link in their case. Be rigorous but respectful."
    ),
}


def _personality_instruction(ai_personality: str | None) -> str:
    return PERSONALITY_RULES.get((ai_personality or "intermediate").lower(), PERSONALITY_RULES["intermediate"])


async def generate_opponent_rebuttal(
    topic: str,
    debate_format: str,
    user_text: str,
    fallacy_flag: dict | None = None,
    ai_personality: str | None = None,
) -> str:
    """Generate the AI opponent's next turn, dynamically routed by debate_format and ai_personality.

    Falls back through the configured LLM provider chain, and finally to a
    deterministic, template-based rebuttal that still reacts to the user's
    actual claims and any detected fallacy, so a debate can never stall out
    on an empty/placeholder opponent turn.
    """

    format_instruction = FORMAT_RULES.get(debate_format, FORMAT_RULES["one_on_one"])
    personality_instruction = _personality_instruction(ai_personality)

    fallacy_note = ""
    if fallacy_flag and fallacy_flag.get("fallacy_detected"):
        fallacy_note = (
            f"\nNote: the user's last turn contained a '{fallacy_flag.get('fallacy_type')}' "
            "logical fallacy. Politely call it out as part of your rebuttal, then continue "
            "to address the substance of their argument."
        )

    system_prompt = (
        "You are an AI debate opponent inside a debate-coaching platform.\n"
        f"Debate topic: {topic}\n"
        f"{format_instruction}\n"
        f"{personality_instruction}\n"
        "Keep your rebuttal focused, respectful, and under 120 words."
        f"{fallacy_note}"
    )

    try:
        return await get_text_result(
            system_prompt=system_prompt,
            human_prompt="{user_text}",
            variables={"user_text": user_text},
            temperature=0.4,
        )
    except AllProvidersUnavailableError:
        logger.warning("generate_opponent_rebuttal: all LLM providers unavailable, using deterministic fallback")
        return det.generate_opponent_rebuttal_deterministic(
            topic=topic,
            debate_format=debate_format,
            user_text=user_text,
            fallacy_flag=fallacy_flag,
            ai_personality=ai_personality,
        )
    except Exception:
        logger.exception("generate_opponent_rebuttal: unexpected error, using deterministic fallback")
        return det.generate_opponent_rebuttal_deterministic(
            topic=topic,
            debate_format=debate_format,
            user_text=user_text,
            fallacy_flag=fallacy_flag,
            ai_personality=ai_personality,
        )
