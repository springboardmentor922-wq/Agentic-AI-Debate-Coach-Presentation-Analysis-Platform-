from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm.llm import llm
from app.ai.schemas.milestone3_schema import AIDebateOpponentResponse

class AIDebateOpponentAgent:
    def __init__(self):
        self.chain = ChatPromptTemplate.from_messages([
            ("system", (
                "You are the AI Debate Opponent Agent. "
                "Act as a formidable, highly disciplined debate opponent opposing the user's position ({user_position}). "
                "Directly dissect and attack the specific claims, premises, and evidence in the user's argument ({argument}). "
                "Provide a direct counterargument, challenge unbacked claims, and pose a sharp rebuttal question for the next round. "
                "Respect the debate format ({debate_format}), difficulty level ({difficulty}), and conversation memory."
            )),
            ("human", (
                "Learner Argument: {argument}\n"
                "Key Counterargument Points: {counterargument}\n"
                "Format: {debate_format}\n"
                "Difficulty: {difficulty}\n"
                "Learner Position: {user_position}\n"
                "Conversation Memory: {memory}"
            ))
        ]) | llm.with_structured_output(AIDebateOpponentResponse)

    def respond(self, **kwargs) -> AIDebateOpponentResponse:
        return self.chain.invoke(kwargs)
