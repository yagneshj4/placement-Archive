"""
Inference service for auto-tagging placement experiences.
Combines ML classifiers with rule-based extraction.

Usage:
    from services.tagger import tag_experience
    result = tag_experience(text)
    # Returns: {company, role, roundType, topics, difficulty, keywords}
"""
import re
import pickle
import numpy as np
import torch
import logging
from typing import Optional
from pathlib import Path
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

logger = logging.getLogger(__name__)

# ── Global State ───────────────────────────────────────────────────
_round_model = None
_round_tokenizer = None
_topic_model = None
_topic_tokenizer = None
_mlb = None

MODEL_WEIGHT_FILES = (
    "pytorch_model.bin",
    "model.safetensors",
    "tf_model.h5",
    "model.ckpt.index",
    "flax_model.msgpack",
)

ROUND_TYPES = [
    "coding", "technical", "hr",
    "system_design", "managerial",
    "aptitude"
]

# ── Company Database ───────────────────────────────────────────────
COMPANIES = {
    "FAANG": ["amazon", "apple", "facebook", "google", "netflix"],
    "Finance": ["jpmorgan", "morgan stanley", "goldman sachs", "citadel", "jane street"],
    "Indian IT": ["tcs", "infosys", "cognizant", "accenture", "wipro", "hcl", "mindtree"],
    "Startups": ["uber", "swiggy", "paytm", "razorpay", "phonpe", "groww", "juspay"],
    "Other": ["microsoft", "flipkart", "oracle", "deloitte", "adobe", "freshworks",
              "airtel", "cerner", "ibm", "samsung", "cisco", "schlumberger", "epam",
              "atlassian", "postman"]
}

ALL_COMPANIES = {name for cat in COMPANIES.values() for name in cat}

# ── Difficulty Weights ─────────────────────────────────────────────
TOPIC_DIFFICULTY_MAP = {
    # Hard topics (5)
    "system design": 5, "distributed systems": 5, "scalability": 5,
    "himd": 5, "hld": 5, "lld": 5,
    
    # Medium-Hard (4)
    "dsa": 4, "graphs": 4, "dynamic programming": 4,
    "binary search": 4, "recursion": 4, "backtracking": 4,
    "algorithms": 4, "tree": 4, "linked list": 4,
    "java": 4, "c/c++": 4, "python": 4,
    
    # Medium (3)
    "dbms": 3, "sql": 3, "os": 3, "networking": 3,
    "multithreading": 3, "threading": 3,
    "oop": 3, "design patterns": 3,
    "javascript": 3, "web development": 3,
    
    # Easy-Medium (2)
    "hr": 2, "behavioral": 2, "aptitude": 2,
    "reasoning": 2, "group discussion": 2,
    
    # Easy (1)
    "quantitative": 1, "verbal": 1,
}

ROUND_TYPE_DIFFICULTY = {
    "coding": 4.0,
    "technical": 4.0,
    "system_design": 5.0,
    "hr": 1.5,
    "managerial": 2.0,
    "aptitude": 2.0,
}

# ── Role Patterns ──────────────────────────────────────────────────
ROLE_PATTERNS = {
    r"sde|software.*engineer|developer": "SDE",
    r"devops|infrastructure|cloud": "DevOps Engineer",
    r"data\s*scientist|ml.*engineer|ai": "Data Scientist / ML Engineer",
    r"product.*manager|pm|program.*manager": "Product Manager",
    r"data.*engineer": "Data Engineer",
    r"qa|quality.*assurance|testing": "QA Engineer",
    r"security|infosec": "Security Engineer",
    r"frontend|ui.*engineer": "Frontend Engineer",
    r"backend|api": "Backend Engineer",
}

# ════════════════════════════════════════════════════════════════════
# MODEL LOADING
# ════════════════════════════════════════════════════════════════════

def load_taggers():
    """Initialize both taggers (called once at FastAPI startup)."""
    global _round_model, _round_tokenizer, _topic_model, _topic_tokenizer, _mlb
    
    models_dir = Path("models")
    round_dir = models_dir / "round_type_classifier"
    topic_dir = models_dir / "topic_classifier"

    def has_weights(model_dir: Path) -> bool:
        return any((model_dir / filename).exists() for filename in MODEL_WEIGHT_FILES)

    def load_round_model() -> bool:
        nonlocal round_dir
        global _round_model, _round_tokenizer
        if not has_weights(round_dir):
            logger.warning("Round-type classifier weights missing in %s", round_dir)
            return False

        _round_tokenizer = DistilBertTokenizerFast.from_pretrained(round_dir)
        _round_model = DistilBertForSequenceClassification.from_pretrained(round_dir)
        _round_model.eval()
        logger.info("Round-type classifier loaded")
        return True

    def load_topic_model() -> bool:
        nonlocal topic_dir
        global _topic_model, _topic_tokenizer, _mlb
        if not has_weights(topic_dir):
            logger.warning("Topic classifier weights missing in %s", topic_dir)
            return False

        _topic_tokenizer = DistilBertTokenizerFast.from_pretrained(topic_dir)
        _topic_model = DistilBertForSequenceClassification.from_pretrained(topic_dir)
        _topic_model.eval()

        mlb_path = topic_dir / "mlb.pkl"
        if not mlb_path.exists():
            logger.warning("Topic classifier label binarizer missing in %s", mlb_path)
            _topic_model = None
            _topic_tokenizer = None
            return False

        with open(mlb_path, "rb") as f:
            _mlb = pickle.load(f)

        logger.info("Topic classifier loaded")
        return True
    
    try:
        logger.info("Loading auto-tagging classifiers...")
        round_ok = load_round_model()
        topic_ok = load_topic_model()

        if round_ok and topic_ok:
            logger.info("Auto-tagging classifiers loaded successfully")
            return True

        logger.warning("Auto-tagging classifiers unavailable, falling back to rules")
        return False
    except Exception as e:
        logger.warning("Error loading taggers: %s", e)
        _round_model = None
        _round_tokenizer = None
        _topic_model = None
        _topic_tokenizer = None
        _mlb = None
        return False

def _check_taggers():
    """Ensure taggers are loaded."""
    if _round_model is None or _topic_model is None:
        raise RuntimeError("Taggers not loaded. Call load_taggers() first.")

# ════════════════════════════════════════════════════════════════════
# RULE-BASED EXTRACTORS
# ════════════════════════════════════════════════════════════════════

def _rule_extract_company(text: str) -> Optional[str]:
    """Extract company name from text using keyword matching."""
    text_lower = text.lower()
    
    for company in ALL_COMPANIES:
        if company in text_lower:
            return company.title()
    
    return None

def _rule_extract_role(text: str) -> Optional[str]:
    """Extract role name from text using regex patterns."""
    text_lower = text.lower()
    
    for pattern, role in ROLE_PATTERNS.items():
        if re.search(pattern, text_lower):
            return role
    
    return None

def _rule_based_round_type(text: str) -> str:
    """Fallback round type extraction using keywords."""
    text_lower = text.lower()
    
    rules = {
        "coding": [r"coding|hackerrank|leetcode|data structure|algorithm"],
        "technical": [r"technical|oops|system design|architecture"],
        "hr": [r"hr|human resource|culture|team|motivation|strength|weakness"],
        "system_design": [r"system design|scalability|distributed|microservice"],
        "managerial": [r"manage|lead|team|project|stakeholder"],
        "aptitude": [r"aptitude|quiz|reasoning|quantitative|verbal"],
    }
    
    for round_type, patterns in rules.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return round_type
    
    return "technical"  # default

def extract_keywords(text: str, n_keywords: int = 5) -> list:
    """Extract top keywords from text using simple TF-IDF approach."""
    # Simple heuristic: longer words appeared less are more significant
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    
    # Filter common words
    common_words = {"the", "and", "for", "that", "with", "from", "were", 
                   "have", "this", "would", "which", "their", "about"}
    words = [w for w in words if w not in common_words]
    
    # Count and sort
    from collections import Counter
    word_counts = Counter(words)
    top_words = [w for w, _ in word_counts.most_common(n_keywords)]
    
    return [w.capitalize() for w in top_words]

# ════════════════════════════════════════════════════════════════════
# ML PREDICTORS
# ════════════════════════════════════════════════════════════════════

def predict_round_type(text: str) -> tuple:
    """
    Predict round type using the trained classifier.
    Returns: (round_type: str, confidence: float)
    """
    _check_taggers()
    
    # Tokenize
    inputs = _round_tokenizer(
        text,
        truncation=True,
        max_length=256,
        padding="max_length",
        return_tensors="pt"
    )
    
    # Predict
    with torch.no_grad():
        outputs = _round_model(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()
        pred_id = np.argmax(probs)
        confidence = float(probs[pred_id])
    
    round_type = ROUND_TYPES[pred_id]
    return round_type, confidence

def predict_topics(text: str, threshold: float = 0.35) -> list:
    """
    Predict topics using the trained multi-label classifier.
    Returns: list of topic names with confidence >= threshold
    """
    _check_taggers()
    
    # Tokenize
    inputs = _topic_tokenizer(
        text,
        truncation=True,
        max_length=256,
        padding="max_length",
        return_tensors="pt"
    )
    
    # Predict
    with torch.no_grad():
        outputs = _topic_model(**inputs)
        logits = outputs.logits
        probs = torch.sigmoid(logits[0]).cpu().numpy()
    
    # Get topics above threshold
    topic_indices = np.where(probs >= threshold)[0]
    topics = []
    for idx in topic_indices:
        if idx < len(_mlb.classes_):
            topics.append(_mlb.classes_[idx])
    
    return topics or []

def estimate_difficulty(topics: list, round_type: str) -> int:
    """
    Estimate difficulty (1-5) based on topics and round type.
    """
    # Start with round type base difficulty
    base_difficulty = ROUND_TYPE_DIFFICULTY.get(round_type, 3.0)
    
    # Add topic difficulties
    topic_difficulties = []
    for topic in topics:
        diff = TOPIC_DIFFICULTY_MAP.get(topic.lower(), 3)
        topic_difficulties.append(diff)
    
    if topic_difficulties:
        avg_topic_diff = np.mean(topic_difficulties)
        final_difficulty = (base_difficulty + avg_topic_diff) / 2
    else:
        final_difficulty = base_difficulty
    
    # Clamp to 1-5 range
    return max(1, min(5, round(final_difficulty)))

# ════════════════════════════════════════════════════════════════════
# MAIN TAGGING FUNCTION
# ════════════════════════════════════════════════════════════════════

def tag_experience(text: str, experience_id: Optional[str] = None) -> dict:
    """
    Full auto-tagging pipeline.
    
    Args:
        text: Placement experience narrative
        experience_id: Optional MongoDB ObjectId for tracking
    
    Returns:
        {
            "success": bool,
            "experience_id": str,
            "tags": {
                "company": str,
                "role": str,
                "roundType": str,
                "roundTypeConfidence": float,
                "topics": [str],
                "difficulty": int,
                "keywords": [str],
            },
            "model_used": str  # "full" = both ML models, "rules" = fallback only
        }
    """
    try:
        tags = {}
        model_used = "full"
        
        # Rule-based extraction (fast)
        company = _rule_extract_company(text)
        role = _rule_extract_role(text)
        keywords = extract_keywords(text)
        
        tags["company"] = company or "Unknown"
        tags["role"] = role or "Software Engineer"
        tags["keywords"] = keywords
        
        # Check if models are available
        if _round_model is None or _topic_model is None:
            logger.info("Auto-tagging ML models not loaded, using rule fallback")
            tags["roundType"] = _rule_based_round_type(text)
            tags["roundTypeConfidence"] = 0.5  # low confidence
            tags["topics"] = []
            tags["difficulty"] = 3
            model_used = "rules"
        else:
            # ML-based classification
            round_type, round_confidence = predict_round_type(text)
            topics = predict_topics(text)
            
            tags["roundType"] = round_type
            tags["roundTypeConfidence"] = round(round_confidence, 3)
            tags["topics"] = topics
            tags["difficulty"] = estimate_difficulty(topics, round_type)
        
        return {
            "success": True,
            "experience_id": experience_id or "unknown",
            "tags": tags,
            "model_used": model_used,
        }
    
    except Exception as e:
        logger.warning("Error in tag_experience: %s", e)
        import traceback
        traceback.print_exc()
        
        return {
            "success": False,
            "experience_id": experience_id or "unknown",
            "error": str(e),
            "tags": {
                "company": "Unknown",
                "role": "Software Engineer",
                "roundType": "technical",
                "roundTypeConfidence": 0.0,
                "topics": [],
                "difficulty": 3,
                "keywords": [],
            },
            "model_used": "error",
        }
