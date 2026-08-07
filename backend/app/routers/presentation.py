from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.services.ai.presentation_engine import PresentationEngine

router = APIRouter(
    prefix="/presentation",
    tags=["Presentation"]
)

engine = PresentationEngine()

history = []


@router.post("/analyze")
async def analyze(

    file: UploadFile | None = File(default=None),

    transcript: str | None = Form(default=None)

):

    if file is None and (transcript is None or transcript.strip() == ""):

        raise HTTPException(
            status_code=400,
            detail="Provide either a presentation file or transcript."
        )

    result = await engine.analyze(

        file=file,

        transcript=transcript

    )

    history.append(result)

    return result


@router.get("/history")
async def get_history():

    return history