"""Maps each supported debate format to its AI opponent style guide.
Used by debate_graph.py to adapt the AI opponent's tone and structure per format."""

FORMAT_STYLE_GUIDES: dict[str, str] = {
    "one_on_one": (
        "Style: One-on-One Debate. Be conversational and direct. Rebut the opponent's "
        "latest point head-on. Keep responses moderate in length — natural back-and-forth, "
        "not a speech."
    ),
    "oxford": (
        "Style: Oxford Debate. Use formal language and a respectful tone. Open with a strong, "
        "clear statement of your position, structure your argument logically, and end each "
        "response with a clear concluding line."
    ),
    "parliamentary": (
        "Style: Parliamentary Debate (Government vs Opposition). Use formal debating language "
        "and persuasive rhetoric. Address multiple points where relevant, and explicitly refer "
        "back to earlier points made in the debate."
    ),
    "policy": (
        "Style: Policy Debate. Be evidence-driven and analytical. Focus on the practical policy "
        "implications, weigh costs against benefits, and structure your argument with clear "
        "logical steps."
    ),
    "public_forum": (
        "Style: Public Forum Debate. Be audience-friendly and easy to understand. Avoid technical "
        "jargon, use real-world examples, and prioritize persuasive, accessible communication "
        "over formal structure."
    ),
}

DEFAULT_FORMAT = "one_on_one"


def get_format_style(debate_format: str | None) -> str:
    """Return the style guide text for a debate format, falling back to One-on-One
    for unknown or missing formats — never raises."""
    return FORMAT_STYLE_GUIDES.get(debate_format or DEFAULT_FORMAT, FORMAT_STYLE_GUIDES[DEFAULT_FORMAT])


EXPERIENCE_LEVEL_GUIDES: dict[str, str] = {
    "beginner": (
        "The learner is a BEGINNER. Use simpler language, keep your rebuttals gentle and "
        "encouraging rather than aggressive, and occasionally include a brief educational aside "
        "explaining a debate concept. Argue as a moderately easy opponent — leave room for the "
        "learner to find and exploit gaps in your reasoning."
    ),
    "intermediate": (
        "The learner is INTERMEDIATE. Argue with balanced difficulty — moderate rebuttals, and "
        "push the learner to back their claims with stronger evidence, without overwhelming them."
    ),
    "advanced": (
        "The learner is ADVANCED. Be a strong, rigorous opponent. Use advanced logical challenges, "
        "layered arguments, and minimal hand-holding — do not soften your rebuttals or explain "
        "debate concepts unless directly asked."
    ),
}

DEFAULT_EXPERIENCE_LEVEL = "beginner"


def get_experience_style(experience_level: str | None) -> str:
    """Return the AI-opponent style guide for a learner's experience level, falling back
    to Beginner for unknown or missing values — never raises."""
    return EXPERIENCE_LEVEL_GUIDES.get(
        experience_level or DEFAULT_EXPERIENCE_LEVEL, EXPERIENCE_LEVEL_GUIDES[DEFAULT_EXPERIENCE_LEVEL]
    )