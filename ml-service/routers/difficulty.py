"""
Difficulty Prediction Router

POST /difficulty
- Accepts company, round_type, topics, + engagement signals
- Returns difficulty (1-5) with SHAP explainability
- Falls back to rule-based if model not loaded
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
import logging

from models.schemas import DifficultyRequest, DifficultyResponse, SHAPValue
from services.difficulty import (
    predict_difficulty,
    difficulty_model_ready,
    encode_inputs,
)

router = APIRouter(prefix="/difficulty", tags=["difficulty"])
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────
# POST /difficulty
# ─────────────────────────────────────────────────────────────────

@router.post("", response_model=DifficultyResponse)
async def predict_question_difficulty(
    request: DifficultyRequest,
    api_key: str = Header(None),
) -> DifficultyResponse:
    """
    Predict question difficulty with SHAP explainability.

    **Input:**
    - company: Company name (e.g., 'Amazon', 'Google')
    - round_type: Interview round (e.g., 'technical', 'system_design', 'hr')
    - topics: List of topic tags (e.g., ['arrays', 'dynamic_programming'])
    - skip_rate: Fraction of students who skipped (0-1)
    - avg_time_seconds: Average time spent (0+)
    - self_rated_difficulty: User's self-rating (1-5)
    - attempt_count: Number of attempts (0+)
    - raw_features: Optional direct feature vector (bypasses encoding)

    **Output:**
    - difficulty: Predicted difficulty level (1-5)
    - difficulty_label: Human-readable label (Easy, Medium, Hard, Expert)
    - probability: Confidence of predicted class
    - probabilities: Distribution across 5 classes
    - shap_values: Feature contributions ranked by magnitude
    - model_used: "xgboost" or "rule_based"
    - top_driver: Most influential feature in plain language

    **SHAP Explanation:**
    Each shap_value shows:
    - feature: Feature name (skip_rate, topic_difficulty_avg, etc.)
    - description: Human-readable description
    - raw_value: Actual feature value used
    - shap_value: Shapley value contribution (signed)
    - direction: "up" (increases difficulty) or "down" (decreases difficulty)
    - magnitude: Absolute importance in ranking
    """

    # Optional API key check (log if provided, but don't raise error)
    if api_key:
        logger.debug(f"Request with API key: {api_key[:10]}...")

    try:
        # ─ Build feature vector ─────────────────────────────────
        if request.raw_features:
            # Use raw features directly (for testing or direct API calls)
            features = request.raw_features
            logger.info("Using raw_features directly")
        else:
            # Encode high-level inputs to numeric features
            features = encode_inputs(
                company=request.company,
                round_type=request.round_type,
                topics=request.topics,
                skip_rate=request.skip_rate,
                avg_time_seconds=request.avg_time_seconds,
                self_rated_difficulty=request.self_rated_difficulty,
                attempt_count=request.attempt_count,
            )
            logger.info(f"Encoded features: {features}")

        # ─ Predict with SHAP ───────────────────────────────────
        result = predict_difficulty(**features)
        logger.info(f"Predicted difficulty: {result['difficulty']}")

        # ─ Format SHAP values as response objects ───────────────
        shap_values_response = []
        for shap in result.get("shap_values", []):
            shap_values_response.append(
                SHAPValue(
                    feature=shap["feature"],
                    description=shap["description"],
                    raw_value=shap["raw_value"],
                    shap_value=shap["shap_value"],
                    direction=shap["direction"],
                    magnitude=shap["magnitude"],
                )
            )

        # ─ Find top driver (most influential SHAP feature) ──────
        top_driver = "Unknown"
        if shap_values_response:
            top = shap_values_response[0]  # Already sorted by magnitude
            direction_text = "increased" if top.direction == "up" else "decreased"
            top_driver = f"{top.feature} {direction_text} difficulty by {top.magnitude:.3f}"

        # ─ Build response ──────────────────────────────────────
        return DifficultyResponse(
            success=True,
            difficulty=result["difficulty"],
            difficulty_label=result["difficulty_label"],
            probability=result["probability"],
            probabilities=result["probabilities"],
            shap_values=shap_values_response,
            model_used=result["model_used"],
            top_driver=top_driver,
        )

    except ValueError as e:
        logger.error(f"ValueError in difficulty prediction: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in difficulty prediction: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error predicting difficulty. Check logs.",
        )

# ─────────────────────────────────────────────────────────────────
# GET /difficulty/status
# ─────────────────────────────────────────────────────────────────

@router.get("/status", tags=["monitoring"])
async def difficulty_status():
    """Check if XGBoost model is loaded and ready."""
    ready = difficulty_model_ready()
    return {
        "success": True,
        "model_loaded": ready,
        "status": "ready" if ready else "loading",
    }
