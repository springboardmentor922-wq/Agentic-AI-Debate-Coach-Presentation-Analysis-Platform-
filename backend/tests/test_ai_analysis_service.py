from app.ai.schemas.counterargument_schema import CounterargumentResponse
from app.services.ai_analysis_service import AIAnalysisService


class DummyCounterargumentAgent:
    def generate_counterargument(self, argument: str) -> CounterargumentResponse:
        return CounterargumentResponse(
            summary="summary",
            counterargument="counterargument",
            supporting_evidence="evidence",
            challenge_question="question",
        )


def test_generate_counterargument_returns_structured_response():
    service = AIAnalysisService.__new__(AIAnalysisService)
    service.counterargument_agent = DummyCounterargumentAgent()

    result = service.generate_counterargument("The economy will improve")

    assert isinstance(result, CounterargumentResponse)
    assert result.counterargument == "counterargument"
    assert result.supporting_evidence == "evidence"
