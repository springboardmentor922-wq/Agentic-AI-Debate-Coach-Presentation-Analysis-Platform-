"""
Processing Job status polling (Milestone 3, Part 3-4 optimization). The
audio upload endpoint in routers/debate_live.py returns a job id
immediately and do the real work in a background task; the frontend polls
this endpoint for real stage-by-stage progress. When status is "done", the
full presentation analysis result is embedded inline so the frontend
doesn't need a second round-trip.
"""
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import presentation_analysis_collection
from app.core.deps import get_current_user
from app.services import job_service

router = APIRouter(prefix="/api/v1/jobs", tags=["Processing Jobs"])


@router.get("/{job_id}")
async def get_job_status(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this job")

    out = {
        "id": job["id"],
        "kind": job["kind"],
        "status": job["status"],
        "progress": job["progress"],
        "message": job["message"],
        "error": job.get("error"),
        "created_at": job["created_at"],
        "updated_at": job["updated_at"],
        "result": None,
    }
    if job["status"] == "done" and job.get("result_id"):
        from bson import ObjectId

        result_doc = await presentation_analysis_collection.find_one({"_id": ObjectId(job["result_id"])})
        if result_doc:
            result_doc["id"] = str(result_doc["_id"])
            del result_doc["_id"]
            out["result"] = result_doc
    return out
