"""
Presentation Analysis Agent

Purpose:
    Evaluates debate presentation structure, audience engagement, visual flow, and speaker confidence.
"""

from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm


class PresentationAnalysisAgent:
    """
    AI Agent responsible for presentation structure and audience engagement feedback.
    """

    def __init__(self):
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    (
                        "You are the Presentation Analysis Agent in an AI Debate Coach platform. "
                        "Evaluate presentation structure, audience engagement, persuasive flow, "
                        "slide/visual organization, and speaker confidence."
                    ),
                ),
                (
                    "human",
                    "Context & User Speech / Query: {presentation_content}",
                ),
            ]
        )
        self.chain = self.prompt | llm

    def analyze_presentation(self, presentation_content: str) -> str:
        """
        Analyze presentation structure and flow.
        """
        response = self.chain.invoke({"presentation_content": presentation_content})
        return response.content if hasattr(response, "content") else str(response)
