"""
LLM Configuration

Purpose:
    Initializes and configures the Large Language Model (LLM) used by the
    AI Debate Coach. This module provides a reusable LangChain Ollama
    client that can be shared across AI agents.

Responsibilities:
    - Configure the Ollama connection.
    - Initialize the Llama 3.1 model.
    - Define model inference parameters.
    - Export a reusable LLM instance.

Note:
    This module only initializes the language model.
    It does not perform argument analysis or prompt generation.
"""

from langchain_ollama import ChatOllama

from app.core.config import settings


llm = ChatOllama(
    model=settings.OLLAMA_MODEL,
    base_url=settings.OLLAMA_BASE_URL,
    temperature=settings.LLM_TEMPERATURE,
    num_predict=settings.LLM_MAX_TOKENS,
)