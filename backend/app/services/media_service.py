"""
Upload handling + video->audio extraction (Milestone 3, Parts 3-4).

Files are streamed to disk under settings.UPLOAD_DIR (never held fully in
memory), validated by extension/size, and video files have their audio
track extracted with ffmpeg before being handed to Whisper — Whisper only
accepts audio, so this step is mandatory for the video pipeline.

ffmpeg must be installed on the host/container (see backend Dockerfile).
"""
import os
import shutil
import subprocess
import uuid

from fastapi import HTTPException, UploadFile

from app.core.config import settings

_AUDIO_EXT = {e.strip().lower() for e in settings.ALLOWED_AUDIO_EXT.split(",")}
_AUDIO_EXT = {
    e.strip().lower()
    for e in settings.ALLOWED_AUDIO_EXT.split(",")
}


def _ext(filename: str) -> str:
    return (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()


def _upload_dir() -> str:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    return settings.UPLOAD_DIR


async def save_upload(file: UploadFile, kind: str) -> str:
    """
    Streams an UploadFile to disk with a UUID-prefixed name, validating
    extension against the allowed set for `kind` ("audio" or "video") and
    enforcing MAX_UPLOAD_MB. Returns the saved file's path.
    """
    allowed = _AUDIO_EXT if kind == "audio" else _VIDEO_EXT
    ext = _ext(file.filename or "")
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported {kind} format '.{ext}'. Allowed: {', '.join(sorted(allowed))}",
        )

    dest_name = f"{uuid.uuid4().hex}.{ext}"
    dest_path = os.path.join(_upload_dir(), dest_name)

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    written = 0
    with open(dest_path, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            written += len(chunk)
            if written > max_bytes:
                out.close()
                os.remove(dest_path)
                raise HTTPException(status_code=413, detail=f"File exceeds the {settings.MAX_UPLOAD_MB}MB upload limit")
            out.write(chunk)

    if written == 0:
        os.remove(dest_path)
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    return dest_path


def extract_audio(video_path: str) -> str:
    """Extracts a mono 16kHz WAV audio track from a video file using ffmpeg."""
    if shutil.which("ffmpeg") is None:
        raise HTTPException(
            status_code=503,
            detail="Video processing is not available: ffmpeg is not installed on the server.",
        )

    audio_path = f"{video_path}.extracted.wav"
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        audio_path,
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0 or not os.path.exists(audio_path):
        raise HTTPException(
            status_code=422,
            detail=f"Could not extract audio from the uploaded video: {proc.stderr.decode(errors='ignore')[-400:]}",
        )
    return audio_path


def cleanup(*paths: str) -> None:
    for p in paths:
        try:
            if p and os.path.exists(p):
                os.remove(p)
        except OSError:
            pass
