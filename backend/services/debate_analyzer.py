import os
import requests
import json

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def analyze_debate(topic, transcript):

    prompt = f"""
You are an expert debate coach.

Analyze the student's debate speech.

Topic:
{topic}

Student Speech:
{transcript}

Return ONLY valid JSON.

Required format:

{{
    "confidence": 0,
    "fluency": 0,
    "communication": 0,
    "argument_strength": 0,
    "fallacies": [],
    "suggestions": []
}}

Rules:
- confidence score between 0 and 10
- fluency score between 0 and 10
- argument_strength score between 0 and 10
- fallacies must be an array
- suggestions must be an array
- do not return explanations
- do not return markdown
- do not return ```json
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
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            },
            timeout=120
        )

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        print("GROQ RAW RESPONSE:")
        print(content)

        analysis = json.loads(content)

        return {
            "confidence": analysis.get("confidence", 5),
            "fluency": analysis.get("fluency", 5),
            "communication": analysis.get("communication", 5),
            "argument_strength": analysis.get("argument_strength", 5),
            "fallacies": analysis.get("fallacies", []),
            "suggestions": analysis.get("suggestions", [])
        }
    except Exception as e:

        print("ANALYSIS ERROR:")
        print(str(e))

        return {
            "confidence": 5,
            "fluency": 5,
            "argument_strength": 5,
            "fallacies": [
                "Unable to detect"
            ],
            "suggestions": []
        }