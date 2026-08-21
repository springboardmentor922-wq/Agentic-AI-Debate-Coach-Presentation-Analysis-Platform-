from typing import List

from app.mongodb.debate_repository import debate_repository
from app.debate.schemas.report_schema import DebateReport


class ReportService:
    """
    Service class for retrieving debate analysis reports.
    """

    def get_all_reports(self) -> List[DebateReport]:
        """
        Retrieve all debate reports.
        """
        reports = debate_repository.get_all_reports()

        return [self._convert_document(report) for report in reports]

    def get_report_by_id(self, report_id: str) -> DebateReport | None:
        """
        Retrieve a report using its MongoDB ObjectId.
        """
        report = debate_repository.get_report_by_id(report_id)

        if report is None:
            return None

        return self._convert_document(report)

    def get_reports_by_session(self, session_id: int) -> List[DebateReport]:
        """
        Retrieve reports for a debate session.
        """
        reports = debate_repository.get_reports_by_session(session_id)

        return [self._convert_document(report) for report in reports]

    def get_reports_by_user(self, user_id: int) -> List[DebateReport]:
        """
        Retrieve reports for a user.
        """
        reports = debate_repository.get_reports_by_user(user_id)

        return [self._convert_document(report) for report in reports]

    @staticmethod
    def _convert_document(document: dict) -> DebateReport:
        """
        Convert a MongoDB document into a DebateReport schema.
        """

        return DebateReport(
            report_id=str(document["_id"]),
            session_id=document["session_id"],
            user_id=document.get("user_id"),
            topic_id=document.get("topic_id"),
            input_type=document["input_type"],
            media_filename=document["media_filename"],
            transcript=document["transcript"],
            argument_analysis=document["argument_analysis"],
            counterargument_analysis=document.get(
                "counterargument_analysis",
                {},
            ),
            logical_fallacy_analysis=document["logical_fallacy_analysis"],
        )


report_service = ReportService()