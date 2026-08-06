"""agents/chatbot_engine.py

The Main LangGraph Chatbot Router (Milestone 2 + Milestone 3).

Merges pacing analysis, Agent 1 (the Auditor), Argument Scoring, and Agent 2
(the Opponent) into a single LangGraph state machine. One user turn = one
graph run through all four stages. Milestone 3 adds difficulty level and a
structured, categorized rebuttal from the Opponent.
"""

import math
from typing import List, Optional, TypedDict

from langgraph.graph import StateGraph, END

from schemas.fallacy import FallacyReport
from schemas.scoring import ArgumentScore
from schemas.rebuttal import OpponentRebuttal
from services.fallacy_agent import analyze_argument
from services.opponent_agent import generate_opponent_reply
from services.scoring_agent import score_argument


class DebateTurnState(TypedDict):
    topic: str
    debate_format: str
    position: str
    difficulty: str
    history: List[dict]
    user_text: str
    duration_seconds: Optional[float]
    fallacy_report: Optional[FallacyReport]
    argument_score: Optional[ArgumentScore]
    opponent_rebuttal: Optional[OpponentRebuttal]
    words_per_minute: Optional[int]
    pace_status: Optional[str]


def _pacing_node(state: DebateTurnState) -> DebateTurnState:
    duration = state.get("duration_seconds")
    if not duration or duration <= 0:
        return {**state, "words_per_minute": None, "pace_status": None}

    word_count = len(state["user_text"].split())
    wpm = math.ceil(word_count / (duration / 60.0))
    if wpm > 160:
        pace = "Too Fast"
    elif wpm < 110:
        pace = "Too Slow"
    else:
        pace = "Optimal"

    return {**state, "words_per_minute": wpm, "pace_status": pace}


def _audit_node(state: DebateTurnState) -> DebateTurnState:
    report = analyze_argument(state["user_text"])
    return {**state, "fallacy_report": report}


def _scoring_node(state: DebateTurnState) -> DebateTurnState:
    score = score_argument(state["user_text"])
    return {**state, "argument_score": score}


def _opponent_node(state: DebateTurnState) -> DebateTurnState:
    rebuttal = generate_opponent_reply(
        topic=state["topic"],
        debate_format=state["debate_format"],
        position=state["position"],
        history=state["history"],
        user_message=state["user_text"],
        fallacy_report=state["fallacy_report"],
        difficulty=state.get("difficulty", "Advanced"),
    )
    return {**state, "opponent_rebuttal": rebuttal}


_graph = None


def _build_graph():
    graph = StateGraph(DebateTurnState)
    graph.add_node("pacing", _pacing_node)
    graph.add_node("auditor", _audit_node)
    graph.add_node("scorer", _scoring_node)
    graph.add_node("opponent", _opponent_node)
    graph.set_entry_point("pacing")
    graph.add_edge("pacing", "auditor")
    graph.add_edge("auditor", "scorer")
    graph.add_edge("scorer", "opponent")
    graph.add_edge("opponent", END)
    return graph.compile()


def _get_graph():
    global _graph
    if _graph is None:
        _graph = _build_graph()
    return _graph


def run_debate_turn(
    topic: str,
    debate_format: str,
    position: str,
    history: List[dict],
    user_text: str,
    duration_seconds: Optional[float] = None,
    difficulty: str = "Advanced",
) -> DebateTurnState:
    """Runs one full turn (pacing -> Auditor -> Scorer -> Opponent) through the merged graph."""
    graph = _get_graph()
    initial_state: DebateTurnState = {
        "topic": topic,
        "debate_format": debate_format,
        "position": position,
        "difficulty": difficulty,
        "history": history,
        "user_text": user_text,
        "duration_seconds": duration_seconds,
        "fallacy_report": None,
        "argument_score": None,
        "opponent_rebuttal": None,
        "words_per_minute": None,
        "pace_status": None,
    }
    return graph.invoke(initial_state)