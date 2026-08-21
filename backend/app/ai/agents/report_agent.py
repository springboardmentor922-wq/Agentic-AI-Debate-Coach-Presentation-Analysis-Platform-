from langchain_core.prompts import ChatPromptTemplate

from app.ai.llm.llm import llm

from app.ai.prompts.report_prompt import (
    REPORT_SYSTEM_PROMPT,
)

from app.ai.schemas.report_schema import (
    ReportResponse,
)


class ReportAgent:

    def __init__(self):

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    REPORT_SYSTEM_PROMPT,
                ),
                (
                    "human",
                    "{report}",
                ),
            ]
        )

        self.chain = (
            self.prompt
            | llm.with_structured_output(
                ReportResponse
            )
        )

    def generate_report(
        self,
        report: str,
    ) -> ReportResponse:

        return self.chain.invoke(
            {
                "report": report,
            }
        )