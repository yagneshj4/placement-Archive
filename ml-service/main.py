import os
import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys

# ── Force cache dirs to /tmp — the only writable path on HF Spaces ─────────
# (These override any different values that might come from .env)
os.environ.setdefault("HF_HOME", "/tmp/.cache/huggingface")
os.environ.setdefault("TRANSFORMERS_CACHE", "/tmp/.cache/huggingface/hub")
os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", "/tmp/.cache/sentence_transformers")
os.environ.setdefault("XDG_CACHE_HOME", "/tmp/.cache")

# Keep startup logs focused by reducing TensorFlow/oneDNN noise from transitive deps.
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
warnings.filterwarnings("ignore", message=".*tf.losses.sparse_softmax_cross_entropy.*")
warnings.filterwarnings("ignore", category=FutureWarning, module="google")

from config.settings import settings
from services.embedding import load_model
from services.vector_store import init_chroma
from services.tagger import load_taggers
from services.difficulty import load_difficulty_model
from routers import health, embed, search, autotag, rag, difficulty, sync

# ── Logging setup ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ── Lifespan: load model + DB on startup, clean up on shutdown ───
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────
    logger.info("=" * 50)
    logger.info(f"Starting {settings.app_name}")
    logger.info("=" * 50)

    # Load sentence-transformer model (downloads ~90MB on first run)
    logger.info("Step 1/4: Loading embedding model...")
    load_model()
    logger.info("✅ Embedding model ready")

    # Initialise ChromaDB persistent storage
    logger.info("Step 2/4: Initialising ChromaDB...")
    init_chroma()
    logger.info("✅ ChromaDB ready")

    # Load auto-tagging classifiers (distilBERT models)
    logger.info("Step 3/4: Loading auto-tagging classifiers...")
    taggers_loaded = load_taggers()
    if taggers_loaded:
        logger.info("✅ Auto-tagging classifiers ready")
    else:
        logger.warning("⚠️ Auto-tagging classifiers not loaded; /autotag will use rule-based fallback")

    # Load XGBoost difficulty prediction model (optional)
    logger.info("Step 4/4: Loading difficulty prediction model...")
    try:
        load_difficulty_model()
        logger.info("✅ Difficulty model ready (XGBoost)")
    except Exception as e:
        logger.warning(f"⚠️ Difficulty model not loaded: {e} (will use rule-based fallback)")

    logger.info("=" * 50)
    logger.info(f"🚀 ML Service ready on port {settings.port}")
    logger.info(f"📖 Docs: http://localhost:{settings.port}/docs")
    logger.info("=" * 50)

    yield  # Application runs here

    # ── Shutdown ──────────────────────────────────────────────
    logger.info("Shutting down ML service...")

# ── FastAPI app ──────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    description="Embedding and semantic search service for The Placement Archive",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",      # Swagger UI at /docs
    redoc_url="/redoc",    # ReDoc at /redoc
    redirect_slashes=False, # FIX: Don't redirect POST /rag to GET /rag/
)

# ── CORS — allow Node.js backend to call this service ───────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "https://your-railway-domain.railway.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Mount routers ────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(embed.router)
app.include_router(search.router)
app.include_router(autotag.router)
app.include_router(rag.router)
app.include_router(difficulty.router)
app.include_router(sync.router)

# ── Root endpoint ────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": settings.app_name,
        "status": "running",
        "endpoints": {
            "health": "GET /health",
            "embed":  "POST /embed",
            "batch":  "POST /embed/batch",
            "search": "POST /search",
            "autotag": "POST /autotag",
            "difficulty": "POST /difficulty",
            "rag": "POST /rag",
            "sync": "POST /sync",
            "docs":   "GET /docs",
        }
    }