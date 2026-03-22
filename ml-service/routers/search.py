from fastapi import APIRouter, HTTPException, Header
from models.schemas import (
    SemanticSearchRequest, SemanticSearchResponse, SearchResult,
    HybridSearchRequest, HybridSearchResponse
)
from services.embedding import encode_text
from services.vector_store import search_similar, get_collection_counts
from config.settings import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

# POST /search — semantic similarity search
@router.post("/search", response_model=SemanticSearchResponse, tags=["Search"])
async def semantic_search(
    request: SemanticSearchRequest,
    x_api_key: str = Header(None),
):
    """
    Find semantically similar documents to a query string.
    Used for:
    1. Semantic search in the search page (Phase 4)
    2. Similar questions panel on detail page (Phase 4)
    3. RAG retrieval — finding relevant experiences for a user question (Phase 4)

    Request body:
        query:      Natural language query ("What did Amazon ask about trees?")
        collection: "experiences" or "questions"
        n_results:  How many results to return (default: 5)
        where:      Optional metadata filter (e.g. {"company": "Amazon"})
    """
    verify_api_key(x_api_key)

    try:
        logger.info(f"Semantic search: '{request.query[:60]}...' in {request.collection}")

        # 1. Encode the query into a vector
        query_embedding = encode_text(request.query)

        # 2. Find similar documents in ChromaDB
        raw_results = search_similar(
            collection_name=request.collection,
            query_embedding=query_embedding,
            n_results=request.n_results,
            where=request.where,
        )

        # 3. Parse into response schema
        results = [
            SearchResult(
                doc_id=r["doc_id"],
                distance=r["distance"],
                similarity=r["similarity"],
                metadata=r["metadata"],
            )
            for r in raw_results
        ]

        return SemanticSearchResponse(
            success=True,
            query=request.query,
            results=results,
            total=len(results),
        )

    except Exception as e:
        logger.error(f"Search failed for query '{request.query[:60]}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )


# POST /search/hybrid — semantic search with similarity scoring
@router.post("/search/hybrid", response_model=HybridSearchResponse, tags=["Search"])
async def hybrid_search(
    request: HybridSearchRequest,
    x_api_key: str = Header(None),
):
    """
    Semantic search with similarity scoring — used as the primary search mode.

    Returns results ranked by vector similarity score (higher = more relevant).
    Results below min_similarity threshold are filtered out.
    If the collection is empty, returns empty results (Node.js falls back to keyword).

    Used by:
    1. Search page — replaces MongoDB text search as the primary ranking signal
    2. Similar questions panel — finds semantically related experiences
    """
    verify_api_key(x_api_key)

    try:
        logger.info(f"Hybrid search: '{request.query[:60]}...' in {request.collection}")

        # Check if collection has any documents
        counts = get_collection_counts()
        collection_count = counts.get(request.collection, 0)

        # If collection is empty — return empty so Node.js uses keyword fallback
        if collection_count == 0:
            logger.info(f"Collection '{request.collection}' is empty — falling back")
            return HybridSearchResponse(
                success=True,
                query=request.query,
                results=[],
                total=0,
                search_type="fallback_empty_collection",
            )

        # Encode query and search
        query_embedding = encode_text(request.query)
        raw_results = search_similar(
            collection_name=request.collection,
            query_embedding=query_embedding,
            n_results=min(request.n_results, collection_count),
            where=request.where,
        )

        # Filter by minimum similarity threshold
        filtered = [
            SearchResult(
                doc_id=r["doc_id"],
                distance=r["distance"],
                similarity=r["similarity"],
                metadata=r["metadata"],
            )
            for r in raw_results
            if r["similarity"] >= request.min_similarity
        ]

        return HybridSearchResponse(
            success=True,
            query=request.query,
            results=filtered,
            total=len(filtered),
            search_type="semantic",
        )

    except Exception as e:
        logger.error(f"Hybrid search failed for query '{request.query[:60]}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Hybrid search failed: {str(e)}"
        )