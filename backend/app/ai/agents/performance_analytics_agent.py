"""
Performance Analytics Agent

Purpose:
    Analyzes user or class performance metrics, skill trends, score historical data, and progress trajectory.
"""

from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm


class PerformanceAnalyticsAgent:
    """
    AI Agent responsible for evaluating skill scores, debate history, and performance trends.
    """

    def __init__(self):
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    (
                        "You are the Performance Analytics Agent in an AI Debate Coach platform. "
                        "Review performance metrics, historical scores across Communication, Logical Reasoning, "
                        "Argument Quality, and Confidence. Highlight key growth trends, strong skills, and primary risk areas."
                    ),
                ),
                (
                    "human",
                    "Database Metrics & User Query: {analytics_context}",
                ),
            ]
        )
        self.chain = self.prompt | llm

    def analyze_performance(self, analytics_context: str) -> str:
        """
        Analyze performance data.
        """
        response = self.chain.invoke({"analytics_context": analytics_context})
        return response.content if hasattr(response, "content") else str(response)
