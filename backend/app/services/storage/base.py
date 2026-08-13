from abc import ABC, abstractmethod


class StorageBackend(ABC):
    """Abstract storage interface. Swap the backend returned by get_storage_backend()
    to move from local disk to S3/Cloudinary/Firebase without touching route code."""

    @abstractmethod
    async def save(self, file_bytes: bytes, filename: str) -> str:
        """Persist the file and return a URL/path clients can use to retrieve it."""
        ...

    @abstractmethod
    async def delete(self, url: str) -> None:
        """Remove a previously saved file, given the URL returned by save()."""
        ...