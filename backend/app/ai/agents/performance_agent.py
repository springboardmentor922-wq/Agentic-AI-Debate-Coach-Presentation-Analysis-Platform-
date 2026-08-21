"""
Performance Analytics Agent
"""

from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm

from app.ai.prompts.performance_prompt import (
    PERFORMANCE_SYSTEM_PROMPT,
)

from app.ai.schemas.performance_schema import (
    PerformanceResponse,
)


class PerformanceAgent:

    def __init__(self):

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    PERFORMANCE_SYSTEM_PROMPT,
                ),
                (
                    "human",
                    "{performance}",
                ),
            ]
        )

        self.chain = (
            self.prompt
            | llm.with_structured_output(
                PerformanceResponse
            )
        )

    def analyze_performance(
        self,
        performance: str,
    ) -> PerformanceResponse:

        return self.chain.invoke(
            {
                "performance": performance,
            }
        )