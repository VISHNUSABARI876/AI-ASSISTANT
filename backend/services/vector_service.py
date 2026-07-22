"""
Vector Knowledge Base & Semantic Document RAG Service.
"""
import logging
import re
from typing import List, Dict

logger = logging.getLogger(__name__)


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 80) -> List[str]:
    """Split text into overlapping semantic chunks for RAG lookup."""
    clean = re.sub(r'\s+', ' ', text).strip()
    words = clean.split(' ')
    chunks = []
    
    if len(words) <= chunk_size:
        return [clean]

    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if len(chunk.strip()) > 30:
            chunks.append(chunk.strip())
        start += (chunk_size - overlap)

    return chunks


def score_similarity(query: str, chunk: str) -> float:
    """Calculate term overlap and keyword relevance score between query and chunk."""
    query_terms = set(re.findall(r'\w+', query.lower()))
    chunk_terms = set(re.findall(r'\w+', chunk.lower()))

    if not query_terms:
        return 0.0

    overlap = query_terms.intersection(chunk_terms)
    score = len(overlap) / len(query_terms)

    # Bonus for exact substring match
    if query.lower() in chunk.lower():
        score += 0.5

    return score


def search_document_chunks(text: str, query: str, top_k: int = 3) -> List[Dict[str, any]]:
    """Chunk document text and return top-k most relevant text chunks."""
    chunks = chunk_text(text)
    scored_chunks = []

    for idx, chunk in enumerate(chunks):
        score = score_similarity(query, chunk)
        if score > 0.05:
            scored_chunks.append({
                "chunk_id": idx + 1,
                "text": chunk,
                "score": round(score, 3),
            })

    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]
