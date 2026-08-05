from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm
from app.ai.schemas.milestone3_schema import RecommendationResponse
class RecommendationAgent:
    def __init__(self): self.chain = ChatPromptTemplate.from_messages([("system", "Recommend concrete debate practice appropriate to the learner. Return structured output."), ("human", "Score: {score}\nWeaknesses: {weaknesses}\nProfile: {profile}")]) | llm.with_structured_output(RecommendationResponse)
    def recommend(self, **kwargs): return self.chain.invoke(kwargs)
