"""
RAG (Retrieval-Augmented Generation) pipeline for The Placement Archive.
Uses Google Gemini API directly (not through LangChain wrapper).

Flow:
  1. Check Redis cache — return cached answer if hit
  2. Encode query with sentence-transformers
  3. Retrieve top-k similar experiences from ChromaDB
  4. Build a grounded prompt with citations
  5. Call Gemini to generate a synthesised answer
  6. Cache the response in Redis
  7. Return answer + source citations
"""
import hashlib
import json
import logging
import time
from typing import Optional

import google.generativeai as genai

try:
    import redis as redis_lib
    _redis_available = True
except ImportError:
    _redis_available = False

from config.settings import settings
from services.embedding import encode_text
from services.vector_store import search_similar

logger = logging.getLogger(__name__)

# ── Singleton Redis client ───────────────────────────────────────
_redis_client = None

def _get_redis():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    if not _redis_available or not settings.redis_url:
        return None
    try:
        _redis_client = redis_lib.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3,
        )
        _redis_client.ping()
        logger.info("✅ Redis cache connected for RAG")
    except Exception as e:
        logger.warning(f"Redis unavailable — RAG cache disabled: {e}")
        _redis_client = None
    return _redis_client

# ── Gemini client initialization ─────────────────────────────────
def _init_gemini():
    """Initialize Gemini API client."""
    if not settings.google_api_key:
        raise ValueError(
            "GOOGLE_API_KEY not set in .env — "
            "get one at https://aistudio.google.com/app/apikeys and add it to ml-service/.env"
        )
    genai.configure(api_key=settings.google_api_key)
    logger.info(f"✅ Gemini API configured with model: {settings.gemini_model}")

# Initialize on first call
_gemini_initialized = False

def _ensure_gemini_initialized():
    global _gemini_initialized
    if not _gemini_initialized:
        _init_gemini()
        _gemini_initialized = True

# ── Cache helpers ────────────────────────────────────────────────

def _cache_key(query: str, filters: dict) -> str:
    """Generate a deterministic cache key from query + filters."""
    payload = json.dumps({"q": query.lower().strip(), "f": filters}, sort_keys=True)
    return f"rag:v1:{hashlib.sha256(payload.encode()).hexdigest()[:16]}"

def _get_cached(key: str) -> Optional[dict]:
    """Return cached RAG response or None."""
    r = _get_redis()
    if r is None:
        return None
    try:
        raw = r.get(key)
        if raw:
            logger.debug(f"RAG cache HIT: {key}")
            return json.loads(raw)
    except Exception as e:
        logger.warning(f"Cache read error: {e}")
    return None

def _set_cached(key: str, value: dict):
    """Store RAG response in Redis with TTL."""
    r = _get_redis()
    if r is None:
        return
    try:
        r.setex(key, settings.rag_cache_ttl_seconds, json.dumps(value))
        logger.debug(f"RAG cached: {key} (TTL {settings.rag_cache_ttl_seconds}s)")
    except Exception as e:
        logger.warning(f"Cache write error: {e}")

# ── System prompt ─────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a placement preparation assistant for engineering students at Indian colleges.
Your job is to answer questions about placement interviews using ONLY the provided interview experiences from senior students.

STRICT RULES — follow every one:
1. Answer ONLY using information from the provided experiences — never from your general knowledge
2. After every factual claim, cite the source in brackets: [Company · Role · Round · Year]
3. If the experiences don't contain enough relevant information, say EXACTLY this: "No experiences matching this query are in the archive yet. Try different keywords."
4. Keep the answer to 3-5 sentences maximum — be concise and direct
5. Never invent company names, question topics, or interview outcomes not mentioned in the experiences
6. If multiple experiences are relevant, synthesise them into one coherent answer

Your tone should be helpful, factual, and encouraging."""

# ── Citation formatter ────────────────────────────────────────────

def _format_source(metadata: dict) -> str:
    """Format a ChromaDB metadata dict into a human-readable citation."""
    parts = []
    if metadata.get("company"):
        parts.append(metadata["company"])
    if metadata.get("role"):
        parts.append(metadata["role"])
    if metadata.get("roundType"):
        rt = metadata["roundType"].replace("_", " ").title()
        parts.append(rt)
    if metadata.get("year"):
        parts.append(str(metadata["year"]))
    return " · ".join(parts) if parts else "Unknown source"

def _build_context(retrieved: list) -> str:
    """
    Build the context block injected into the prompt.
    Each experience is labelled with its source for citation tracking.
    """
    if not retrieved:
        return "No relevant experiences found in the archive."

    blocks = []
    for i, result in enumerate(retrieved, 1):
        source = _format_source(result["metadata"])
        doc_id = result.get("doc_id", "")
        similarity = result.get("similarity", 0)

        blocks.append(
            f"[Experience {i} | Source: {source} | Match: {similarity:.0%}]\n"
            f"{result['metadata'].get('narrative_preview', 'Experience content unavailable.')}\n"
        )

    return "\n---\n".join(blocks)

def _normalize_year(value):
    """Convert year-like values to int when possible, else return None."""
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return None
        if stripped.isdigit():
            try:
                return int(stripped)
            except ValueError:
                return None
    return None

def _fallback_answer_from_retrieval(retrieved: list) -> str:
    """Build a concise grounded answer when Gemini is unavailable."""
    if not retrieved:
        return "No experiences matching this query are in the archive yet. Try different keywords."

    companies = []
    rounds = []
    citations = []

    for result in retrieved:
        metadata = result.get("metadata", {})
        company = metadata.get("company")
        round_type = metadata.get("roundType")
        citation = _format_source(metadata)

        if company:
            companies.append(company)
        if round_type:
            rounds.append(round_type.replace("_", " "))
        if citation and citation != "Unknown source":
            citations.append(citation)

    unique_companies = sorted(set(companies))
    unique_rounds = sorted(set(rounds))
    unique_citations = []
    for c in citations:
        if c not in unique_citations:
            unique_citations.append(c)

    company_text = ", ".join(unique_companies[:3]) if unique_companies else "multiple companies"
    round_text = ", ".join(unique_rounds[:4]) if unique_rounds else "coding and interview rounds"
    citation_text = " ".join([f"[{c}]" for c in unique_citations[:3]])

    answer = (
        f"Based on {len(retrieved)} matching experiences, {company_text} interviews commonly include {round_text}. "
        "Focus on clear problem-solving steps, edge cases, and concise communication in interview discussions."
    )

    if citation_text:
        answer = f"{answer} {citation_text}"

    return answer

# ── Main RAG function ─────────────────────────────────────────────

def rag_query(
    query: str,
    filters: Optional[dict] = None,
    n_results: int = None,
    use_cache: bool = True,
) -> dict:
    """
    Full RAG pipeline — takes a natural language question, retrieves relevant
    experiences, and returns a grounded, cited answer using Gemini.

    Args:
        query:     Natural language question from the student
        filters:   Optional ChromaDB metadata filter (e.g. {"company": "Amazon"})
        n_results: How many experiences to retrieve (default: settings.rag_top_k)
        use_cache: Whether to check/store Redis cache (default: True)

    Returns:
        dict with keys:
            answer       - The generated answer string
            sources      - List of source citation dicts
            cached       - Whether this was a cache hit
            query        - The original query
            retrieval_ms - Time spent on ChromaDB retrieval
            llm_ms       - Time spent on LLM generation
            total_ms     - Total pipeline time
    """
    start_total = time.time()
    filters = filters or {}
    n_results = n_results or settings.rag_top_k

    logger.info(f"RAG query: '{query[:80]}' | filters: {filters}")

    # ── Step 1: Redis cache check ─────────────────────────────────
    cache_key = _cache_key(query, filters)
    if use_cache:
        cached = _get_cached(cache_key)
        if cached:
            cached["cached"] = True
            cached["total_ms"] = round((time.time() - start_total) * 1000, 1)
            logger.info(f"Cache hit — returned in {cached['total_ms']}ms")
            return cached

    # ── Step 2: Encode query ──────────────────────────────────────
    query_embedding = encode_text(query)

    # ── Step 3: ChromaDB retrieval ────────────────────────────────
    t_retrieval = time.time()
    retrieved = search_similar(
        collection_name="experiences",
        query_embedding=query_embedding,
        n_results=n_results,
        where=filters if filters else None,
    )
    retrieval_ms = round((time.time() - t_retrieval) * 1000, 1)
    logger.info(f"Retrieved {len(retrieved)} experiences in {retrieval_ms}ms")

    # ── Step 4: Build context + prompt ────────────────────────────
    context = _build_context(retrieved)

    user_message = f"""Student question: {query}

Relevant placement experiences from the archive:
{context}

Please answer the student's question based only on the experiences above."""

    # ── Step 5: Gemini generation ────────────────────────────────
    t_llm = time.time()
    try:
        _ensure_gemini_initialized()
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=SYSTEM_PROMPT,
        )
        response = model.generate_content(user_message)
        answer = response.text.strip()
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        # Graceful fallback — return a grounded summary from retrieved sources.
        answer = _fallback_answer_from_retrieval(retrieved)
    llm_ms = round((time.time() - t_llm) * 1000, 1)

    # ── Step 6: Build source citations ───────────────────────────
    sources = [
        {
            "doc_id":     r.get("doc_id", ""),
            "citation":   _format_source(r["metadata"]),
            "similarity": r["similarity"],
            "company":    r["metadata"].get("company", ""),
            "role":       r["metadata"].get("role", ""),
            "roundType":  r["metadata"].get("roundType", ""),
            "year":       _normalize_year(r["metadata"].get("year")),
        }
        for r in retrieved
    ]

    total_ms = round((time.time() - start_total) * 1000, 1)

    result = {
        "answer":       answer,
        "sources":      sources,
        "cached":       False,
        "query":        query,
        "retrieval_ms": retrieval_ms,
        "llm_ms":       llm_ms,
        "total_ms":     total_ms,
        "source_count": len(sources),
    }

    # ── Step 7: Cache the response ────────────────────────────────
    if use_cache and len(retrieved) > 0:
        _set_cached(cache_key, result)

    logger.info(
        f"RAG complete in {total_ms}ms "
        f"(retrieval: {retrieval_ms}ms, llm: {llm_ms}ms, sources: {len(sources)})"
    )
    return result
