from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm
from app.ai.schemas.milestone3_schema import LearningPathResponse
class LearningPathAgent:
    def __init__(self): self.chain = ChatPromptTemplate.from_messages([("system", "Create a progressive, personalized debate learning path. Return structured output."), ("human", "Profile: {profile}\nPrevious scores: {previous_scores}\nRecommendations: {recommendations}")]) | llm.with_structured_output(LearningPathResponse)
    def create(self, **kwargs): return self.chain.invoke(kwargs)
