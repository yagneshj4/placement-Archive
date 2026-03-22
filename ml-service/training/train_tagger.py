"""
Train two distilBERT classifiers for the auto-tagging pipeline:
1. RoundType classifier — 6-class single-label (coding/technical/hr/etc.)
2. Topic classifier   — multi-label (DSA, System Design, Java, etc.)

Run from ml-service/: python training/train_tagger.py
"""
import json
import os
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import classification_report, f1_score
import torch
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments,
)
import warnings
warnings.filterwarnings("ignore")

# ── Config ───────────────────────────────────────────────────────
DATA_PATH        = Path("training/labelled_data.json")
MODELS_DIR       = Path("models")
MODEL_NAME       = "distilbert-base-uncased"
ROUND_MODEL_DIR  = MODELS_DIR / "round_type_classifier"
TOPIC_MODEL_DIR  = MODELS_DIR / "topic_classifier"
MAX_LENGTH       = 256
BATCH_SIZE       = 8
EPOCHS           = 6
LEARNING_RATE    = 2e-5

ROUND_TYPES = [
    "coding", "technical", "hr",
    "system_design", "managerial",
    "aptitude"
]

ALL_TOPICS = [
    "DSA", "System Design", "Java", "Python", "JavaScript",
    "DBMS", "SQL", "OS", "Networking", "LLD", "HLD",
    "Graphs", "Dynamic Programming", "Arrays", "Strings",
    "Binary Trees", "Linked Lists", "Heaps", "Stack",
    "Recursion", "Backtracking", "Algorithms",
    "Distributed Systems", "Scalability", "Real-time",
    "Redis", "Elasticsearch", "Message Queue", "Cache",
    "Multithreading", "Concurrency", "OOP",
    "Design Patterns", "Testing", "API Design",
    "HR", "Behavioral", "Leadership Principles",
    "Managerial", "Leadership", "Group Discussion",
    "Aptitude", "Quantitative", "Verbal", "Reasoning",
    "LRU Cache", "C/C++", "Functional Programming",
    "Finance", "Healthcare IT", "Embedded Systems",
]

def load_data():
    with open(DATA_PATH) as f:
        data = json.load(f)
    print(f"Loaded {len(data)} training examples")
    return data

# ════════════════════════════════════════════════════════════════
# PART 1: Round Type Classifier (single-label, 6 classes)
# ════════════════════════════════════════════════════════════════

def train_round_classifier(data):
    print("\n" + "="*50)
    print("PART 1: Training Round Type Classifier")
    print("="*50)

    tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_NAME)
    label2id  = {rt: i for i, rt in enumerate(ROUND_TYPES)}
    id2label  = {i: rt for i, rt in enumerate(ROUND_TYPES)}

    # Prepare dataset
    texts  = [d["text"] for d in data]
    labels = [label2id[d["roundType"]] for d in data]

    X_train, X_val, y_train, y_val = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    print(f"Train: {len(X_train)} | Val: {len(X_val)}")

    # Tokenize directly
    train_encodings = tokenizer(X_train, truncation=True, max_length=MAX_LENGTH, padding="max_length")
    val_encodings   = tokenizer(X_val,   truncation=True, max_length=MAX_LENGTH, padding="max_length")

    # Convert to numpy arrays
    y_train = np.array(y_train)
    y_val   = np.array(y_val)

    # Create simple dataset class
    class SimpleDataset(torch.utils.data.Dataset):
        def __init__(self, encodings, labels):
            self.encodings = encodings
            self.labels    = labels
        def __len__(self): return len(self.labels)
        def __getitem__(self, idx):
            item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
            item["labels"] = torch.tensor(self.labels[idx])
            return item

    train_ds = SimpleDataset(train_encodings, y_train)
    val_ds   = SimpleDataset(val_encodings,   y_val)

    # Load model
    model = DistilBertForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(ROUND_TYPES),
        id2label=id2label,
        label2id=label2id,
    )

    # Training args
    args = TrainingArguments(
        output_dir=str(ROUND_MODEL_DIR),
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE,
        warmup_steps=100,
        weight_decay=0.01,
        eval_strategy="no",
        save_strategy="no",
        logging_steps=5,
        report_to="none",        # disable wandb
    )

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        preds = np.argmax(logits, axis=1)
        f1 = f1_score(labels, preds, average="weighted", zero_division=0)
        return {"f1": f1}

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        compute_metrics=compute_metrics,
    )

    print("Training round type classifier...")
    trainer.train()

    # Save model + tokenizer
    ROUND_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(ROUND_MODEL_DIR)
    tokenizer.save_pretrained(ROUND_MODEL_DIR)

    # Manual evaluation on validation set
    model.eval()
    with torch.no_grad():
        inputs = val_ds.encodings
        input_ids = torch.tensor(inputs["input_ids"])
        attention_mask = torch.tensor(inputs["attention_mask"])
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits
    
    preds = np.argmax(logits.cpu().numpy(), axis=1)
    print("\n--- Round Type Classifier Report ---")
    print(f"Validation accuracy: {(preds == y_val).mean():.2%}")
    print(f"Predictions distribution: {np.bincount(preds)}")
    print(f"True labels distribution: {np.bincount(y_val)}")
    print(f"Saved to: {ROUND_MODEL_DIR}")

# ════════════════════════════════════════════════════════════════
# PART 2: Topic Classifier (multi-label)
# ════════════════════════════════════════════════════════════════

class MultiLabelDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels    = labels
    def __len__(self): return len(self.labels)
    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.float)
        return item

def train_topic_classifier(data):
    print("\n" + "="*50)
    print("PART 2: Training Topic Classifier (multi-label)")
    print("="*50)

    tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_NAME)
    mlb = MultiLabelBinarizer(classes=ALL_TOPICS)

    texts  = [d["text"]   for d in data]
    labels = [d["topics"] for d in data]

    # Convert to binary matrix — shape: (n_samples, n_topics)
    y = mlb.fit_transform(labels).astype(np.float32)
    print(f"Topic label shape: {y.shape}")

    X_train, X_val, y_train, y_val = train_test_split(
        texts, y, test_size=0.2, random_state=42
    )

    enc_train = tokenizer(X_train, truncation=True, max_length=MAX_LENGTH, padding="max_length")
    enc_val   = tokenizer(X_val,   truncation=True, max_length=MAX_LENGTH, padding="max_length")

    train_ds = MultiLabelDataset(enc_train, y_train)
    val_ds   = MultiLabelDataset(enc_val,   y_val)

    # Multi-label needs num_labels = total topic count
    model = DistilBertForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(ALL_TOPICS),
        problem_type="multi_label_classification",
    )

    args = TrainingArguments(
        output_dir=str(TOPIC_MODEL_DIR),
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE,
        warmup_steps=100,
        weight_decay=0.01,
        eval_strategy="no",
        save_strategy="no",
        logging_steps=5,
        report_to="none",
    )

    def compute_metrics_multi(eval_pred):
        logits, labels = eval_pred
        preds = (torch.sigmoid(torch.tensor(logits)) > 0.5).numpy().astype(int)
        f1_micro = f1_score(labels, preds, average="micro",    zero_division=0)
        f1_samp  = f1_score(labels, preds, average="samples",  zero_division=0)
        return {"f1_micro": f1_micro, "f1_samples": f1_samp}

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        compute_metrics=compute_metrics_multi,
    )

    print("Training topic classifier...")
    trainer.train()

    TOPIC_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(TOPIC_MODEL_DIR)
    tokenizer.save_pretrained(TOPIC_MODEL_DIR)

    # Save the label binarizer so inference can reverse transform
    import pickle
    with open(TOPIC_MODEL_DIR / "mlb.pkl", "wb") as f:
        pickle.dump(mlb, f)

    print(f"\nSaved topic classifier to: {TOPIC_MODEL_DIR}")
    print(f"Saved MultiLabelBinarizer to: {TOPIC_MODEL_DIR}/mlb.pkl")

# ── Main ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    data = load_data()
    train_round_classifier(data)
    train_topic_classifier(data)
    print("\n✅ Both classifiers trained and saved!")
    print("Next: uvicorn main:app --reload --port 8000")