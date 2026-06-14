# 🤖 Placement Archive — ML Service

FastAPI microservice powering all AI/ML features for The Placement Archive. Handles semantic search, auto-tagging, difficulty prediction, and RAG-based Q&A.

**Production URL:** `https://yagnesh08-placement-archive-ml.hf.space`
**Interactive Docs:** `https://yagnesh08-placement-archive-ml.hf.space/docs`

---

## Features

| Endpoint | Technology | Description |
|----------|-----------|-------------|
| `POST /embed` | sentence-transformers `all-MiniLM-L6-v2` | Generate 384-dim text embeddings |
| `POST /embed/batch` | sentence-transformers | Batch embed multiple documents |
| `POST /search` | ChromaDB | Vector similarity search |
| `POST /search/hybrid` | ChromaDB + threshold | Semantic search with min_similarity filter |
| `POST /autotag` | DistilBERT (fine-tuned) | Tag experience with round type + topics |
| `POST /difficulty` | XGBoost + SHAP | Predict difficulty 1–5 with explainability |
| `POST /rag` | ChromaDB + Gemini 2.5 Flash | Full RAG Q&A with citations |
| `POST /sync` | httpx + ChromaDB | Re-sync all experiences from MongoDB |
| `GET /health` | — | Service health + model load status |
| `GET /rag/health` | — | RAG pipeline status (Gemini + ChromaDB + Redis) |

---

## Architecture

```
FastAPI (main.py)
│
├── /embed      → services/embedding.py   (sentence-transformers all-MiniLM-L6-v2)
├── /search     → services/vector_store.py (ChromaDB similarity search)
├── /autotag    → services/tagger.py       (DistilBERT classifiers, rule-based fallback)
├── /difficulty → services/difficulty.py   (XGBoost + SHAP waterfall)
├── /rag        → services/rag.py          (ChromaDB retrieval + Gemini synthesis)
└── /sync       → routers/sync.py          (fetch from Node.js → embed → ChromaDB)
```

---

## Local Setup

### 1. Create virtual environment

```bash
cd ml-service
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create `ml-service/.env`:

```env
# API security
API_KEY=your_shared_api_key_with_node_backend

# Google Gemini (get free key at https://aistudio.google.com)
GOOGLE_API_KEY=your_google_api_key

# Redis for RAG response caching (Upstash recommended)
REDIS_URL=rediss://default:your_token@your-host.upstash.io:6379
REDIS_TOKEN=your_upstash_token

# Node.js backend URL (for /sync endpoint)
NODE_BACKEND_URL=http://localhost:5000

# Server
PORT=8000
ALLOWED_ORIGINS=http://localhost:5000,https://your-render-url.onrender.com
```

### 4. Start the service

```bash
uvicorn main:app --reload --port 8000
```

**Expected startup output:**
```
Step 1/4: Loading embedding model...
✅ Embedding model ready (all-MiniLM-L6-v2, dim=384)
Step 2/4: Initialising ChromaDB...
✅ ChromaDB ready (experiences: 0)
Step 3/4: Loading auto-tagging classifiers...
✅ Auto-tagging classifiers ready (or: rule-based fallback)
🚀 ML Service ready on port 8000
📖 Docs: http://localhost:8000/docs
```

---

## API Reference

### `POST /rag` — RAG Q&A Pipeline

Answer a placement question grounded in real student experiences.

**Request:**
```json
{
  "query": "What does Amazon ask in coding interviews?",
  "n_results": 5,
  "use_cache": true,
  "filters": {}
}
```

**Response:**
```json
{
  "success": true,
  "query": "What does Amazon ask in coding interviews?",
  "answer": "✅ Final Answer:\nBased on recent SDE-1 technical interviews...",
  "sources": [
    {
      "doc_id": "6a2e8d1d...",
      "citation": "Amazon · SDE-1 · Technical · 2024",
      "similarity": 0.72,
      "company": "Amazon",
      "role": "SDE-1",
      "roundType": "technical",
      "year": 2024
    }
  ],
  "source_count": 5,
  "cached": false,
  "retrieval_ms": 2.4,
  "llm_ms": 1851.0,
  "total_ms": 1867.4
}
```

**Notes:**
- Answers are **strictly grounded** — no general knowledge, only cited experiences
- Redis caches responses for 24 hours (set `use_cache: false` to bypass)
- Requires `GOOGLE_API_KEY` in environment
- Falls back to "no experiences found" message when ChromaDB is empty

### `POST /sync` — Re-populate ChromaDB

Fetches all experiences from the Node.js backend and re-indexes them into ChromaDB.

```json
// Request: empty body {}
// Response:
{
  "message": "Sync started in background",
  "status": "processing"
}
```

> ⚠️ **Important:** Hugging Face Spaces use ephemeral `/tmp` storage. ChromaDB is wiped on every Space restart. Always run `/sync` after a restart.

### `POST /embed` — Generate Embeddings

```json
// Request
{ "text": "LRU Cache implementation using HashMap and DoublyLinkedList" }

// Response
{ "embedding": [0.123, -0.456, ...], "dimension": 384, "model": "all-MiniLM-L6-v2" }
```

### `POST /autotag` — Auto-Tag Experience

```json
// Request
{
  "narrative": "First round was DSA focused — LRU cache, binary search...",
  "company": "Amazon",
  "role": "SDE-1"
}

// Response
{
  "roundType": "technical",
  "topics": ["data-structures", "algorithms", "dynamic-programming"],
  "confidence": 0.91,
  "method": "distilbert"
}
```

### `GET /rag/health` — RAG Pipeline Status

```json
{
  "status": "ok",
  "mode": "gemini_enhanced",
  "gemini_ready": true,
  "redis_ready": true,
  "chroma_ready": true,
  "experiences_indexed": 10
}
```

| `mode` | Meaning |
|--------|---------|
| `gemini_enhanced` | Full RAG with Gemini synthesis |
| `database_only` | ChromaDB retrieval works, but Gemini unavailable |

---

## Project Structure

```
ml-service/
├── main.py                  # FastAPI app, lifespan, CORS, router mounts
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container spec for Hugging Face Spaces
├── sync_chroma.py           # Standalone sync script (run locally)
├── config/
│   └── settings.py          # Pydantic settings (env var loading)
├── models/
│   ├── schemas.py           # Pydantic request/response models
│   ├── difficulty_model/    # xgb_model.joblib, scaler.joblib, feature_names.json
│   ├── round_type_classifier/  # Fine-tuned DistilBERT (6-class)
│   └── topic_classifier/    # Fine-tuned DistilBERT (51-label multi-label)
├── routers/
│   ├── health.py            # GET /health
│   ├── embed.py             # POST /embed, POST /embed/batch
│   ├── search.py            # POST /search, POST /search/hybrid
│   ├── autotag.py           # POST /autotag
│   ├── rag.py               # POST /rag, GET /rag/health
│   └── sync.py              # POST /sync (MongoDB → ChromaDB re-sync)
└── services/
    ├── embedding.py         # sentence-transformers model loading + inference
    ├── vector_store.py      # ChromaDB init, add, search, delete operations
    ├── tagger.py            # DistilBERT classifiers + rule-based fallback
    ├── rag.py               # Gemini integration + RAG pipeline
    └── difficulty.py        # XGBoost inference + SHAP value computation
```

---

## ChromaDB — Hugging Face Spaces Notes

Hugging Face Spaces provide **ephemeral storage** — only `/tmp` is writable, and it is wiped on every restart.

**This means:**
- ChromaDB data (stored in `/tmp/chroma_data`) is lost on every Space restart
- After every restart, you **must** call `POST /sync` to re-populate ChromaDB

**To trigger sync from PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://yagnesh08-placement-archive-ml.hf.space/sync" -Method Post -ContentType "application/json" -Body '{}'
```

**To trigger sync from curl:**
```bash
curl -X POST https://yagnesh08-placement-archive-ml.hf.space/sync
```

**To verify sync succeeded:**
```bash
curl https://yagnesh08-placement-archive-ml.hf.space/rag/health
# Should show: "experiences_indexed": 10 (or more)
```

---

## Gemini Configuration

The RAG service uses **Google Gemini 2.5 Flash** for answer synthesis.

1. Get a free API key at [https://aistudio.google.com](https://aistudio.google.com) (1M tokens/day free)
2. Set `GOOGLE_API_KEY` in your environment or Hugging Face Space secrets
3. The service auto-detects Gemini availability on startup

**For Hugging Face Spaces:**
1. Go to your Space → Settings → Variables and secrets
2. Add secret: `GOOGLE_API_KEY` = your key
3. Restart the Space

**RAG system prompt design (anti-hallucination):**
- Gemini is instructed to answer **only** from provided experience excerpts
- Must cite sources as `[Company · Role · Round · Year]`
- Returns "No experiences matching this query" when data is insufficient
- Confidence score (1–10) included in every answer

---

## Deployment — Hugging Face Spaces

The ML service is deployed as a **Docker Space** on Hugging Face.

**Required secrets (Space settings):**
```
GOOGLE_API_KEY    = your_google_gemini_api_key
API_KEY           = your_shared_api_key
REDIS_URL         = rediss://...upstash.io:6379
REDIS_TOKEN       = your_upstash_token
NODE_BACKEND_URL  = https://placement-archive-api.onrender.com
```

The `Dockerfile` handles:
- Installing Python dependencies
- Setting `/tmp` cache directories for HF/transformers
- Starting uvicorn on port 7860 (HF Spaces default)

---

## Running Tests

```bash
# Activate venv first
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=. --cov-report=term-missing
```

---

## Dependencies Summary

| Package | Purpose |
|---------|---------|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `sentence-transformers` | `all-MiniLM-L6-v2` embeddings |
| `chromadb` | Vector database |
| `google-generativeai` | Gemini 2.5 Flash RAG synthesis |
| `transformers` | DistilBERT auto-tagging |
| `xgboost` | Difficulty prediction |
| `shap` | SHAP explainability values |
| `redis` | Response caching (Upstash) |
| `httpx` | Async HTTP client (for /sync) |
| `pydantic-settings` | Environment variable loading |