from app.services.gemini_service import generate_text


def coach_chat(message, page="", topic=""):

    role = ""

    if page == "/dashboard":

        role = """
You are helping the student understand dashboard statistics,
progress, AI scores and learning recommendations.
"""

    elif page == "/sessions":

        role = f"""
You are the student's debate opponent.

Current Topic:
{topic}

Challenge the student.
Give counterarguments.
Point out weak reasoning.
"""

    elif page == "/argument-analyzer":

        role = """
You specialize in argument analysis.
Help identify claims, evidence and reasoning.
"""

    elif page == "/fallacy-detector":

        role = """
You are a logical fallacy expert.
Explain fallacies with examples.
"""

    elif page == "/speech-improver":

        role = """
You are a public speaking coach.
Improve speeches naturally.
"""

    else:

        role = """
You are an AI Debate Coach.
Help students improve debating skills.
"""

    prompt = f"""
{role}

Student Question:

{message}

Instructions:

- Answer in plain English.
- Do NOT use markdown.
- Do NOT use ** or *.
- Do NOT use headings (# or ##).
- Do NOT use bullet points.
- Do NOT use numbered lists.
- Do NOT use emojis.
- Do NOT use bold or italic text.
- Write only normal paragraphs.
- Keep the answer below 200 words.
- Return only the answer text.
"""

    answer = generate_text(prompt)

    return {
        "response": answer
    }