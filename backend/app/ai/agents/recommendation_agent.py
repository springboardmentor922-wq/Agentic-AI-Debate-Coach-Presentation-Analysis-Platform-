"""
Recommendation Agent
"""

from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm

from app.ai.prompts.recommendation_prompt import (
    RECOMMENDATION_SYSTEM_PROMPT,
)

from app.ai.schemas.recommendation_schema import (
    RecommendationResponse,
)


class RecommendationAgent:

    def __init__(self):

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    RECOMMENDATION_SYSTEM_PROMPT,
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
                RecommendationResponse
            )
        )

    def generate_recommendations(
        self,
        performance: str,
    ) -> RecommendationResponse:

        return self.chain.invoke(
            {
                "performance": performance,
            }
        )