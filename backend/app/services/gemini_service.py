import json
import re

from google import genai

from app.config.config import GEMINI_API_KEY


client = genai.Client(
    api_key=GEMINI_API_KEY
)


# =========================================
# EVALUATE DEBATE
# =========================================

def evaluate_debate(
    topic: str,
    argument: str
):

    prompt = f"""
You are an Expert AI Debate Coach
and Public Speaking Mentor.

Analyze the student's debate carefully.

Debate Topic:
{topic}

Student Argument:
{argument}

Return ONLY valid JSON.

The JSON must contain exactly these
main keys:

grammar
logic
confidence
relevance
strengths
weaknesses
coach_tips
counter_arguments
logical_fallacies
rebuttals
opening_statement
closing_statement
improved_argument
real_world_examples
statistics
ai_insights
feedback


IMPORTANT SCORING RULES:

grammar, logic, confidence and relevance
must each contain:

- score
- percentage
- remark


VERY IMPORTANT:

Each score MUST be an integer from 0 to 10.

Valid examples:

score: 7
percentage: 70

score: 9
percentage: 90

score: 10
percentage: 100


INVALID examples:

score: 11
score: 15
score: 20
score: 100

NEVER give a score greater than 10.


The percentage MUST correspond to the score:

0 = 0%
1 = 10%
2 = 20%
3 = 30%
4 = 40%
5 = 50%
6 = 60%
7 = 70%
8 = 80%
9 = 90%
10 = 100%


Do NOT calculate an overall score.

The application will calculate the
overall score itself.


Other requirements:

strengths must be a list.

weaknesses must be a list.

coach_tips must be a list.

rebuttals must be a list.

real_world_examples must be a list.

statistics must be a list.


counter_arguments must be a list of objects.

Each object must contain:

- title
- argument


logical_fallacies must be a list of objects.

Each object must contain:

- fallacy
- description
- how_to_fix


ai_insights must contain:

- argument_strength
- critical_thinking
- persuasiveness
- communication
- evidence_usage
- speech_clarity
- overall_comment


feedback must be a string.


Do not return markdown.

Do not explain anything.

Return JSON only.
"""


    # =========================================
    # GEMINI REQUEST
    # =========================================

    response = client.models.generate_content(

        model="gemini-flash-latest",

        contents=prompt
    )


    text = response.text.strip()


    # =========================================
    # REMOVE MARKDOWN
    # =========================================

    if text.startswith("```json"):

        text = (
            text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

    elif text.startswith("```"):

        text = (
            text
            .replace("```", "")
            .strip()
        )


    # =========================================
    # PARSE JSON
    # =========================================

    return json.loads(text)


# =========================================
# GENERATE TEXT
# =========================================

def generate_text(prompt: str):

    try:

        response = client.models.generate_content(

            model="gemini-flash-latest",

            contents=prompt
        )


        text = response.text.strip()


        # Remove markdown formatting

        text = text.replace(
            "**",
            ""
        )

        text = text.replace(
            "*",
            ""
        )

        text = text.replace(
            "##",
            ""
        )

        text = text.replace(
            "#",
            ""
        )

        text = text.replace(
            "```",
            ""
        )


        # Remove bullet points

        text = re.sub(
            r"^\s*[-•]\s*",
            "",
            text,
            flags=re.MULTILINE
        )


        # Remove numbered lists

        text = re.sub(
            r"^\s*\d+\.\s*",
            "",
            text,
            flags=re.MULTILINE
        )


        # Collapse extra blank lines

        text = re.sub(
            r"\n{2,}",
            "\n\n",
            text
        )


        return text.strip()


    except Exception as e:

        print(
            "\n===== GEMINI CHAT FAILED ====="
        )

        print(e)


        return (
            "I'm currently running in "
            "offline mode because the AI "
            "service is temporarily unavailable."
        )