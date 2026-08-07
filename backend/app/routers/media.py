"""Secure media serving — streams a learner's recorded debate/presentation
audio back to whoever is authorized to see it: the learner who recorded it,
any coach who has that learner on their roster, or any educator/admin.
Never a public static file mount, so access is always checked per request."""
import os

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import presentation_analysis_collection, coach_assignments_collection, users_collection
from app.core.security import decode_token

router = APIRouter(prefix="/api/v1/media", tags=["Media"])

_CONTENT_TYPES = {"wav": "audio/wav", "mp3": "audio/mpeg", "m4a": "audio/mp4", "webm": "audio/webm", "ogg": "audio/ogg"}


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id")


async def get_user_for_media(
    token: str | None = Query(default=None, description="Bearer access token, since <audio>/<video> tags can't send an Authorization header"),
):
    """Same validation as get_current_user, but also accepts the JWT as a
    `?token=` query parameter — required because HTML media elements can't
    attach custom headers, so the frontend passes the access token in the
    URL instead. Still fully validated (signature + expiry + user lookup),
    just via a different transport."""
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    if not token:
        raise credentials_exception
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    user = await users_collection.find_one({"_id": _oid(user_id)})
    if not user:
        raise credentials_exception
    user["id"] = str(user["_id"])
    return user


async def _can_access(current_user: dict, owner_user_id: str) -> bool:
    if current_user["role"] in ("educator", "administrator"):
        return True
    if current_user["id"] == owner_user_id:
        return True
    if current_user["role"] == "debate_coach":
        assignment = await coach_assignments_collection.find_one(
            {"coach_id": current_user["id"], "learner_id": owner_user_id}
        )
        return assignment is not None
    return False


@router.get("/audio/{presentation_id}")
async def get_audio(presentation_id: str, current_user: dict = Depends(get_user_for_media)):
    doc = await presentation_analysis_collection.find_one({"_id": _oid(presentation_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording not found")
    if not doc.get("audio_filename"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No audio file was retained for this recording")

    if not await _can_access(current_user, doc["user_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to access this recording")

    file_path = os.path.join(settings.UPLOAD_DIR, doc["audio_filename"])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio file is no longer available on the server")

    ext = doc["audio_filename"].rsplit(".", 1)[-1].lower()
    return FileResponse(file_path, media_type=_CONTENT_TYPES.get(ext, "application/octet-stream"))
