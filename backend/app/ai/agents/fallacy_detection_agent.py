"""
Logical Fallacy Detection Agent

Purpose:
    Coordinates the complete logical fallacy detection workflow by
    connecting the prompt, language model, and response schema.

Responsibilities:
    - Load the Logical Fallacy Detection prompt.
    - Invoke the configured LLM.
    - Generate structured logical fallacy analysis.
    - Validate the AI response using the schema.

Note:
    This module does not contain business logic or API endpoints.
    It focuses only on AI orchestration.
"""

from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm
from app.ai.prompts.fallacy_detection_prompt import (
    FALLACY_DETECTION_SYSTEM_PROMPT,
)
from app.ai.schemas.fallacy_detection_schema import (
    FallacyDetectionResponse,
)


class FallacyDetectionAgent:
    """
    AI Agent responsible for detecting logical fallacies
    in debate arguments.
    """

    def __init__(self):
        """
        Initialize the prompt pipeline.
        """

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    FALLACY_DETECTION_SYSTEM_PROMPT,
                ),
                (
                    "human",
                    "{argument}",
                ),
            ]
        )

        self.chain = (
            self.prompt
            | llm.with_structured_output(
                FallacyDetectionResponse
            )
        )

    def detect_fallacies(
        self,
        argument: str,
    ) -> FallacyDetectionResponse:
        """
        Detect logical fallacies in a user's debate argument.

        Args:
            argument:
                User's debate argument.

        Returns:
            Structured FallacyDetectionResponse.
        """

        return self.chain.invoke(
            {
                "argument": argument,
            }
        )