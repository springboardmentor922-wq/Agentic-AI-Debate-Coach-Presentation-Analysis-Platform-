"""Small FAISS-compatible retrieval boundary with a safe empty-corpus fallback."""
from app.ai.schemas.milestone3_schema import EvidenceSource
from app.ai.rag.vector_store import faiss_evidence_store

class EvidenceRetriever:
    def retrieve(self, query: str, limit: int = 3) -> list[EvidenceSource]:
        # The corpus may be populated independently; never fabricate evidence when it is empty.
        return faiss_evidence_store.search(query, limit)

evidence_retriever = EvidenceRetriever()
