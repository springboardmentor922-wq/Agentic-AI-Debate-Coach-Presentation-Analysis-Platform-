"""Typed state shared only inside the LangGraph debate workflow."""
from typing import Any, TypedDict

class DebateGraphState(TypedDict, total=False):
    session_id: int
    user_id: int | None
    argument: str
    debate_format: str
    difficulty: str
    user_position: str
    current_round: int
    input_type: str
    media_filename: str | None
    context: dict[str, Any]
    memory: dict[str, Any]
    argument_analysis: Any
    logical_fallacy_analysis: Any
    evidence: list[Any]
    counterargument: Any
    ai_debate_opponent: Any
    judge_categories: Any
    performance: Any
    coaching: Any
    recommendations: Any
    learning_path: Any
    progress_updated: bool
    observability: dict[str, Any]
    errors: list[str]
