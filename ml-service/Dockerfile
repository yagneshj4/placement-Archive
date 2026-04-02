FROM python:3.11-slim

# ── Environment ───────────────────────────────────────────────────
ENV PORT=7860 \
    HOST=0.0.0.0 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # Redirect ALL model/hub caches to /tmp (the ONLY writable dir on HF Spaces)
    HF_HOME=/tmp/.cache/huggingface \
    TRANSFORMERS_CACHE=/tmp/.cache/huggingface/hub \
    SENTENCE_TRANSFORMERS_HOME=/tmp/.cache/sentence_transformers \
    XDG_CACHE_HOME=/tmp/.cache

# ── System deps ─────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl \
  && rm -rf /var/lib/apt/lists/*

# ── Create non-root user (HF Spaces runs as uid 1000) ───────────
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# ── Working directory ────────────────────────────────────────────
WORKDIR $HOME/app

# ── Install Python deps ──────────────────────────────────────────
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ── Copy application code ────────────────────────────────────────
COPY --chown=user . .

# ── Pre-bake the embedding model into the image ──────────────────
# This avoids slow downloads on every cold start and removes the
# unauthenticated HF Hub warning that can block startup.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# ── Chroma data directory (writable by uid 1000) ─────────────────
RUN mkdir -p $HOME/app/chroma_data

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--timeout-keep-alive", "300"]
