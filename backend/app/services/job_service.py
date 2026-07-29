"""
Processing Jobs (Milestone 3, Part 3-4 optimization). Backs the async
audio/video upload pipeline: upload returns immediately with a job id,
heavy work (transcription, argument/fallacy/presentation analysis, scoring,
report/notification creation) runs in a FastAPI background task, and the
frontend polls GET /api/v1/jobs/{job_id} for real stage-by-stage progress
instead of the client faking a progress bar around one long request.
"""
import logging
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from app.core.database import processing_jobs_collection

logger = logging.getLogger(__name__)

# Ordered stages so the frontend can render a real progress bar (index / total)
# rather than an indeterminate spinner.
STAGES = ["queued", "transcribing", "analyzing", "scoring", "saving", "done"]
STAGE_PROGRESS = {stage: round(100 * i / (len(STAGES) - 1)) for i, stage in enumerate(STAGES)}


def _oid(value: str) -> ObjectId | None:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


async def create_job(user_id: str, kind: str) -> dict:
    now = datetime.utcnow().isoformat()
    doc = {
        "user_id": user_id,
        "kind": kind,  # "audio" | "video"
        "status": "queued",
        "progress": STAGE_PROGRESS["queued"],
        "message": "Queued for processing…",
        "result_id": None,
        "error": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await processing_jobs_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


async def set_stage(job_id: str, stage: str, message: str | None = None) -> None:
    oid = _oid(job_id)
    if not oid:
        return
    update = {
        "status": stage,
        "progress": STAGE_PROGRESS.get(stage, 0),
        "updated_at": datetime.utcnow().isoformat(),
    }
    if message:
        update["message"] = message
    await processing_jobs_collection.update_one({"_id": oid}, {"$set": update})


async def complete_job(job_id: str, result_id: str, message: str = "Complete") -> None:
    oid = _oid(job_id)
    if not oid:
        return
    await processing_jobs_collection.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": "done",
                "progress": 100,
                "message": message,
                "result_id": result_id,
                "updated_at": datetime.utcnow().isoformat(),
            }
        },
    )


async def fail_job(job_id: str, error: str) -> None:
    oid = _oid(job_id)
    if not oid:
        return
    logger.warning("processing job %s failed: %s", job_id, error)
    await processing_jobs_collection.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": "error",
                "message": error,
                "error": error,
                "updated_at": datetime.utcnow().isoformat(),
            }
        },
    )


async def get_job(job_id: str) -> dict | None:
    oid = _oid(job_id)
    if not oid:
        return None
    doc = await processing_jobs_collection.find_one({"_id": oid})
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    return doc
