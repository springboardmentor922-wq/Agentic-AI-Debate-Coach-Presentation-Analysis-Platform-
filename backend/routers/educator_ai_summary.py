from fastapi import APIRouter

router = APIRouter(
    prefix="/educator",
    tags=["Educator Dashboard"]
)

@router.get("/ai-summary")
def ai_summary():

    return {
        "summary": [
            "72% learners need stronger evidence usage",
            "Public Forum is the most popular debate format",
            "Confidence scores improved by 15%",
            "5 learners require coach intervention",
            "Fallacy detection performance is improving"
        ]
    }