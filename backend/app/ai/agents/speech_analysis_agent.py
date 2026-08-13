"""
Speech Analysis Agent

Purpose:
    Evaluates spoken debate delivery, clarity, pacing, tone, and vocal structure.
"""

from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm


class SpeechAnalysisAgent:
    """
    AI Agent responsible for evaluating speech delivery and clarity.
    """

    def __init__(self):
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    (
                        "You are the Speech Analysis Agent in an AI Debate Coach platform. "
                        "Analyze speaking content for clarity, pacing, tone, structure, vocal emphasis, "
                        "and practical delivery improvements. Keep your analysis constructive and concise."
                    ),
                ),
                (
                    "human",
                    "Context & User Speech / Query: {speech_content}",
                ),
            ]
        )
        self.chain = self.prompt | llm

    def analyze_speech(self, speech_content: str) -> str:
        """
        Analyze speech delivery.
        """
        response = self.chain.invoke({"speech_content": speech_content})
        return response.content if hasattr(response, "content") else str(response)
