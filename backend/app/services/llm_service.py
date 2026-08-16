import json
import re

from google import genai
from google.genai.errors import ServerError
import traceback
from ..core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_text(prompt):
    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        traceback.print_exc()
        return f"ERROR: {e}"


def generate_json(prompt):
    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
    )

    text = response.text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    # Gemini occasionally adds a short explanation around otherwise valid JSON.
    # Extract the object so the API continues returning a reliable structured
    # result instead of failing an entire learner session.
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("The AI response did not contain a JSON object.")

    return json.loads(text[start:end + 1])
