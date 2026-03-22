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

# ── Difficulty prediction ─────────────────────────────────────────

class DifficultyRequest(BaseModel):
    # High-level inputs (company, topics, roundType as strings)
    company:    str = Field(default="", description="Company name e.g. 'Amazon'")
    round_type: str = Field(default="technical", description="Round type")
    topics:     List[str] = Field(default=[], description="Topic tags from extractedTags")

    # Engagement signals — defaults represent a baseline user
    skip_rate:             float = Field(default=0.2, ge=0.0, le=1.0)
    avg_time_seconds:      float = Field(default=120.0, ge=0.0)
    self_rated_difficulty: float = Field(default=3.0, ge=1.0, le=5.0)
    attempt_count:         int   = Field(default=15, ge=0)

    # Optional: direct feature override (used when we have real analytics)
    raw_features: Optional[Dict[str, float]] = Field(
        default=None,
        description="If provided, raw numeric features are used directly (bypasses encoding)"
    )

class SHAPValue(BaseModel):
    feature:     str
    description: str
    raw_value:   float
    shap_value:  float
    direction:   str   # "up" or "down"
    magnitude:   float

class DifficultyResponse(BaseModel):
    success:          bool
    difficulty:       int          # 1-5
    difficulty_label: str          # Easy / Medium / Hard / Expert
    probability:      float        # confidence of predicted class
    probabilities:    List[float]  # [p1, p2, p3, p4, p5]
    shap_values:      List[SHAPValue]
    model_used:       str          # "xgboost" or "rule_based"
    top_driver:       str          # human-readable top SHAP factor