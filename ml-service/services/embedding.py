from sentence_transformers import SentenceTransformer
from config.settings import settings
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Singleton model instance ─────────────────────────────────────
# Loaded once at startup — all requests share this instance
_model: Optional[SentenceTransformer] = None

def load_model() -> SentenceTransformer:
    """Load the sentence-transformer model. Called once at startup."""
    global _model
    if _model is not None:
        return _model

    logger.info(f"Loading embedding model: {settings.embedding_model}")
    start = time.time()

    _model = SentenceTransformer(settings.embedding_model)

    elapsed = time.time() - start
    logger.info(f"Model loaded in {elapsed:.2f}s — dimension: {settings.embedding_dimension}")
    return _model

def get_model() -> SentenceTransformer:
    """Get the loaded model. Raises if not yet loaded."""
    if _model is None:
        raise RuntimeError("Model not loaded — call load_model() first")
    return _model

def encode_text(text: str) -> list:
    """
    Encode a single text string into a 384-dim embedding vector.

    Args:
        text: The text to encode (experience narrative, question, or query)

    Returns:
        List of 384 floats representing the semantic meaning of the text
    """
    model = get_model()

    # Truncate very long texts — all-MiniLM-L6-v2 has a 256 token limit
    # We take the first 512 words which covers the most important content
    words = text.split()
    if len(words) > 512:
        text = " ".join(words[:512])
        logger.debug(f"Truncated text from {len(words)} to 512 words")

    # normalize_embeddings=True ensures cosine similarity = dot product
    # This is more numerically stable and faster for similarity search
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

def encode_batch(texts: list) -> list:
    """
    Encode multiple texts in one batch — much faster than calling encode_text() in a loop.
    Use this when embedding the seed data or re-embedding all experiences.
    """
    model = get_model()

    # Truncate each text
    truncated = [" ".join(t.split()[:512]) for t in texts]

    embeddings = model.encode(
        truncated,
        normalize_embeddings=True,
        batch_size=32,           # process 32 at a time to control memory
        show_progress_bar=True,  # shows progress in terminal for large batches
    )
    return embeddings.tolist()