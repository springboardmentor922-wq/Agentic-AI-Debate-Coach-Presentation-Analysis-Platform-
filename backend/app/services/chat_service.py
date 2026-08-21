"""
Chat Service

Purpose:
    Coordinates page-aware chatbot responses for the platform.
"""

from typing import List

from app.ai.agents.argument_analysis_agent import ArgumentAnalysisAgent
from app.ai.agents.fallacy_detection_agent import FallacyDetectionAgent
from app.ai.agents.counterargument_agent import CounterargumentAgent
from app.ai.agents.performance_agent import PerformanceAgent
from app.ai.agents.recommendation_agent import RecommendationAgent
from app.ai.agents.presentation_agent import PresentationAgent
from app.ai.agents.speech_agent import SpeechAgent
#from app.ai.agents.report_agent import ReportAgent
from app.ai.llm.llm import llm
from app.schemas.chat import ChatAgentOutput, ChatHistoryItem, ChatRequest


class ChatService:
    def __init__(self):
        self.argument_analysis_agent = ArgumentAnalysisAgent()
        self.fallacy_detection_agent = FallacyDetectionAgent()

        self.counterargument_agent = CounterargumentAgent()
        self.performance_agent = PerformanceAgent()
        self.recommendation_agent = RecommendationAgent()
        self.presentation_agent = PresentationAgent()
        self.speech_agent = SpeechAgent()
        #self.report_agent = ReportAgent()

    def _history_text(self, history: List[ChatHistoryItem]) -> str:
        if not history:
            return "No prior conversation history."

        recent_history = history[-12:]
        lines = []

        for item in recent_history:
            content = item.content

            if isinstance(content, (dict, list)):
                content_text = str(content)
            else:
                content_text = str(content)

            lines.append(f"{item.role.upper()}: {content_text}")

        return "\n".join(lines)

    def _run_text_chain(self, system_prompt: str, user_prompt: str) -> str:
        """
        Sends a prompt directly to the configured LLM (Groq).
        """

        prompt = f"""
{system_prompt}

----------------------------------------
User Context
----------------------------------------

{user_prompt}

----------------------------------------
Instructions
----------------------------------------

Respond clearly, professionally, and concisely.
"""

        response = llm.invoke(prompt)

        return response.content

    def _build_context_prompt(self, request: ChatRequest) -> str:
        history_text = self._history_text(request.conversation_history)

        return (
            f"Page: {request.page}\n"
            f"Session ID: {request.session_id}\n"
            f"Topic ID: {request.topic_id}\n"
            f"User ID: {request.user_id}\n\n"
            f"Conversation History:\n{history_text}\n\n"
            f"Latest Message:\n{request.message}"
        )

    def _build_debate_outputs(self, request: ChatRequest) -> List[ChatAgentOutput]:
        #context_prompt = self._build_context_prompt(request)

        argument_analysis = self.argument_analysis_agent.analyze_argument(
            request.message
        )

        counterargument = self.counterargument_agent.generate_counterargument(
           request.message
        )

        fallacy_analysis = self.fallacy_detection_agent.detect_fallacies(
            request.message
        )

        return [
            ChatAgentOutput(
                agent="Argument Analysis",
                content=argument_analysis.model_dump(),
            ),
            ChatAgentOutput(
                agent="Counterargument",
                content=counterargument.model_dump(),
            ),
            ChatAgentOutput(
                agent="Fallacy Detection",
                content=fallacy_analysis.model_dump(),
            ),
        ]

    def _build_presentation_outputs(
        self,
        request: ChatRequest,
    ) -> List[ChatAgentOutput]:
        context_prompt = self._build_context_prompt(request)

        speech_analysis = self.speech_agent.analyze_speech(
            request.message
        )

        presentation_analysis = self.presentation_agent.analyze_presentation(
            request.message
        )

        return [
            ChatAgentOutput(
                agent="Speech Analysis",
                content=speech_analysis.model_dump(),
            ),
            ChatAgentOutput(
                agent="Presentation Analysis",
                content=presentation_analysis.model_dump(),
            ),
        ]

    def _build_dashboard_outputs(
        self,
        request: ChatRequest,
    ) -> List[ChatAgentOutput]:
        context_prompt = self._build_context_prompt(request)

        performance_analytics = self.performance_agent.analyze_performance(
            context_prompt
        )

        recommendation = self.recommendation_agent.generate_recommendations(
            context_prompt
        )

        return [
            ChatAgentOutput(
                agent="Performance Analytics",
                content=performance_analytics.model_dump(),
            ),
            ChatAgentOutput(
                agent="Recommendation",
                content=recommendation.model_dump(),
            ),
        ]

    def _build_default_outputs(
        self,
        request: ChatRequest,
    ) -> List[ChatAgentOutput]:
        context_prompt = self._build_context_prompt(request)

        response = self._run_text_chain(
            system_prompt=(
                "You are the AI Debate Coach. Respond like ChatGPT, using the current "
                "page and conversation history to provide the most helpful coaching answer."
            ),
            user_prompt=context_prompt,
        )

        return [
            ChatAgentOutput(
                agent="AI Debate Coach",
                content=response,
            )
        ]

    def chat(self, request: ChatRequest) -> List[ChatAgentOutput]:
        page = request.page.lower()

        if page.startswith("/debate-sessions") or page.startswith("/debate-room"):
            return self._build_debate_outputs(request)

        if page == "/ai-analysis-report":
            return self._build_presentation_outputs(request)

        if "/dashboard" in page:
            return self._build_dashboard_outputs(request)

        return self._build_default_outputs(request)


chat_service = ChatService()