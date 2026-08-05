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
from bson.errors import InvalidId

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

            "logical_fallacy_analysis": logical_fallacy_analysis,

            "created_at": datetime.utcnow(),

            "updated_at": datetime.utcnow(),

        }

        result = self.collection.insert_one(document)

        return str(result.inserted_id)

    def save_workflow_result(self, session_id: int, user_id: int | None, result: dict) -> str:
        """Persist one complete, report-compatible workflow document."""
        transcript = result.get("argument", "")
        document = {
            "session_id": session_id,
            "user_id": user_id,
            "topic_id": result.get("context", {}).get("topic", {}).get("id"),
            "input_type": result.get("input_type", "text"),
            "media_filename": result.get("media_filename"),
            "transcript": {"transcript": transcript},
            "argument_analysis": result.get("argument_analysis", {}),
            "logical_fallacy_analysis": result.get("logical_fallacy_analysis", {}),
            "counterargument": result.get("counterargument", {}),
            "ai_debate_opponent": result.get("ai_debate_opponent", {}),
            "performance": result.get("performance", {}),
            "coaching": result.get("coaching", {}),
            "recommendations": result.get("recommendations", {}),
            "learning_path": result.get("learning_path", {}),
            "memory": result.get("memory", {}),
            "observability": result.get("observability", {}),
            "workflow": result,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        return str(self.collection.insert_one(document).inserted_id)

    def save_observability(self, execution: dict) -> str:
        return str(mongodb.ai_execution_collection.insert_one(execution).inserted_id)

    # =====================================================
    # Get Report By ID
    # =====================================================

    def get_report_by_id(self, report_id: str):
        """
        Retrieve a debate report using MongoDB ObjectId.
        """

        try:
            object_id = ObjectId(report_id)
        except (InvalidId, TypeError):
            return None
        report = self.collection.find_one({"_id": object_id})

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
