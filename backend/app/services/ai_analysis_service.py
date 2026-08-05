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

from app.ai.orchestrator.debate_graph import debate_orchestrator


class AIAnalysisService:
    """
    Service responsible for AI-powered debate analysis.
    """

    def analyze_with_workflow(self, *, session_id: int, argument: str, user_id: int | None = None, debate_format: str = "One-on-One", difficulty: str = "Intermediate", user_position: str = "Affirmative", current_round: int = 1) -> dict:
        """Backward-compatible adapter that delegates legacy analysis requests to LangGraph."""
        return debate_orchestrator.invoke(session_id=session_id, argument=argument, user_id=user_id, debate_format=debate_format, difficulty=difficulty, user_position=user_position, current_round=current_round)


# Singleton service instance
ai_analysis_service = AIAnalysisService()
