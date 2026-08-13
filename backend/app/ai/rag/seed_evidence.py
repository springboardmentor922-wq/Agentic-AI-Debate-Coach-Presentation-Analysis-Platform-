"""
Curated RAG Evidence Seed Utility

Populates the FAISS vector index with verified evidence sources
for core debate topics (UBI, Climate Policy, AI Regulation, Economic Policy).
"""

import sys
import os

# Ensure parent path is in sys.path when executed standalone
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from app.ai.rag.vector_store import faiss_evidence_store
from app.ai.schemas.milestone3_schema import EvidenceSource

CURATED_EVIDENCE_CORPUS = [
    EvidenceSource(
        title="OECD Report on Universal Basic Income & Income Redistribution",
        url="https://www.oecd.org/social/inequality-and-poverty.htm",
        citation="OECD Social Policy Analysis, 2024",
        relevance_score=0.92,
        snippet="Universal basic income experiments demonstrate immediate poverty mitigation, though tax-financed funding models require careful balancing against labor participation incentives.",
        content="Universal basic income experiments demonstrate immediate poverty mitigation, though tax-financed funding models require careful balancing against labor participation incentives."
    ),
    EvidenceSource(
        title="IPCC Climate Change Policy & Carbon Taxation Effectiveness",
        url="https://www.ipcc.ch/report/ar6/wg3/",
        citation="IPCC Working Group III Report, 2023",
        relevance_score=0.95,
        snippet="Carbon pricing mechanisms combined with renewable energy subsidies achieve significant emissions reductions without depressing net GDP growth.",
        content="Carbon pricing mechanisms combined with renewable energy subsidies achieve significant emissions reductions without depressing net GDP growth."
    ),
    EvidenceSource(
        title="EU AI Act Framework & High-Risk AI System Guidelines",
        url="https://artificialintelligenceact.eu/",
        citation="European Parliament AI Regulatory Framework, 2024",
        relevance_score=0.94,
        snippet="Risk-based AI regulation balances technological innovation with fundamental rights protection by mandating third-party audits for high-risk autonomous systems.",
        content="Risk-based AI regulation balances technological innovation with fundamental rights protection by mandating third-party audits for high-risk autonomous systems."
    ),
    EvidenceSource(
        title="World Economic Forum Future of Jobs & Automation Impact",
        url="https://www.weforum.org/reports/the-future-of-jobs-report-2023/",
        citation="WEF Future of Jobs Report, 2023",
        relevance_score=0.90,
        snippet="Automation and artificial intelligence disrupt traditional entry-level administrative positions while accelerating demand for analytical and strategic roles.",
        content="Automation and artificial intelligence disrupt traditional entry-level administrative positions while accelerating demand for analytical and strategic roles."
    )
]

def seed_evidence_store():
    """Seed the FAISS index with curated evidence if empty or requested."""
    print(f"Current index total vectors: {faiss_evidence_store.index.ntotal}")
    if faiss_evidence_store.index.ntotal == 0:
        print("Seeding curated evidence corpus into FAISS index...")
        faiss_evidence_store.add_documents(CURATED_EVIDENCE_CORPUS)
        print(f"Successfully seeded {len(CURATED_EVIDENCE_CORPUS)} evidence documents! Total vectors: {faiss_evidence_store.index.ntotal}")
    else:
        print(f"FAISS index already contains {faiss_evidence_store.index.ntotal} vectors.")

if __name__ == "__main__":
    seed_evidence_store()
