from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm

from app.ai.prompts.presentation_prompt import (
    PRESENTATION_SYSTEM_PROMPT,
)

from app.ai.schemas.presentation_schema import (
    PresentationResponse,
)


class PresentationAgent:

    def __init__(self):

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    PRESENTATION_SYSTEM_PROMPT,
                ),
                (
                    "human",
                    "{presentation}",
                ),
            ]
        )

        self.chain = (
            self.prompt
            | llm.with_structured_output(
                PresentationResponse
            )
        )

    def analyze_presentation(
        self,
        presentation: str,
    ):

        return self.chain.invoke(
            {
                "presentation": presentation,
            }
        )