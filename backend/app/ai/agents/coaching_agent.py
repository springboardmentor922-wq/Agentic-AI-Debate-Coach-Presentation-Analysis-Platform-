from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm
from app.ai.schemas.milestone3_schema import CoachingResponse
class CoachingAgent:
    def __init__(self): self.chain = ChatPromptTemplate.from_messages([("system", "You are a debate coach. Give actionable feedback and rewrite examples. Return structured output."), ("human", "Argument: {argument}\nScore: {score}\nJudge rationale: {rationale}")]) | llm.with_structured_output(CoachingResponse)
    def coach(self, **kwargs): return self.chain.invoke(kwargs)
