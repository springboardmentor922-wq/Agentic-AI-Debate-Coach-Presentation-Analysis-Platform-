"""Embedding provider with an offline deterministic fallback for FAISS."""
import hashlib
import numpy as np

class EmbeddingProvider:
    dimension = 384
    def embed(self, text: str) -> np.ndarray:
        # A deterministic fallback keeps retrieval operational without downloading a model at API startup.
        vector = np.zeros(self.dimension, dtype="float32")
        for token in text.lower().split():
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            vector[int.from_bytes(digest[:2], "big") % self.dimension] += 1.0
        norm = np.linalg.norm(vector)
        return vector / norm if norm else vector

embedding_provider = EmbeddingProvider()
