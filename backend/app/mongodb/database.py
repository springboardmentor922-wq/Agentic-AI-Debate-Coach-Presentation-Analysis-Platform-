"""
=========================================================
MongoDB Database Configuration

Responsibilities:
- Connect to MongoDB
- Create database instance
- Expose MongoDB collections

This module should ONLY handle database connectivity.
Business logic belongs in repository classes.
=========================================================
"""

from pymongo import MongoClient
from pymongo.database import Database


class MongoDB:

    def __init__(self):

        # MongoDB Connection URL
        self.client = MongoClient("mongodb://localhost:27017")

        # Database Name
        self.database: Database = self.client["agentic_ai_debate_coach"]

    @property
    def debate_analysis_collection(self):
        """
        Returns the debate_analysis collection.
        """
        return self.database["debate_analysis"]


# Singleton Instance
mongodb = MongoDB()