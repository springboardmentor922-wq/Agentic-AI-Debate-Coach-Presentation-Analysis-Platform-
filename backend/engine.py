import json
from core.gemini_client import generate_response
from services.fallacy_detector import FallacyDetector
from services.argument_scorer import ArgumentScorer
from services.coaching_feedback import CoachingFeedback

class DebateEngine:

    def __init__(self):

        self.format_registry = {
            "One-on-One Debate": "Keep responses short, direct, and rapidly dismantle the user's points.",
            "Oxford Debate": "You are strictly opposing the motion. Use high-level data and highly formal logic.",
            "Parliamentary Debate": "You are the Leader of the Opposition. You MUST address the user as 'The Honorable Member'.",
            "Policy Debate": "Focus heavily on implementation details, legalities, costs, and systemic harms.",
            "Public Forum": "Use persuasive, common-sense reasoning. Avoid dense technical jargon.",
            "AI Debate Simulation": "Act as a rival, but include a 2-sentence helpful coaching tip at the very end of your response."
        }

        self.level_registry = {
            "Beginner": "Use simple vocabulary and provide gentle feedback.",
            "Intermediate": "Challenge the learner with stronger reasoning.",
            "Advanced": "Provide strong counterarguments and strict evaluation."
        }
        self.fallacy_detector = FallacyDetector()
        self.argument_scorer = ArgumentScorer()
        self.coaching_feedback = CoachingFeedback()

    def analyze_argument(self, argument: str):

        words = argument.split()

        return {
            "word_count": len(words),
            "character_count": len(argument),
            "is_long_argument": len(words) >= 20
        }

    def get_prompt(self, debate_format: str):

        return self.format_registry.get(
            debate_format,
            "Standard debate mode."
        )

    def get_level_instruction(self, experience_level: str):

        return self.level_registry.get(
            experience_level,
            "Standard learner."
        )

    def generate_ai_response(
        self,
        experience_level: str,
        debate_format: str,
        topic: str,
        user_argument: str
    ):

        format_instruction = self.get_prompt(debate_format)

        level_instruction = self.get_level_instruction(
            experience_level
        )

        prompt = f"""
You are an expert AI Debate Coach.

Debate Format:
{format_instruction}

Learner Level:
{level_instruction}

Topic:
{topic}

User's Argument:
{user_argument}

Instructions:
1. Generate a strong counterargument.
2. Be respectful.
3. Keep the response suitable for the learner's level.
4. End with one coaching tip.
"""
        return generate_response(prompt)

    def detect_fallacy(self, argument: str):

        return self.fallacy_detector.detect(argument)
    def score_argument(self, topic: str, argument: str):

        response = self.argument_scorer.score(topic, argument)

        try:
            return json.loads(response)

        except Exception:
            return {
                "logic_score": 0,
                "clarity_score": 0,
                "evidence_score": 0,
                "persuasiveness_score": 0,
                "relevance_score": 0,
                "confidence_score": 0,
                "overall_score": 0
            }
    def generate_coaching_feedback(self, topic: str, argument: str):

        response = self.coaching_feedback.generate(topic, argument)

        try:
            data = json.loads(response)

            data.setdefault("strengths", [])

            data.setdefault("areas_to_improve", [])

            data.setdefault("next_challenge", "")

            data.setdefault(
                "speaking_tips",
                [
                    "Maintain eye contact with your audience.",
                    "Speak slowly and clearly.",
                    "Support your claims with facts and examples.",
                    "Avoid absolute words like 'always' and 'never'."
                ]
            )

            return data

        except Exception:

            return {
                "strengths": [],
                "areas_to_improve": [],
                "next_challenge": "",
                "speaking_tips": [
                    "Maintain eye contact with your audience.",
                    "Speak slowly and clearly.",
                    "Support your claims with facts and examples.",
                    "Avoid absolute words like 'always' and 'never'."
                ]
            }