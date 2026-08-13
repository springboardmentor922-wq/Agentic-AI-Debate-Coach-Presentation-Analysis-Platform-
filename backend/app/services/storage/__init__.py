from app.services.storage.local_storage import LocalStorageBackend
from app.services.storage.base import StorageBackend


def get_storage_backend() -> StorageBackend:
    """Single point of change for swapping storage providers later
    (e.g. return S3Backend() once cloud storage is configured)."""
    return LocalStorageBackend()