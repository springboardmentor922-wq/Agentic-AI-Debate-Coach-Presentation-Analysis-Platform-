from fastapi import APIRouter

from app.api.chat import router as chat_router
from app.api.ai_analysis import router as ai_analysis_router

api_router = APIRouter()

api_router.include_router(chat_router)
api_router.include_router(ai_analysis_router)