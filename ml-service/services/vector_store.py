import chromadb
from chromadb.config import Settings as ChromaSettings
from config.settings import settings
import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)

# ── Singleton ChromaDB client ────────────────────────────────────
_client: Optional[chromadb.PersistentClient] = None
_collections: dict = {}

def init_chroma() -> chromadb.PersistentClient:
    """Initialise ChromaDB with persistent storage. Called once at startup."""
    global _client, _collections

    if _client is not None:
        return _client

    logger.info(f"Initialising ChromaDB at: {settings.chroma_persist_dir}")
    start = time.time()

    _client = chromadb.PersistentClient(
        path=settings.chroma_persist_dir,
        settings=ChromaSettings(anonymized_telemetry=False),
    )

    # Create (or get existing) collections
    _collections["experiences"] = _client.get_or_create_collection(
        name=settings.chroma_collection_experiences,
        metadata={"hnsw:space": "cosine"},  # use cosine distance for similarity
    )

    _collections["questions"] = _client.get_or_create_collection(
        name=settings.chroma_collection_questions,
        metadata={"hnsw:space": "cosine"},
    )

    elapsed = time.time() - start
    exp_count = _collections["experiences"].count()
    q_count   = _collections["questions"].count()

    logger.info(
        f"ChromaDB ready in {elapsed:.2f}s — "
        f"experiences: {exp_count} vectors, questions: {q_count} vectors"
    )
    return _client

def get_collection(name: str):
    """Get a ChromaDB collection by name."""
    if name not in _collections:
        raise ValueError(f"Unknown collection: {name}. Must be 'experiences' or 'questions'")
    return _collections[name]

def get_collection_counts() -> dict:
    """Return document counts for all collections."""
    return {
        name: col.count()
        for name, col in _collections.items()
    }

# ── Core operations ──────────────────────────────────────────────

def add_embedding(
    collection_name: str,
    doc_id: str,
    embedding: list,
    metadata: dict = None,
) -> str:
    """
    Add or update a single embedding in ChromaDB.
    Uses upsert — safe to call multiple times with the same doc_id.

    Args:
        collection_name: "experiences" or "questions"
        doc_id:          MongoDB _id string — used as ChromaDB document ID
        embedding:       384-dim float list from encode_text()
        metadata:        Extra fields stored alongside the vector

    Returns:
        The doc_id (same as input, confirmed stored)
    """
    collection = get_collection(collection_name)

    # ChromaDB upsert: adds if new, updates if doc_id already exists
    collection.upsert(
        ids=[doc_id],
        embeddings=[embedding],
        metadatas=[metadata or {}],
    )

    logger.debug(f"Upserted embedding for {doc_id} in {collection_name}")
    return doc_id

def add_embeddings_batch(
    collection_name: str,
    doc_ids: list,
    embeddings: list,
    metadatas: list = None,
) -> int:
    """Batch upsert — much faster than calling add_embedding() in a loop."""
    collection = get_collection(collection_name)

    if metadatas is None:
        metadatas = [{} for _ in doc_ids]

    collection.upsert(
        ids=doc_ids,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    logger.info(f"Batch upserted {len(doc_ids)} embeddings into {collection_name}")
    return len(doc_ids)

def search_similar(
    collection_name: str,
    query_embedding: list,
    n_results: int = 5,
    where: dict = None,
) -> list:
    """
    Find the n most semantically similar documents to the query embedding.

    Args:
        collection_name: "experiences" or "questions"
        query_embedding: 384-dim float list from encode_text()
        n_results:       How many results to return (1-20)
        where:           Optional metadata filter — e.g. {"company": "Amazon"}

    Returns:
        List of dicts with doc_id, distance, similarity, metadata
    """
    collection = get_collection(collection_name)

    # Don't search if collection is empty
    count = collection.count()
    if count == 0:
        logger.warning(f"Collection {collection_name} is empty — no results")
        return []

    # ChromaDB returns at most collection.count() results
    actual_n = min(n_results, count)

    query_params = {
        "query_embeddings": [query_embedding],
        "n_results": actual_n,
        "include": ["distances", "metadatas"],
    }
    if where:
        query_params["where"] = where

    results = collection.query(**query_params)

    # Parse ChromaDB response format into clean dicts
    output = []
    for i, doc_id in enumerate(results["ids"][0]):
        distance   = results["distances"][0][i]
        similarity = max(0.0, 1.0 - distance)   # cosine: similarity = 1 - distance
        metadata   = results["metadatas"][0][i]

        output.append({
            "doc_id":     doc_id,
            "distance":   round(distance, 4),
            "similarity": round(similarity, 4),
            "metadata":   metadata,
        })

    return output

def delete_embedding(collection_name: str, doc_id: str) -> bool:
    """Remove an embedding from ChromaDB (called when experience is deleted)."""
    try:
        collection = get_collection(collection_name)
        collection.delete(ids=[doc_id])
        logger.info(f"Deleted embedding {doc_id} from {collection_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete embedding {doc_id}: {e}")
        return False