import json
import time

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

    if text.startswith("```json"):
        text = text.replace("```json", "")

    if text.endswith("```"):
        text = text[:-3]

    return json.loads(text.strip())