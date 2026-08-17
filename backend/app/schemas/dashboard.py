from pydantic import BaseModel
from typing import List


class DashboardResponse(BaseModel):
    total_debates: int

    average_score: float
    highest_score: int
    lowest_score: int

    average_grammar: float
    average_logic: float
    average_confidence: float
    average_relevance: float

    grade: str


class HistoryItem(BaseModel):
    id: int

    topic: str

    overall_score: int

    created_at: str


class EvaluationDetail(BaseModel):
    id: int

    topic: str

    argument: str

    grammar_score: int

    logic_score: int

    confidence_score: int

    relevance_score: int

    overall_score: int

    feedback: str

    created_at: str