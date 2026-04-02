from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / '.env'

# Manually load .env to ensure google_api_key is available
load_dotenv(str(ENV_FILE))

class Settings(BaseSettings):
    # Server
    app_name: str = "Placement Archive ML Service"
    debug: bool = False
    port: int = 8001

    # Model
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    # ChromaDB  — must write to /tmp on HF Spaces (read-only container filesystem)
    chroma_persist_dir: str = "/tmp/chroma_data"
    chroma_collection_experiences: str = "experiences"
    chroma_collection_questions: str = "questions"

    # Node.js backend (for health checks)
    node_backend_url: str = "https://placement-archive-api.onrender.com"

    # Security
    api_key: str = "ml-service-dev-key"

    # Gemini API
    google_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    gemini_max_tokens: int = 500
    gemini_temperature: float = 0.1

    # RAG
    rag_top_k: int = 5                  # retrieve top 5 experiences per query
    rag_cache_ttl_seconds: int = 86400  # 24 hour cache

    # Redis
    redis_url: str = ""

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

# Cache — settings are loaded once at startup
@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()