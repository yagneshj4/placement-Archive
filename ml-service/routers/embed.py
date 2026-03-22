from fastapi import APIRouter, HTTPException, Header
from models.schemas import EmbedRequest, EmbedResponse, BatchEmbedRequest, BatchEmbedResponse
from services.embedding import encode_text, encode_batch
from services.vector_store import add_embedding, add_embeddings_batch
from config.settings import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def verify_api_key(x_api_key: str = Header(None)):
    """Simple API key check — prevents random internet traffic hitting the ML service."""
    if x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

# POST /embed — embed a single experience or question
@router.post("/embed", response_model=EmbedResponse, tags=["Embeddings"])
async def embed_document(
    request: EmbedRequest,
    x_api_key: str = Header(None),
):
    """
    Embed a single document and store in ChromaDB.
    Called by the Node.js Bull.js worker after each new experience submission.

    Request body:
        text:       The experience narrative to embed
        doc_id:     MongoDB _id of the experience
        collection: "experiences" or "questions"
        metadata:   Extra fields to store (company, year, roundType, etc.)
    """
    verify_api_key(x_api_key)

    try:
        # 1. Generate 384-dim embedding
        logger.info(f"Embedding document {request.doc_id} in {request.collection}")
        embedding = encode_text(request.text)

        # 2. Store in ChromaDB with metadata
        embedding_id = add_embedding(
            collection_name=request.collection,
            doc_id=request.doc_id,
            embedding=embedding,
            metadata=request.metadata or {},
        )

        return EmbedResponse(
            success=True,
            doc_id=request.doc_id,
            embedding_id=embedding_id,
            collection=request.collection,
            dimension=len(embedding),
            message=f"Successfully embedded and stored in {request.collection}",
        )

    except Exception as e:
        logger.error(f"Embedding failed for {request.doc_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Embedding failed: {str(e)}"
        )

# POST /embed/batch — embed multiple documents at once (used for seed data)
@router.post("/embed/batch", response_model=BatchEmbedResponse, tags=["Embeddings"])
async def embed_batch(
    request: BatchEmbedRequest,
    x_api_key: str = Header(None),
):
    """
    Batch embed multiple documents — used to re-embed all seed experiences
    or process a backlog of pending embeddings.
    Much faster than calling /embed in a loop.
    """
    verify_api_key(x_api_key)

    try:
        texts    = [item.text    for item in request.items]
        doc_ids  = [item.doc_id  for item in request.items]
        # Provide default metadata with at least one field for ChromaDB compatibility
        metadata = [item.metadata or {"source": "batch_embed"} for item in request.items]

        logger.info(f"Batch embedding {len(texts)} documents into {request.collection}")

        # Generate all embeddings in one shot
        embeddings = encode_batch(texts)

        # Store all at once in ChromaDB
        count = add_embeddings_batch(
            collection_name=request.collection,
            doc_ids=doc_ids,
            embeddings=embeddings,
            metadatas=metadata,
        )

        return BatchEmbedResponse(
            success=True,
            embedded=count,
            failed=0,
            collection=request.collection,
        )

    except Exception as e:
        logger.error(f"Batch embedding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Batch embedding failed: {str(e)}")