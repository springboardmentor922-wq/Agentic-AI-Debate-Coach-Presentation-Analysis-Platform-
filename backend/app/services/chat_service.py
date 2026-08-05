"""
Chat Service

Purpose:
    Coordinates page-aware chatbot responses for the platform.
"""

from typing import Any, List

from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm
from app.services.ai_analysis_service import ai_analysis_service
from app.schemas.chat import ChatAgentOutput, ChatHistoryItem, ChatRequest


class ChatService:
    def __init__(self):
        # Debate-specific analysis is delegated to the unified LangGraph
        # workflow through AIAnalysisService; chat never runs agents itself.
        pass

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
        chain = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{input}"),
            ]
        ) | llm

        response = chain.invoke({"input": user_prompt})
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
        context_prompt = self._build_context_prompt(request)

        if request.session_id is None or len(request.message.strip()) < 10:
            return self._build_default_outputs(request)

        workflow = ai_analysis_service.analyze_with_workflow(
            session_id=request.session_id,
            argument=request.message,
            user_id=request.user_id,
        )

        return [
            ChatAgentOutput(
                agent="Argument Analysis",
                content=workflow["argument_analysis"],
            ),
            ChatAgentOutput(
                agent="Counterargument",
                content=workflow["counterargument"],
            ),
            ChatAgentOutput(
                agent="Fallacy Detection",
                content=workflow["logical_fallacy_analysis"],
            ),
        ]

    def _build_presentation_outputs(
        self,
        request: ChatRequest,
    ) -> List[ChatAgentOutput]:
        context_prompt = self._build_context_prompt(request)

        speech_analysis = self._run_text_chain(
            system_prompt=(
                "You are the Speech Analysis Agent in an AI Debate Coach. "
                "Analyze the speaking content for clarity, pacing, tone, structure, "
                "and delivery improvements."
            ),
            user_prompt=context_prompt,
        )

        presentation_analysis = self._run_text_chain(
            system_prompt=(
                "You are the Presentation Analysis Agent in an AI Debate Coach. "
                "Evaluate presentation structure, audience engagement, visual flow, "
                "and speaker confidence."
            ),
            user_prompt=context_prompt,
        )

        return [
            ChatAgentOutput(
                agent="Speech Analysis",
                content=speech_analysis,
            ),
            ChatAgentOutput(
                agent="Presentation Analysis",
                content=presentation_analysis,
            ),
        ]

    def _build_dashboard_outputs(
        self,
        request: ChatRequest,
    ) -> List[ChatAgentOutput]:
        context_prompt = self._build_context_prompt(request)

        performance_analytics = self._run_text_chain(
            system_prompt=(
                "You are the Performance Analytics Agent in an AI Debate Coach. "
                "Review the user's activity and explain key strengths, trends, and risks."
            ),
            user_prompt=context_prompt,
        )

        recommendation = self._run_text_chain(
            system_prompt=(
                "You are the Recommendation Agent in an AI Debate Coach. "
                "Give the most relevant next actions, practice suggestions, and priorities."
            ),
            user_prompt=context_prompt,
        )

        return [
            ChatAgentOutput(
                agent="Performance Analytics",
                content=performance_analytics,
            ),
            ChatAgentOutput(
                agent="Recommendation",
                content=recommendation,
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
