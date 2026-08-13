from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

mongo_client = AsyncIOMotorClient(settings.MONGO_URI)
mongo_db = mongo_client[settings.MONGO_DB_NAME]


skill_tracking_collection = mongo_db["skill_tracking"]
session_logs_collection = mongo_db["session_logs"]
fallacy_analysis_collection = mongo_db["fallacy_analysis"]
feedback_collection = mongo_db["feedback"]
invites_collection = mongo_db["debate_invites"]
coaching_nudges_collection = mongo_db["coaching_nudges"] 
argument_analysis_collection = mongo_db["argument_analysis"]
performance_summaries_collection = mongo_db["performance_summaries"]
coaching_reports_collection = mongo_db["coaching_reports"]
assistant_messages_collection = mongo_db["assistant_messages"]