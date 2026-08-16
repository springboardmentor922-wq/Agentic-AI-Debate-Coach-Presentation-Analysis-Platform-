from .llm_service import generate_text
from ..prompts.learner_prompt import LEARNER_PROMPT
from ..prompts.coach_prompt import COACH_PROMPT
from ..prompts.educator_prompt import EDUCATOR_PROMPT
from ..prompts.admin_prompt import ADMIN_PROMPT


def chat_with_ai(message: str, role: str, page: str):

    prompt_map = {
        "Learner": LEARNER_PROMPT,
        "Coach": COACH_PROMPT,
        "Educator": EDUCATOR_PROMPT,
        "Admin": ADMIN_PROMPT,
    }

    system_role = prompt_map.get(
        role,
        "You are DebateAI, a helpful AI assistant."
    )

    prompt = f"""
{system_role}

Current Page:
{page}

User Question:
{message}

General Rules:

- Speak naturally like ChatGPT.
- Use simple English.
- Be conversational.
- Keep answers concise unless more detail is requested.
- End with a helpful follow-up question when appropriate.
"""

    return generate_text(prompt)