"""
FastAPI router for the RAG Q&A endpoint.

Exposes POST /rag for natural language question answering over placement experiences.
"""
import logging
from fastapi import APIRouter, HTTPException, status

from models.schemas import RAGRequest, RAGResponse, RAGSource
from services.rag import rag_query

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["rag"])

@router.post("/", response_model=RAGResponse)
async def answer_question(request: RAGRequest):
    """
    Answer a placement interview question using RAG (Retrieval-Augmented Generation).

    The pipeline:
      1. Retrieves top-k similar placement experiences via semantic search
      2. Constructs a grounded prompt with citations
      3. Calls Google Gemini 1.5 Flash to synthesise an answer
      4. Returns the answer with source citations

    Request:
      query:     Student's placement question (e.g. "What questions does Amazon ask in interviews?")
      filters:   Optional metadata filter (e.g. {company: "Amazon", year: 2023})
      n_results: How many experiences to retrieve (1-20, default 5)
      use_cache: Whether to cache responses in Redis for speed (default true)

    Response:
      answer:       Gemini-generated answer grounded in retrieved experiences
      sources:      List of experience sources with citations and similarity scores
      cached:       Whether this response was served from Redis cache
      retrieval_ms: Time spent retrieving experiences from ChromaDB
      llm_ms:       Time spent generating answer with Gemini
      total_ms:     Total pipeline execution time

    Notes:
      - Answers are grounded in the archive — no general knowledge
      - Each factual claim is cited: [Company · Role · Round · Year]
      - Redis caching provides sub-10ms responses for repeated queries
      - Requires GOOGLE_API_KEY in environment (free tier: 1M tokens/day)
    """
    try:
        logger.info(f"RAG query from client: '{request.query[:100]}'")

        # Call the RAG pipeline
        result = rag_query(
            query=request.query,
            filters=request.filters or {},
            n_results=request.n_results,
            use_cache=request.use_cache,
        )

        # Transform result → RAGResponse with RAGSource objects
        sources = [RAGSource(**source) for source in result["sources"]]

        response = RAGResponse(
            success=True,
            query=request.query,
            answer=result["answer"],
            sources=sources,
            source_count=result["source_count"],
            cached=result["cached"],
            retrieval_ms=result["retrieval_ms"],
            llm_ms=result["llm_ms"],
            total_ms=result["total_ms"],
        )

        logger.info(
            f"RAG success — answer synthesised in {response.total_ms}ms "
            f"({response.source_count} sources, cached={response.cached})"
        )
        return response

    except ValueError as e:
        # Usually GOOGLE_API_KEY missing
        logger.error(f"Configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"RAG pipeline error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error answering question. Please try again.",
        )


@router.get("/health")
async def rag_health():
    """Check if RAG pipeline is ready (has LLM + ChromaDB + Redis)."""
    try:
        from services.rag import _get_llm, _get_redis
        from services.vector_store import get_collection

        llm_ready = False
        try:
            _get_llm()
            llm_ready = True
        except Exception as e:
            logger.warning(f"LLM not ready: {e}")

        redis_ready = _get_redis() is not None

        collection = get_collection("experiences")
        chroma_ready = collection is not None and collection.count() > 0

        return {
            "status": "ok" if (llm_ready and chroma_ready) else "degraded",
            "llm_ready": llm_ready,
            "redis_ready": redis_ready,
            "chroma_ready": chroma_ready,
            "experiences_indexed": collection.count() if chroma_ready else 0,
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "error", "error": str(e)}
