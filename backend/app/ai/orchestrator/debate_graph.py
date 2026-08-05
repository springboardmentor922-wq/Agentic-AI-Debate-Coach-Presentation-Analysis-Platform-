"""The sole orchestration path for Milestone 3 AI debate execution."""
from datetime import datetime, timezone
from time import perf_counter
from langgraph.graph import END, START, StateGraph
from app.ai.orchestrator.graph_state import DebateGraphState
from app.ai.orchestrator import graph_nodes as nodes
from app.ai.guardrails.validators import validate_debate_input

class DebateOrchestrator:
    def __init__(self):
        graph = StateGraph(DebateGraphState)
        for name, function in (("load_context", nodes.load_context), ("load_memory", nodes.load_memory), ("argument_analysis", nodes.argument_analysis), ("logical_fallacy_detection", nodes.fallacy_detection), ("counterargument_generation", nodes.counterargument_generation), ("ai_debate_opponent", nodes.ai_debate_opponent), ("performance_scoring", nodes.performance_scoring), ("coaching", nodes.coaching), ("recommendations", nodes.recommendations), ("learning_path", nodes.learning_path), ("progress_update", nodes.progress_update), ("persist_results", nodes.persist_results)):
            graph.add_node(name, function)
        graph.add_edge(START, "load_context")
        sequence = ["load_context", "load_memory", "argument_analysis", "logical_fallacy_detection", "counterargument_generation", "ai_debate_opponent", "performance_scoring", "coaching", "recommendations", "learning_path", "progress_update", "persist_results"]
        for source, target in zip(sequence, sequence[1:]): graph.add_edge(source, target)
        graph.add_edge("persist_results", END)
        self.graph = graph.compile()
    def invoke(self, *, session_id: int, argument: str, user_id: int | None = None, debate_format: str = "One-on-One", difficulty: str = "Intermediate", user_position: str = "Affirmative", current_round: int = 1, input_type: str = "text", media_filename: str | None = None) -> dict:
        return self.graph.invoke({"session_id": session_id, "user_id": user_id, "argument": validate_debate_input(argument), "debate_format": debate_format, "difficulty": difficulty, "user_position": user_position, "current_round": current_round, "input_type": input_type, "media_filename": media_filename, "errors": [], "observability": {"started_at": datetime.now(timezone.utc).isoformat(), "timer": perf_counter()}})

debate_orchestrator = DebateOrchestrator()
