"""
Report Generation Agent

Purpose:
    Synthesizes debate evaluations, evidence ratings, and fallacy reports into structured coaching insights.
"""

from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm


class ReportGenerationAgent:
    """
    AI Agent responsible for report analysis and score breakdown synthesis.
    """

    def __init__(self):
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    (
                        "You are the Report Generation & Analysis Agent in an AI Debate Coach platform. "
                        "Synthesize report evaluation scores (Overall, Argument, Logic, Evidence, Communication), "
                        "detected logical fallacies, and judge feedback into actionable learning summaries."
                    ),
                ),
                (
                    "human",
                    "Report Data & User Query: {report_context}",
                ),
            ]
        )
        self.chain = self.prompt | llm

    def analyze_report(self, report_context: str) -> str:
        """
        Analyze report details.
        """
        response = self.chain.invoke({"report_context": report_context})
        return response.content if hasattr(response, "content") else str(response)
