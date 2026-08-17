from fastapi import APIRouter
from app.services.challenge_service import get_daily_challenge

router = APIRouter(
    prefix="/challenge",
    tags=["AI Challenge"]
)

@router.get("/today")
def today():

    return get_daily_challenge()