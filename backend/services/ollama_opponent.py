import os
import requests

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def generate_ai_response(topic, transcript):

    prompt = f"""
You are an expert debate opponent.

Topic:
{topic}

Student Argument:
{transcript}

Give ONE short counter argument.

Rules:
- maximum 2 sentences
- maximum 40 words
- direct response only
"""
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}]
            }
        )

        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        print("GROQ OPPONENT ERROR:", str(e))
        return "That's an interesting point, but we must consider alternative perspectives."