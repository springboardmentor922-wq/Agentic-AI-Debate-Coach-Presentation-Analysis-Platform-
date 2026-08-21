from app.debate.services.report_service import ReportService


def test_convert_document_preserves_counterargument_analysis():
    document = {
        "_id": "abc123",
        "session_id": 7,
        "user_id": 1,
        "topic_id": 2,
        "input_type": "media_upload",
        "media_filename": "demo.wav",
        "transcript": {"transcript": "hello"},
        "argument_analysis": {"summary": "arg"},
        "counterargument_analysis": {"summary": "counter"},
        "logical_fallacy_analysis": {"summary": "fallacy"},
    }

    report = ReportService._convert_document(document)

    assert report.counterargument_analysis == {"summary": "counter"}
