"""
FastAPI router for auto-tagging placement experiences.

Endpoint: POST /autotag
Request: {text: str, experience_id: str}
Response: {success: bool, experience_id: str, tags: {...}, model_used: str}
"""
from fastapi import APIRouter, Header, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Optional
import time
from services.tagger import tag_experience

router = APIRouter(prefix="/autotag", tags=["autotag"])

# ── Request/Response Models ────────────────────────────────────────
class AutoTagRequest(BaseModel):
    text: str = Field(..., min_length=20, description="Experience narrative (min 20 chars)")
    experience_id: Optional[str] = Field(None, description="MongoDB ObjectId or unique ID")

class TagsResponse(BaseModel):
    company: str
    role: str
    roundType: str
    roundTypeConfidence: float
    topics: list[str]
    difficulty: int
    keywords: list[str]

class AutoTagResponse(BaseModel):
    success: bool
    experience_id: str
    tags: Optional[TagsResponse] = None
    model_used: str
    error: Optional[str] = None
    processing_time_ms: Optional[float] = None

# ── API Key Validation ─────────────────────────────────────────────
from services.tagger import load_taggers

VALID_API_KEY = "ml-service-dev-key"

async def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != VALID_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return x_api_key

# ── Endpoints ──────────────────────────────────────────────────────

@router.post("/", response_model=AutoTagResponse)
async def autotag_experience(
    request: AutoTagRequest,
    api_key: str = Header(None, alias="X-API-Key", description="API Key")
):
    """
    Auto-tag a placement experience using ML + rule-based extraction.
    
    **Request:**
    ```json
    {
        "text": "Amazon SDE-1 interview...",
        "experience_id": "507f1f77bcf86cd799439011"
    }
    ```
    
    **Response:**
    ```json
    {
        "success": true,
        "experience_id": "507f1f77bcf86cd799439011",
        "tags": {
            "company": "Amazon",
            "role": "SDE",
            "roundType": "technical",
            "roundTypeConfidence": 0.87,
            "topics": ["DSA", "System Design"],
            "difficulty": 4,
            "keywords": ["LRU", "Cache", "Interview"]
        },
        "model_used": "full",
        "processing_time_ms": 234.5
    }
    ```
    """
    # Verify API key
    if not api_key or api_key != VALID_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key header")
    
    start_time = time.time()
    
    # Call tagger
    result = tag_experience(request.text, request.experience_id)
    
    processing_time = (time.time() - start_time) * 1000  # ms
    
    return AutoTagResponse(
        success=result["success"],
        experience_id=result["experience_id"],
        tags=result.get("tags"),
        model_used=result["model_used"],
        error=result.get("error"),
        processing_time_ms=round(processing_time, 2),
    )

# ── Health Check ───────────────────────────────────────────────────

@router.get("/health")
async def autotag_health():
    """Check if auto-tagging models are loaded."""
    from services.tagger import _round_model, _topic_model
    
    return {
        "status": "healthy" if _round_model and _topic_model else "models_not_loaded",
        "round_type_loaded": _round_model is not None,
        "topic_classifier_loaded": _topic_model is not None,
    }
