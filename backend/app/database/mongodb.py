from motor.motor_asyncio import AsyncIOMotorClient

from app.config.settings import (
    MONGO_DATABASE,
    MONGO_URL,
)

mongo_client = AsyncIOMotorClient(MONGO_URL)

mongo_db = mongo_client[MONGO_DATABASE]


def get_mongo():
    return mongo_db