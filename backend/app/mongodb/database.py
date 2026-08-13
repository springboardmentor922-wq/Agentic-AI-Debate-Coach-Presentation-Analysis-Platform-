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
from app.core.config import settings


class MongoDB:

    def __init__(self):

        # MongoDB Connection URL
        self.client = MongoClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
        )

        # Database Name
        self.database: Database = self.client[settings.MONGODB_DATABASE]
        self._gridfs = None

    @property
    def gridfs(self):
        """
        Returns the MongoDB GridFS bucket for binary presentation audio storage.
        """
        if self._gridfs is None:
            import gridfs
            self._gridfs = gridfs.GridFS(self.database)
        return self._gridfs

    @property
    def presentation_analysis_collection(self):
        """
        Returns the presentation_analysis collection.
        """
        return self.database["presentation_analysis"]

    @property
    def debate_analysis_collection(self):
        """
        Returns the debate_analysis collection.
        """
        return self.database["debate_analysis"]

    @property
    def conversation_memory_collection(self):
        return self.database["conversation_memory"]

    @property
    def ai_execution_collection(self):
        return self.database["ai_executions"]


# Singleton Instance
mongodb = MongoDB()
