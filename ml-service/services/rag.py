"""
RAG (Retrieval-Augmented Generation) pipeline for The Placement Archive.
100% Database-driven — answers come ONLY from ChromaDB stored experiences.

Flow:
  1. Check Redis cache — return cached answer if hit
  2. Encode query with sentence-transformers
  3. Retrieve top-k similar experiences from ChromaDB
  4. Extract company from query and strictly validate against results
  5. Build a structured, grounded answer from retrieved data
  6. Optionally enhance with Gemini (if API key available)
  7. Cache the response in Redis
  8. Return answer + source citations
"""
import hashlib
import json
import logging
import os
import re
import time
from typing import Optional

import warnings as _warnings
try:
    with _warnings.catch_warnings():
        _warnings.filterwarnings("ignore", category=FutureWarning, module="google")
        import google.generativeai as genai
    _genai_available = True
except ImportError:
    _genai_available = False

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

# ── Gemini client initialization (OPTIONAL enhancement) ──────────
_gemini_initialized = False
_gemini_available = False

def _try_init_gemini():
    """Try to initialize Gemini. If it fails, we still work fine without it."""
    global _gemini_initialized, _gemini_available
    if _gemini_initialized:
        return _gemini_available
    
    _gemini_initialized = True
    api_key = settings.google_api_key or os.environ.get("GOOGLE_API_KEY", "")
    
    if not api_key or not _genai_available:
        logger.info("ℹ️ Gemini not available — using database-only mode (100% reliable)")
        _gemini_available = False
        return False
    
    try:
        genai.configure(api_key=api_key)
        # Quick test to verify key works
        model = genai.GenerativeModel(model_name=settings.gemini_model)
        model.generate_content("test", generation_config={"max_output_tokens": 5})
        _gemini_available = True
        logger.info(f"✅ Gemini API configured with model: {settings.gemini_model}")
        return True
    except Exception as e:
        logger.warning(f"Gemini initialization failed ({e}) — using database-only mode")
        _gemini_available = False
        return False


# ── Cache helpers ────────────────────────────────────────────────

def _cache_key(query: str, filters: dict) -> str:
    """Generate a deterministic cache key from query + filters."""
    payload = json.dumps({"q": query.lower().strip(), "f": filters}, sort_keys=True)
    return f"rag:v2:{hashlib.sha256(payload.encode()).hexdigest()[:16]}"

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


# ── Company extraction from query ────────────────────────────────

KNOWN_COMPANIES = [
    "amazon", "google", "microsoft", "tcs", "infosys", "accenture",
    "cognizant", "wipro", "goldman sachs", "jp morgan", "morgan stanley",
    "apple", "meta", "netflix", "adobe", "oracle", "cisco", "intel", "ibm",
    "uber", "flipkart", "paytm", "swiggy", "zomato", "ola", "razorpay",
    "phonepe", "byju", "unacademy", "atlassian", "salesforce", "deloitte",
    "capgemini", "hcl", "tech mahindra", "mindtree", "mphasis", "zoho",
    "freshworks", "samsung", "qualcomm", "nvidia", "tesla", "twitter",
    "spotify", "stripe", "airbnb", "linkedin", "snap",
]

def _extract_company_from_query(query: str) -> Optional[str]:
    """Extract a company name from the user's query if mentioned."""
    query_lower = query.lower()
    for company in KNOWN_COMPANIES:
        if company in query_lower:
            return company
    return None


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


# ── Smart Database-Only Answer Builder ────────────────────────────

def _build_database_answer(query: str, retrieved: list) -> str:
    """
    Build a high-quality, structured answer using ONLY retrieved database records.
    No LLM needed — this is pure data extraction and intelligent formatting.
    """
    if not retrieved:
        return "No experiences matching this query are in the archive yet. Try different keywords."

    # Step 1: Extract the company from the query
    asked_company = _extract_company_from_query(query)

    # Step 2: Collect metadata from all retrieved results
    companies = []
    rounds = []
    previews = []
    citations = []
    years = []

    for result in retrieved:
        meta = result.get("metadata") or {}
        similarity = result.get("similarity", 0)
        company = (meta.get("company") or "").strip()
        round_type = (meta.get("roundType") or "").strip()
        preview = (meta.get("narrative_preview") or "").strip()
        year = meta.get("year")
        citation = _format_source(meta)

        if company:
            companies.append(company.lower())
        if round_type:
            rounds.append(round_type.replace("_", " ").title())
        if preview:
            previews.append(preview)
        if citation and citation != "Unknown source":
            citations.append(citation)
        if year:
            years.append(str(year))

    # Step 3: STRICT COMPANY VALIDATION
    # If user asked about a specific company, check if we actually have data for it
    if asked_company:
        matching_results = [
            r for r in retrieved
            if asked_company in ((r.get("metadata") or {}).get("company") or "").lower()
        ]
        if not matching_results:
            return (
                f"No experiences for \"{asked_company.title()}\" are in the archive yet. "
                f"We currently have experiences from {', '.join(sorted(set(c.title() for c in companies[:3])))}, "
                f"and more. Try searching for one of those, or be the first to add your "
                f"\"{asked_company.title()}\" experience!"
            )
        # Filter to only matching results for focused answer
        retrieved = matching_results
        # Re-extract from filtered results
        companies = []
        rounds = []
        previews = []
        citations = []
        years = []
        for result in retrieved:
            meta = result.get("metadata") or {}
            company = (meta.get("company") or "").strip()
            round_type = (meta.get("roundType") or "").strip()
            preview = (meta.get("narrative_preview") or "").strip()
            year = meta.get("year")
            citation = _format_source(meta)
            if company:
                companies.append(company.lower())
            if round_type:
                rounds.append(round_type.replace("_", " ").title())
            if preview:
                previews.append(preview)
            if citation and citation != "Unknown source":
                citations.append(citation)
            if year:
                years.append(str(year))

    # Step 4: Build the answer from real data
    unique_companies = sorted(set(c.title() for c in companies))
    unique_rounds = sorted(set(rounds))
    unique_years = sorted(set(years), reverse=True)
    unique_citations = []
    for c in citations:
        if c not in unique_citations:
            unique_citations.append(c)

    company_text = ", ".join(unique_companies[:5]) if unique_companies else "various companies"
    n_experiences = len(retrieved)

    # Build structured answer
    answer_parts = []

    # Opening line
    answer_parts.append(
        f"✔ Based on {n_experiences} verified experience{'s' if n_experiences != 1 else ''} "
        f"from {company_text}:"
    )

    # Round types info
    if unique_rounds:
        answer_parts.append(
            f"\n\n📊 Interview rounds covered: {', '.join(unique_rounds)}."
        )

    # Key insights from narrative previews
    if previews:
        answer_parts.append("\n\n📝 Key insights from students:")
        for i, preview in enumerate(previews[:3], 1):
            # Take first 150 chars of each preview for a concise summary
            snippet = preview[:200].strip()
            if len(preview) > 200:
                snippet = snippet.rsplit(" ", 1)[0] + "..."
            answer_parts.append(f"\n  {i}. \"{snippet}\"")

    # Year info
    if unique_years:
        answer_parts.append(f"\n\n📅 Data from: {', '.join(unique_years[:3])}")

    # Citations
    if unique_citations:
        citation_text = " ".join([f"[{c}]" for c in unique_citations[:5]])
        answer_parts.append(f"\n\n🔗 Sources: {citation_text}")

    # Confidence
    avg_similarity = sum(r.get("similarity", 0) for r in retrieved) / max(len(retrieved), 1)
    confidence = min(10, max(1, round(avg_similarity * 10)))
    answer_parts.append(f"\n\nConfidence: {confidence}/10")

    return "".join(answer_parts)


# ── Gemini Enhancement (Optional) ─────────────────────────────────

SYSTEM_PROMPT = """You are an expert AI assistant designed to provide ONLY accurate, grounded, and verifiable answers.

STRICT RULES:

1. SOURCE-GROUNDED ANSWERS
- Answer ONLY from the provided data/context.
- Do NOT guess or assume.
- If data is insufficient, say: "Not enough reliable information available."
- CRITICAL: If the student asks about a specific company, and the provided experiences do not match, you MUST refuse to answer. Say EXACTLY this: "No experiences matching this query are in the archive yet. Try different keywords."

2. NO HALLUCINATIONS
- Never fabricate facts, companies, experiences, or numbers.
- If unsure → explicitly mention uncertainty.

3. STRUCTURED OUTPUT FORMAT
Always respond in this format:

✔ Final Answer:
<clear, concise answer>

📊 Supporting Evidence:
- Point 1
- Point 2
- Point 3

⚠️ Assumptions (if any):
- Mention if something is inferred

Confidence: X/10
(Based only on data reliability)"""


def _try_gemini_answer(query: str, retrieved: list) -> Optional[str]:
    """Try to get a Gemini-enhanced answer. Returns None if unavailable."""
    if not _gemini_available or not _genai_available:
        return None

    try:
        # Build context from retrieved experiences
        context_blocks = []
        for i, result in enumerate(retrieved, 1):
            meta = result.get("metadata") or {}
            source = _format_source(meta)
            similarity = result.get("similarity", 0)
            preview = meta.get("narrative_preview", "No details available.")
            context_blocks.append(
                f"[Experience {i} | Source: {source} | Match: {similarity:.0%}]\n{preview}\n"
            )
        context = "\n---\n".join(context_blocks) if context_blocks else "No relevant experiences found."

        user_message = f"""Student question: {query}

Relevant placement experiences from the archive:
{context}

Please answer the student's question based only on the experiences above."""

        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=SYSTEM_PROMPT,
        )
        response = model.generate_content(user_message)
        return response.text.strip()
    except Exception as e:
        logger.warning(f"Gemini enhancement failed: {e}")
        return None


# ── Main RAG function ─────────────────────────────────────────────

def rag_query(
    query: str,
    filters: Optional[dict] = None,
    n_results: int = None,
    use_cache: bool = True,
) -> dict:
    """
    Full RAG pipeline — takes a natural language question, retrieves relevant
    experiences, and returns a grounded, cited answer.

    Works 100% without Gemini — uses database-only answer building.
    If Gemini is available, it enhances the answer quality.
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

    # ── Step 4: Build answer ──────────────────────────────────────
    t_llm = time.time()

    # Try Gemini first (optional enhancement)
    _try_init_gemini()
    answer = None
    if _gemini_available:
        answer = _try_gemini_answer(query, retrieved)
        if answer:
            logger.info("✅ Gemini-enhanced answer generated")

    # Fallback: Build answer from database only (always works)
    if not answer:
        answer = _build_database_answer(query, retrieved)
        logger.info("📊 Database-only answer generated")

    llm_ms = round((time.time() - t_llm) * 1000, 1)

    # ── Step 5: Build source citations ───────────────────────────
    sources = []
    for r in retrieved:
        meta = r.get("metadata") or {}
        sources.append({
            "doc_id":     r.get("doc_id", ""),
            "citation":   _format_source(meta),
            "similarity": r.get("similarity", 0),
            "company":    meta.get("company", ""),
            "role":       meta.get("role", ""),
            "roundType":  meta.get("roundType", ""),
            "year":       _normalize_year(meta.get("year")),
        })

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

    # ── Step 6: Cache the response ────────────────────────────────
    if use_cache and len(retrieved) > 0:
        _set_cached(cache_key, result)

    logger.info(
        f"RAG complete in {total_ms}ms "
        f"(retrieval: {retrieval_ms}ms, llm: {llm_ms}ms, sources: {len(sources)})"
    )
    return result
