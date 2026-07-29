"""
AI Analysis Service

Purpose:
    Provides the business logic for AI-powered debate analysis.

Responsibilities:
    - Perform argument analysis.
    - Perform logical fallacy detection.
    - Orchestrate multiple AI agents.
    - Return structured AI analysis results.

Note:
    This service acts as the bridge between the API layer
    and the AI agents.
"""

from app.ai.agents.argument_analysis_agent import ArgumentAnalysisAgent
from app.ai.agents.fallacy_detection_agent import FallacyDetectionAgent

from app.ai.schemas.argument_analysis_schema import (
    ArgumentAnalysisResponse,
)
from app.ai.schemas.fallacy_detection_schema import (
    FallacyDetectionResponse,
)


class AIAnalysisService:
    """
    Service responsible for AI-powered debate analysis.
    """

    def __init__(self):
        """
        Initialize AI agents.
        """

        self.argument_analysis_agent = ArgumentAnalysisAgent()
        self.fallacy_detection_agent = FallacyDetectionAgent()

    def analyze_argument(
        self,
        argument: str,
    ) -> ArgumentAnalysisResponse:
        """
        Perform argument analysis.

        Args:
            argument:
                User's debate argument.

        Returns:
            Structured argument analysis.
        """

        return self.argument_analysis_agent.analyze_argument(argument)

    def detect_fallacies(
        self,
        argument: str,
    ) -> FallacyDetectionResponse:
        """
        Detect logical fallacies.

        Args:
            argument:
                User's debate argument.

        Returns:
            Structured logical fallacy analysis.
        """

        return self.fallacy_detection_agent.detect_fallacies(argument)


# Singleton service instance
ai_analysis_service = AIAnalysisService()