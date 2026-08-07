"""
Thin alias routes so the exact endpoint paths from the Milestone 3 spec
(/api/v1/recommendations, /api/v1/leaderboard, /api/v1/analysis/:id,
/api/v1/debate/:id, /api/v1/debate/history) exist, without duplicating any
logic — each alias simply calls the real implementation already in
dashboard.py / analysis.py / debate_sessions.py.
"""
from fastapi import APIRouter, Depends, Query

from app.core.deps import require_roles, get_current_user
from app.schemas.user import UserRole
from app.routers import dashboard as dashboard_router
from app.routers import analysis as analysis_router
from app.routers import debate_sessions as sessions_router

router = APIRouter(prefix="/api/v1", tags=["Milestone 3 Endpoint Aliases"])


@router.get("/recommendations")
async def recommendations_alias(
    limit: int = Query(default=3, ge=1, le=10),
    current_user: dict = Depends(require_roles(UserRole.learner)),
):
    return await dashboard_router.get_recommendations(limit=limit, current_user=current_user)


@router.get("/leaderboard")
async def leaderboard_alias(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: dict = Depends(require_roles(UserRole.learner)),
):
    return await dashboard_router.get_leaderboard(limit=limit, current_user=current_user)


@router.get("/analysis/{analysis_id}")
async def analysis_detail_alias(analysis_id: str, current_user: dict = Depends(get_current_user)):
    return await analysis_router.get_analysis_detail(analysis_id=analysis_id, current_user=current_user)


@router.get("/debate/history")
async def debate_history_alias(current_user: dict = Depends(get_current_user)):
    return await sessions_router.list_debate_history(current_user=current_user)


@router.get("/debate/{session_id}")
async def debate_detail_alias(session_id: str, current_user: dict = Depends(get_current_user)):
    return await sessions_router.get_session(session_id=session_id, current_user=current_user)
