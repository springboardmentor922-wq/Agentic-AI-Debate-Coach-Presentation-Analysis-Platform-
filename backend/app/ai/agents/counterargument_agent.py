from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm
from app.ai.schemas.milestone3_schema import CounterargumentResponse

class CounterargumentAgent:
    def __init__(self):
        self.chain = ChatPromptTemplate.from_messages([("system", "You are a debate counterargument specialist. Use only supplied evidence; do not invent citations. Return structured output."), ("human", "Argument: {argument}\nEvidence: {evidence}\nFormat: {debate_format}\nDifficulty: {difficulty}")]) | llm.with_structured_output(CounterargumentResponse)
    def generate(self, **kwargs) -> CounterargumentResponse:
        return self.chain.invoke(kwargs)
