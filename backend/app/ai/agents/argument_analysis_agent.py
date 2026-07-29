"""
Argument Analysis Agent

Purpose:
    Coordinates the complete argument analysis workflow by connecting
    the prompt, language model, and response schema.

Responsibilities:
    - Load the Argument Analysis prompt.
    - Invoke the configured LLM.
    - Generate structured argument analysis.
    - Validate the AI response using the schema.

Note:
    This module does not contain business logic or API endpoints.
    It focuses only on AI orchestration.
"""

from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm
from app.ai.prompts.argument_analysis_prompt import (
    ARGUMENT_ANALYSIS_SYSTEM_PROMPT,
)
from app.ai.schemas.argument_analysis_schema import (
    ArgumentAnalysisResponse,
)


class ArgumentAnalysisAgent:
    """
    AI Agent responsible for performing argument analysis.
    """

    def __init__(self):
        """
        Initialize the prompt pipeline.
        """

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    ARGUMENT_ANALYSIS_SYSTEM_PROMPT,
                ),
                (
                    "human",
                    "{argument}",
                ),
            ]
        )

        self.chain = (
            self.prompt
            | llm.with_structured_output(ArgumentAnalysisResponse)
        )

    def analyze_argument(
        self,
        argument: str,
    ) -> ArgumentAnalysisResponse:
        """
        Analyze a user's debate argument.

        Args:
            argument:
                User's debate argument.

        Returns:
            Structured ArgumentAnalysisResponse.
        """

        return self.chain.invoke(
            {
                "argument": argument,
            }
        )