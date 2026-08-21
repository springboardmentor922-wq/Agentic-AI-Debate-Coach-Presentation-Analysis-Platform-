from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm

from app.ai.prompts.speech_prompt import (
    SPEECH_SYSTEM_PROMPT,
)

from app.ai.schemas.speech_schema import (
    SpeechResponse,
)


class SpeechAgent:

    def __init__(self):

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    SPEECH_SYSTEM_PROMPT,
                ),
                (
                    "human",
                    "{speech}",
                ),
            ]
        )

        self.chain = (
            self.prompt
            | llm.with_structured_output(
                SpeechResponse
            )
        )

    def analyze_speech(
        self,
        speech: str,
    ) -> SpeechResponse:

        return self.chain.invoke(
            {
                "speech": speech,
            }
        )