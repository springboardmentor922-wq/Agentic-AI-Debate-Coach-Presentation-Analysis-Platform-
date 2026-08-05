from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm
from app.ai.schemas.milestone3_schema import AIDebateOpponentResponse

class AIDebateOpponentAgent:
    def __init__(self):
        self.chain = ChatPromptTemplate.from_messages([("system", "You are the AI Debate Opponent Agent. Respond as a disciplined opponent; respect the chosen format, user position, difficulty, and compact memory. Return structured output."), ("human", "Argument: {argument}\nCounterargument: {counterargument}\nFormat: {debate_format}\nDifficulty: {difficulty}\nUser position: {user_position}\nMemory: {memory}")]) | llm.with_structured_output(AIDebateOpponentResponse)
    def respond(self, **kwargs) -> AIDebateOpponentResponse:
        return self.chain.invoke(kwargs)
