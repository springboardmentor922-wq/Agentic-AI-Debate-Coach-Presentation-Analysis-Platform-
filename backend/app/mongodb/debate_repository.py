"""
=========================================================
Debate Repository

Responsibilities:
- Save debate analysis reports
- Retrieve reports by ID
- Retrieve reports by user
- Retrieve reports by session

This repository ONLY interacts with MongoDB.
Business logic belongs in DebateService.
=========================================================
"""

from datetime import datetime
from bson import ObjectId

from app.mongodb.database import mongodb


class DebateRepository:
    """
    Repository for Debate Analysis documents.
    """

    def __init__(self):
        self.collection = mongodb.debate_analysis_collection

    # =====================================================
    # Save Debate Analysis
    # =====================================================

    def save_debate_analysis(
        self,
        session_id: int,
        transcript: dict,
        argument_analysis: dict,
        counterargument_analysis: dict,
        logical_fallacy_analysis: dict,
        media_filename: str,
        input_type: str = "media_upload",
        user_id: int | None = None,
        topic_id: int | None = None,    
    ):
        """
        Save a complete debate analysis report.
        """

        document = {

            "session_id": session_id,

            "user_id": user_id,

            "topic_id": topic_id,

            "input_type": input_type,

            "media_filename": media_filename,

            "transcript": transcript,

            "argument_analysis": argument_analysis,

            "counterargument_analysis": counterargument_analysis,

            "logical_fallacy_analysis": logical_fallacy_analysis,

            "created_at": datetime.utcnow(),

            "updated_at": datetime.utcnow(),

        }

        result = self.collection.insert_one(document)

        return str(result.inserted_id)

    # =====================================================
    # Get Report By ID
    # =====================================================

    def get_report_by_id(self, report_id: str):
        """
        Retrieve a debate report using MongoDB ObjectId.
        """

        report = self.collection.find_one(
            {
                "_id": ObjectId(report_id)
            }
        )

        return report

    # =====================================================
    # Get Reports By User
    # =====================================================

    def get_reports_by_user(self, user_id: int):
        """
        Retrieve all reports submitted by a user.
        """

        reports = self.collection.find(
            {
                "user_id": user_id
            }
        )

        return list(reports)

    # =====================================================
    # Get Reports By Session
    # =====================================================

    def get_reports_by_session(self, session_id: int):
        """
        Retrieve all reports for a debate session.
        """

        reports = self.collection.find(
            {
                "session_id": session_id
            }
        )

        return list(reports)

        # =====================================================
    # Get All Reports
    # =====================================================

    def get_all_reports(self):
        """
        Retrieve all debate analysis reports.
        """

        reports = self.collection.find()

        return list(reports)


# =========================================================
# Singleton Repository
# =========================================================

debate_repository = DebateRepository()