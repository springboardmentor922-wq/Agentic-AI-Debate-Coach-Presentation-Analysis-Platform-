from app.services.ai.gemini_service import GeminiService
from app.schemas.argument_analysis import ArgumentAnalysis
import re


class ArgumentEngine:

    def __init__(self):

        self.gemini = GeminiService()

        self.format_registry = {

            "One-on-One Debate":
                "Keep responses short, direct, and aggressively dismantle the user's argument.",

            "Oxford Debate":
                "You are strictly opposing the motion. Use formal language, evidence, statistics and structured reasoning.",

            "Parliamentary Debate":
                "Address the user as 'The Honorable Member'. Use parliamentary language and formal rebuttals.",

            "Policy Debate":
                "Focus on implementation, economics, law, feasibility, policy impacts and systemic consequences.",

            "Public Forum":
                "Use persuasive, audience-friendly language. Avoid overly technical explanations.",

            "AI Debate Simulation":
                "Behave like a realistic human debate opponent. End with exactly two coaching tips."
        }

    async def analyze_argument(

        self,
        argument,
        debate_format="One-on-One Debate",
        history="",
        position="For"

    ):

        style = self.format_registry.get(
            debate_format,
            "Act as an elite debate opponent."
        )

        stance = (
            "Oppose the user's argument."
            if position == "For"
            else "Support the user's argument."
        )

        prompt = f"""

You are an Expert AI Debate Coach.

Debate Format:

{debate_format}

Style Instructions:

{style}

Previous Debate:

{history}

User Position:

{position}

AI Role:

{stance}

Current User Argument:

{argument}

Analyze and respond using EXACTLY this format.

Main Claim:
Supporting Evidence:
Strengths:
Weaknesses:
Overall Analysis:
Fallacies:
Counterargument:
Opponent Response:
Feedback:

"""

        response = await self.gemini.generate(prompt)

        text = response.strip()

        def extract(section):

            pattern = rf"{section}:\s*(.*?)(?=\n[A-Za-z ]+:|$)"

            match = re.search(
                pattern,
                text,
                re.DOTALL
            )

            return match.group(1).strip() if match else ""

        return ArgumentAnalysis(

            main_claim=extract("Main Claim"),

            supporting_evidence=extract("Supporting Evidence"),

            strengths=[
                x.strip("-• ").strip()
                for x in extract("Strengths").split("\n")
                if x.strip()
            ],

            weaknesses=[
                x.strip("-• ").strip()
                for x in extract("Weaknesses").split("\n")
                if x.strip()
            ],

            overall_analysis=extract("Overall Analysis"),

            fallacies=extract("Fallacies"),

            counterargument=extract("Counterargument"),

            opponent_response=extract("Opponent Response"),

            feedback=extract("Feedback")

        )