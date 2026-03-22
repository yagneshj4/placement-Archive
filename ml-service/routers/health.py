from fastapi import APIRouter
from models.schemas import HealthResponse
from services.vector_store import get_collection_counts
from config.settings import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint — called by Node.js to verify ML service is ready.
    Returns model status, ChromaDB collection counts, and service info.
    """
    try:
        counts = get_collection_counts()
        return HealthResponse(
            status="ok",
            model_loaded=True,
            chroma_ready=True,
            collections=counts,
            model_name=settings.embedding_model,
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="degraded",
            model_loaded=False,
            chroma_ready=False,
            collections={},
            model_name=settings.embedding_model,
        )