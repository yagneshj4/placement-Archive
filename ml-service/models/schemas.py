from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

# ── Embed endpoint ───────────────────────────────────────────────

class CollectionType(str, Enum):
    experiences = "experiences"
    questions   = "questions"

class EmbedRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Text to embed")
    doc_id: str = Field(..., description="MongoDB _id of the document")
    collection: CollectionType = Field(
        default=CollectionType.experiences,
        description="Which ChromaDB collection to store in"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default={},
        description="Extra metadata to store alongside the vector"
    )

class EmbedResponse(BaseModel):
    success: bool
    doc_id: str
    embedding_id: str
    collection: str
    dimension: int
    message: str

# ── Semantic search endpoint ─────────────────────────────────────

class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Natural language search query")
    collection: CollectionType = Field(default=CollectionType.experiences)
    n_results: int = Field(default=5, ge=1, le=20, description="Number of results to return")
    where: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata filter — e.g. {company: 'Amazon'}"
    )

class SearchResult(BaseModel):
    doc_id: str
    distance: float          # lower = more similar (cosine distance)
    similarity: float        # 1 - distance, higher = more similar
    metadata: Dict[str, Any]

class SemanticSearchResponse(BaseModel):
    success: bool
    query: str
    results: List[SearchResult]
    total: int

# ── Batch embed endpoint ─────────────────────────────────────────

class BatchEmbedItem(BaseModel):
    text: str
    doc_id: str
    metadata: Optional[Dict[str, Any]] = {}

class BatchEmbedRequest(BaseModel):
    items: List[BatchEmbedItem] = Field(..., min_length=1, max_length=100)
    collection: CollectionType = Field(default=CollectionType.experiences)

class BatchEmbedResponse(BaseModel):
    success: bool
    embedded: int
    failed: int
    collection: str

# ── Health endpoint ──────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    chroma_ready: bool
    collections: Dict[str, int]
    model_name: str

# ── RAG Q&A endpoint ─────────────────────────────────────────────

class RAGSource(BaseModel):
    doc_id: str
    citation: str                  # "Company · Role · Round · Year"
    similarity: float              # 0 to 1, higher = more relevant
    company: Optional[str] = None
    role: Optional[str] = None
    roundType: Optional[str] = None
    year: Optional[int] = None

class RAGRequest(BaseModel):
    query: str = Field(..., min_length=5, description="Student's placement question")
    filters: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional metadata filter — e.g. {company: 'Amazon', year: 2023}"
    )
    n_results: int = Field(
        default=5, ge=1, le=20,
        description="Max experiences to retrieve for context"
    )
    use_cache: bool = Field(
        default=True,
        description="Whether to use Redis cache"
    )

class RAGResponse(BaseModel):
    success: bool
    query: str
    answer: str                    # Gemini-generated answer
    sources: List[RAGSource]       # Retrieved experiences
    source_count: int              # How many experiences were used
    cached: bool                   # Was this answer cached?
    retrieval_ms: float            # ChromaDB retrieval time
    llm_ms: float                  # Gemini generation time
    total_ms: float                # Total pipeline time
    message: Optional[str] = None  # Error message if success=False

# ── Hybrid search endpoint ───────────────────────────────────────

class HybridSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=300)
    collection: CollectionType = Field(default=CollectionType.experiences)
    n_results: int = Field(default=10, ge=1, le=50)
    where: Optional[Dict[str, Any]] = Field(default=None)
    min_similarity: float = Field(
        default=0.3, ge=0.0, le=1.0,
        description="Minimum similarity threshold — results below this are excluded"
    )

class HybridSearchResponse(BaseModel):
    success: bool
    query: str
    results: List[SearchResult]   # reuse SearchResult from Phase 3
    total: int
    search_type: str              # "semantic" or "fallback_empty_collection"
