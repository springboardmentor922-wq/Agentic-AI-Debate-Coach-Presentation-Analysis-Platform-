from google import genai
from app.config.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


def chat_with_ai(topic, argument, question):

    prompt = f"""
You are an expert AI Debate Coach.

Debate Topic:
{topic}

Student Argument:
{argument}

Student Question:
{question}

Rules:
- Answer like a debate mentor.
- Keep answers concise.
- Suggest improvements when possible.
- If asked for rebuttals, provide strong rebuttals.
- If asked for counter arguments, provide balanced counter arguments.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text