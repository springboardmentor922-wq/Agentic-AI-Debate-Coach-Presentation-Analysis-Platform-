from langchain_groq import ChatGroq
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.config import settings

SYSTEM_PROMPT = """You are the Podium AI Assistant — a helpful, knowledgeable companion for debate \
and public speaking practice. You can explain debate concepts and formats, help brainstorm arguments \
and counterarguments, clarify logical fallacies, help draft or refine an opening statement, summarize \
or translate text, and answer general questions clearly and concisely.

Be direct, substantive, and conversational. Use markdown formatting (lists, bold, code blocks) where \
it genuinely helps readability. Keep responses focused — avoid padding with filler."""


def _get_llm() -> ChatGroq:
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set. Add it to backend/.env before using the chat assistant.")
    return ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY, temperature=0.7)


def get_assistant_reply(conversation_history: list[dict], new_message: str) -> str:
    """conversation_history: list of {"role": "user"|"assistant", "content": str}, oldest first.
    Reuses LangChain's message types the same way debate_graph.py does for the AI opponent."""
    llm = _get_llm()
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    for turn in conversation_history:
        if turn["role"] == "user":
            messages.append(HumanMessage(content=turn["content"]))
        else:
            messages.append(AIMessage(content=turn["content"]))
    messages.append(HumanMessage(content=new_message))

    response = llm.invoke(messages)
    return response.content