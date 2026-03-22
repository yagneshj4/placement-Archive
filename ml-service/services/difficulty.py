"""
XGBoost difficulty prediction service with SHAP explainability.
Loaded once at startup — all requests share the model instance.
"""
import json
import logging
import warnings
import numpy as np
import joblib
import shap
from pathlib import Path
from sklearn.exceptions import InconsistentVersionWarning

logger = logging.getLogger(__name__)

MODEL_DIR = Path("models/difficulty_model")

# ── Singleton model handles ──────────────────────────────────────
_model   = None
_scaler  = None
_explainer = None
_feature_names = None
_model_loaded  = False

DIFFICULTY_LABELS = {
    1: "Easy",
    2: "Easy-Medium",
    3: "Medium",
    4: "Hard",
    5: "Expert",
}

FEATURE_DESCRIPTIONS = {
    "skip_rate":             "Skip rate",
    "avg_time_seconds":      "Avg time spent",
    "self_rated_difficulty": "Self-rated difficulty",
    "attempt_count":         "Attempt count",
    "topic_difficulty_avg":  "Topic difficulty",
    "round_type_enc":        "Round type",
    "company_tier":          "Company tier",
}

def load_difficulty_model():
    """Load XGBoost model, scaler, and SHAP explainer. Called once at startup."""
    global _model, _scaler, _explainer, _feature_names, _model_loaded

    if _model_loaded:
        return

    if not (MODEL_DIR / "xgb_model.joblib").exists():
        logger.warning(
            "Difficulty model not found. "
            "Run: python training/generate_training_data.py && python training/train_difficulty.py"
        )
        _model_loaded = True
        return

    logger.info("Loading XGBoost difficulty model...")
    with warnings.catch_warnings():
        # These are expected when local package versions differ from training env.
        warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
        warnings.filterwarnings("ignore", category=UserWarning, module="pickle")
        _model = joblib.load(MODEL_DIR / "xgb_model.joblib")
        _scaler = joblib.load(MODEL_DIR / "scaler.joblib")

    with open(MODEL_DIR / "feature_names.json") as f:
        meta = json.load(f)
    _feature_names = meta["features"]

    # SHAP TreeExplainer — fast, exact Shapley values for tree models
    background = np.zeros((1, len(_feature_names)))
    background_scaled = _scaler.transform(background)
    _explainer = shap.TreeExplainer(_model, data=background_scaled)

    _model_loaded = True
    logger.info(f"✅ Difficulty model loaded — CV accuracy: {meta.get('cv_accuracy', 'N/A'):.3f}")

def difficulty_model_ready() -> bool:
    return _model_loaded and _model is not None

def _build_feature_vector(
    skip_rate: float,
    avg_time_seconds: float,
    self_rated_difficulty: float,
    attempt_count: int,
    topic_difficulty_avg: float,
    round_type_enc: float,
    company_tier: float,
) -> np.ndarray:
    """Build feature vector in the exact order the model expects."""
    return np.array([[
        skip_rate,
        avg_time_seconds,
        self_rated_difficulty,
        attempt_count,
        topic_difficulty_avg,
        round_type_enc,
        company_tier,
    ]])

def predict_difficulty(
    skip_rate: float,
    avg_time_seconds: float,
    self_rated_difficulty: float,
    attempt_count: int,
    topic_difficulty_avg: float,
    round_type_enc: float,
    company_tier: float,
) -> dict:
    """
    Predict question difficulty and generate SHAP explanation.

    Returns:
        difficulty:        int 1-5
        difficulty_label:  str "Easy" / "Medium" / "Hard" / "Expert"
        probability:       float confidence of predicted class
        probabilities:     list[float] probability per class (5 values)
        shap_values:       list[dict] feature contributions
        model_used:        "xgboost" or "rule_based"
    """
    # Fallback: if model not loaded, use rule-based estimate
    if not difficulty_model_ready():
        estimated = int(np.clip(round(
            topic_difficulty_avg * 0.5 + round_type_enc * 0.3 + company_tier * 0.2
        ), 1, 5))
        return {
            "difficulty":       estimated,
            "difficulty_label": DIFFICULTY_LABELS[estimated],
            "probability":      0.6,
            "probabilities":    [0.0] * 5,
            "shap_values":      [],
            "model_used":       "rule_based",
        }

    X = _build_feature_vector(
        skip_rate, avg_time_seconds, self_rated_difficulty,
        attempt_count, topic_difficulty_avg, round_type_enc, company_tier,
    )
    X_scaled = _scaler.transform(X)

    # ── XGBoost prediction ────────────────────────────────────────
    # predict returns 0-indexed class, add 1 to get 1-5
    pred_class  = int(_model.predict(X_scaled)[0]) + 1
    pred_proba  = _model.predict_proba(X_scaled)[0]
    confidence  = float(pred_proba[pred_class - 1])

    # ── SHAP explanation ──────────────────────────────────────────
    shap_vals = _explainer.shap_values(X_scaled)

    # shap_vals has shape (n_classes, n_samples, n_features)
    # We want values for the predicted class
    if isinstance(shap_vals, list):
        # Multi-class: shap_vals is list of (n_samples, n_features)
        class_shap = shap_vals[pred_class - 1][0]
    else:
        class_shap = shap_vals[0]

    # Build human-readable SHAP breakdown
    shap_breakdown = []
    
    # Ensure class_shap is flattened to 1D
    class_shap_flat = np.asarray(class_shap).flatten()
    raw_vals_flat = np.asarray(X[0]).flatten()
    
    for i, feat in enumerate(_feature_names):
        # Extract scalar values safely
        shap_val = float(class_shap_flat[i])
        raw_val = float(raw_vals_flat[i])

        shap_breakdown.append({
            "feature":     feat,
            "description": FEATURE_DESCRIPTIONS.get(feat, feat),
            "raw_value":   round(raw_val, 3),
            "shap_value":  round(shap_val, 4),
            "direction":   "up" if shap_val > 0 else "down",
            "magnitude":   abs(round(shap_val, 4)),
        })

    # Sort by absolute SHAP value — most influential first
    shap_breakdown.sort(key=lambda x: -x["magnitude"])

    return {
        "difficulty":       pred_class,
        "difficulty_label": DIFFICULTY_LABELS[pred_class],
        "probability":      round(confidence, 3),
        "probabilities":    [round(float(p), 3) for p in pred_proba],
        "shap_values":      shap_breakdown,
        "model_used":       "xgboost",
    }


# ── Helper: encode categorical features ──────────────────────────

ROUND_TYPE_ENC = {
    "coding": 3.0, "technical": 3.2, "system_design": 4.2,
    "hr": 1.5, "aptitude": 1.8, "managerial": 2.0, "group_discussion": 1.8,
}

COMPANY_TIER_ENC = {
    "google": 3.0, "amazon": 3.0, "microsoft": 3.0, "meta": 3.0, "apple": 3.0,
    "flipkart": 2.5, "razorpay": 2.5, "swiggy": 2.5, "uber": 2.5,
    "jp morgan": 2.8, "goldman sachs": 2.8, "morgan stanley": 2.8,
    "infosys": 1.5, "tcs": 1.5, "wipro": 1.5, "hcl": 1.5,
    "cognizant": 1.5, "accenture": 1.8, "ibm": 2.0,
}

TOPIC_DIFFICULTY_ENC = {
    "DSA": 3.0, "Graphs": 4.2, "Dynamic Programming": 4.3,
    "System Design": 4.0, "Distributed Systems": 4.5,
    "LLD": 3.2, "HLD": 4.0, "Algorithms": 3.8,
    "Multithreading": 4.0, "Java": 2.8, "DBMS": 2.5,
    "Arrays": 2.5, "Strings": 2.3, "Binary Trees": 3.0,
    "Heaps": 3.5, "Recursion": 3.2, "HR": 1.5,
    "Behavioral": 1.5, "Aptitude": 1.5, "OOP": 2.5,
}

def encode_inputs(
    company: str,
    round_type: str,
    topics: list,
    skip_rate: float = 0.2,
    avg_time_seconds: float = 120,
    self_rated_difficulty: float = 3.0,
    attempt_count: int = 15,
) -> dict:
    """Encode raw string fields into numeric features for the model."""
    topic_scores = [TOPIC_DIFFICULTY_ENC.get(t, 3.0) for t in (topics or [])]
    topic_avg = float(np.mean(topic_scores)) if topic_scores else 3.0

    return {
        "skip_rate":             skip_rate,
        "avg_time_seconds":      avg_time_seconds,
        "self_rated_difficulty": self_rated_difficulty,
        "attempt_count":         attempt_count,
        "topic_difficulty_avg":  topic_avg,
        "round_type_enc":        ROUND_TYPE_ENC.get(round_type, 3.0),
        "company_tier":          COMPANY_TIER_ENC.get(company.lower(), 2.0),
    }
