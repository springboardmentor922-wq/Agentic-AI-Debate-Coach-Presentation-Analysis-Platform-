"""
Counterargument Agent

Generates strong rebuttals to a user's argument.
"""

from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm

from app.ai.prompts.counterargument_prompt import (
    COUNTERARGUMENT_SYSTEM_PROMPT,
)

from app.ai.schemas.counterargument_schema import (
    CounterargumentResponse,
)


class CounterargumentAgent:

    def __init__(self):

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    COUNTERARGUMENT_SYSTEM_PROMPT,
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
                CounterargumentResponse
            )
        )

    def generate_counterargument(
        self,
        argument: str,
    ) -> CounterargumentResponse:

        return self.chain.invoke(
            {
                "argument": argument,
            }
        )

        