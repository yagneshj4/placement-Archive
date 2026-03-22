"""
Train XGBoost difficulty prediction model.
Run from ml-service/: python training/train_difficulty.py
Saves: models/difficulty_model/xgb_model.joblib + scaler.joblib + feature_names.json
"""
import json
import numpy as np
import joblib
from pathlib import Path
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, mean_absolute_error, accuracy_score
from xgboost import XGBClassifier
import warnings
warnings.filterwarnings("ignore")

DATA_PATH  = Path("training/difficulty_training_data.json")
MODEL_DIR  = Path("models/difficulty_model")

# ── Feature columns — ORDER MATTERS, must match inference ────────
FEATURE_COLS = [
    "skip_rate",
    "avg_time_seconds",
    "self_rated_difficulty",
    "attempt_count",
    "topic_difficulty_avg",
    "round_type_enc",
    "company_tier",
]

def load_data():
    with open(DATA_PATH) as f:
        data = json.load(f)
    X = np.array([[s[feat] for feat in FEATURE_COLS] for s in data])
    y = np.array([s["difficulty_label"] for s in data])
    print(f"Loaded {len(data)} samples | Features: {X.shape[1]} | Classes: {np.unique(y)}")
    return X, y

def train():
    print("\n" + "="*55)
    print("XGBoost Difficulty Prediction Model Training")
    print("="*55)

    X, y = load_data()

    # Shift labels to 0-indexed (XGBoost needs 0-based classes)
    y_shifted = y - 1   # 1-5 → 0-4

    # ── Feature scaling ──────────────────────────────────────────
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ── XGBoost model ────────────────────────────────────────────
    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=2,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
    )

    # ── 5-fold cross-validation ───────────────────────────────────
    print("\nRunning 5-fold cross-validation...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    cv_acc = cross_val_score(model, X_scaled, y_shifted, cv=skf, scoring="accuracy")
    cv_mae = cross_val_score(model, X_scaled, y_shifted, cv=skf,
                             scoring="neg_mean_absolute_error")

    print(f"CV Accuracy:  {cv_acc.mean():.3f} ± {cv_acc.std():.3f}")
    print(f"CV MAE:       {(-cv_mae).mean():.3f} ± {(-cv_mae).std():.3f}")
    print(f"  (MAE of 0.5 means off by half a difficulty level on average)")

    # ── Train on full dataset ─────────────────────────────────────
    print("\nTraining on full dataset...")
    model.fit(X_scaled, y_shifted)

    # Final predictions on training set (for sanity check)
    y_pred = model.predict(X_scaled) + 1   # shift back to 1-5
    y_true = y_shifted + 1

    print(f"\nTraining set accuracy: {accuracy_score(y_true, y_pred):.3f}")
    print(f"Training set MAE:      {mean_absolute_error(y_true, y_pred):.3f}")

    print("\nClassification report:")
    print(classification_report(y_true, y_pred,
          target_names=["Easy(1)","Easy-Med(2)","Medium(3)","Hard(4)","Expert(5)"]))

    # ── Feature importance ────────────────────────────────────────
    importance = model.feature_importances_
    feat_importance = sorted(zip(FEATURE_COLS, importance), key=lambda x: -x[1])
    print("\nFeature importance (XGBoost gain):")
    for feat, imp in feat_importance:
        bar = "█" * int(imp * 50)
        print(f"  {feat:<28} {bar} {imp:.4f}")

    # ── Save model artifacts ──────────────────────────────────────
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(model,  MODEL_DIR / "xgb_model.joblib")
    joblib.dump(scaler, MODEL_DIR / "scaler.joblib")

    with open(MODEL_DIR / "feature_names.json", "w") as f:
        json.dump({
            "features": FEATURE_COLS,
            "n_classes": 5,
            "label_offset": 1,   # model outputs 0-4, add 1 to get 1-5
            "cv_accuracy": float(cv_acc.mean()),
            "cv_mae":      float((-cv_mae).mean()),
        }, f, indent=2)

    print(f"\n✅ Model saved to: {MODEL_DIR}/")
    print(f"   xgb_model.joblib  — XGBoost classifier")
    print(f"   scaler.joblib     — StandardScaler for features")
    print(f"   feature_names.json — feature order + metadata")

if __name__ == "__main__":
    train()
