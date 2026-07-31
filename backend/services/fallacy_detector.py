from core.gemini_client import generate_response


class FallacyDetector:

    def detect(self, argument: str):

        prompt = f"""
You are an expert in logical reasoning.

Analyze the following argument and identify whether it contains any logical fallacies.

Argument:
{argument}

If a fallacy exists, provide:

1. Fallacy Name
2. Explanation
3. Suggestion for improvement

If there is NO fallacy, respond:

Fallacy:
None

Explanation:
The argument is logically sound.

Suggestion:
Continue strengthening your argument with evidence.

Return ONLY plain text in this exact format:

Fallacy:
...

Explanation:
...

Suggestion:
...
"""

        return generate_response(prompt)