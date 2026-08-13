import os
import uuid

from app.services.storage.base import StorageBackend

RECORDINGS_DIR = os.path.join("uploads", "recordings")


class LocalStorageBackend(StorageBackend):
    """Default backend for local development. Stores files on disk under
    backend/uploads/recordings and serves them via a static file mount."""

    def __init__(self) -> None:
        os.makedirs(RECORDINGS_DIR, exist_ok=True)

    async def save(self, file_bytes: bytes, filename: str) -> str:
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        path = os.path.join(RECORDINGS_DIR, unique_name)
        with open(path, "wb") as f:
            f.write(file_bytes)
        return f"/static/recordings/{unique_name}"

    async def delete(self, url: str) -> None:
        filename = url.rsplit("/", 1)[-1]
        path = os.path.join(RECORDINGS_DIR, filename)
        if os.path.exists(path):
            os.remove(path)