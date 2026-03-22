"""
Generates synthetic training data for XGBoost difficulty model.
Run: python training/generate_training_data.py
Outputs: training/difficulty_training_data.json
"""
import json
import random
import numpy as np
from pathlib import Path

random.seed(42)
np.random.seed(42)

# ── Domain knowledge encoded as weights ─────────────────────────

TOPIC_DIFFICULTY = {
    "DSA": 3.0, "Graphs": 4.2, "Dynamic Programming": 4.3,
    "System Design": 4.0, "Distributed Systems": 4.5,
    "LLD": 3.2, "HLD": 4.0, "Algorithms": 3.8,
    "Multithreading": 4.0, "Concurrency": 4.1,
    "Java": 2.8, "Python": 2.5, "DBMS": 2.5, "SQL": 2.3,
    "OS": 2.8, "Networking": 2.7, "Arrays": 2.5, "Strings": 2.3,
    "Binary Trees": 3.0, "Linked Lists": 2.8, "Heaps": 3.5,
    "Recursion": 3.2, "Backtracking": 3.8, "Trie": 3.8,
    "Segment Tree": 4.5, "C/C++": 3.2, "OOP": 2.5,
    "Design Patterns": 3.0, "Testing": 2.0, "API Design": 2.8,
    "HR": 1.5, "Behavioral": 1.5, "Leadership Principles": 1.8,
    "Aptitude": 1.5, "Quantitative": 1.8, "Verbal": 1.3,
    "Managerial": 2.0, "Group Discussion": 1.8,
}

ROUND_DIFFICULTY = {
    "coding": 3.0, "technical": 3.2, "system_design": 4.2,
    "hr": 1.5, "aptitude": 1.8, "managerial": 2.0, "group_discussion": 1.8,
}

COMPANY_TIER = {
    "Google": 3, "Amazon": 3, "Microsoft": 3, "Meta": 3, "Apple": 3,
    "Flipkart": 2.5, "Razorpay": 2.5, "Swiggy": 2.5, "Uber": 2.5,
    "Adobe": 2.5, "Atlassian": 2.5, "Salesforce": 2.5,
    "JP Morgan": 2.8, "Goldman Sachs": 2.8,
    "Infosys": 1.5, "TCS": 1.5, "Wipro": 1.5, "HCL": 1.5,
    "Cognizant": 1.5, "Accenture": 1.8, "IBM": 2.0,
}

QUESTION_BANK = [
    {"text": "Implement LRU Cache with O(1) get and put", "topics": ["DSA", "LRU Cache"], "round": "technical", "company": "Amazon"},
    {"text": "Find all bridges in an undirected graph", "topics": ["Graphs", "DSA", "Algorithms"], "round": "technical", "company": "Google"},
    {"text": "Design a URL shortener like bit.ly", "topics": ["System Design", "HLD"], "round": "system_design", "company": "Amazon"},
    {"text": "Find the median of a data stream", "topics": ["DSA", "Heaps"], "round": "technical", "company": "Google"},
    {"text": "Implement thread-safe LRU Cache in Java", "topics": ["Java", "Multithreading", "DSA"], "round": "technical", "company": "JP Morgan"},
    {"text": "Design a collaborative document editor", "topics": ["System Design", "Distributed Systems"], "round": "system_design", "company": "Microsoft"},
    {"text": "Find the longest palindromic substring", "topics": ["DSA", "Dynamic Programming", "Strings"], "round": "coding", "company": "Infosys"},
    {"text": "Minimum spanning tree using Kruskal", "topics": ["Graphs", "DSA", "Algorithms"], "round": "coding", "company": "Infosys"},
    {"text": "Tell me about a time you failed", "topics": ["HR", "Behavioral"], "round": "hr", "company": "Amazon"},
    {"text": "Why do you want to join this company", "topics": ["HR", "Behavioral"], "round": "hr", "company": "Wipro"},
    {"text": "Design a hit counter for past 5 minutes", "topics": ["DSA", "Arrays"], "round": "technical", "company": "Flipkart"},
    {"text": "Implement a stack with getMin in O(1)", "topics": ["DSA", "Algorithms"], "round": "coding", "company": "Paytm"},
    {"text": "Maximum subarray sum", "topics": ["DSA", "Dynamic Programming", "Arrays"], "round": "coding", "company": "JP Morgan"},
    {"text": "Design ride-sharing system like Uber", "topics": ["System Design", "Distributed Systems", "Scalability"], "round": "system_design", "company": "Uber"},
    {"text": "Serialize and deserialize binary tree", "topics": ["DSA", "Binary Trees"], "round": "coding", "company": "Flipkart"},
    {"text": "Implement consistent hashing with virtual nodes", "topics": ["Distributed Systems", "System Design"], "round": "technical", "company": "Razorpay"},
    {"text": "Aptitude: pipes and cisterns problems", "topics": ["Aptitude", "Quantitative"], "round": "aptitude", "company": "TCS"},
    {"text": "Remove duplicates from sorted array", "topics": ["DSA", "Arrays"], "round": "coding", "company": "HCL"},
    {"text": "Explain polymorphism with an example", "topics": ["OOP", "Java"], "round": "technical", "company": "Cognizant"},
    {"text": "Design notification system for banking app", "topics": ["System Design", "Distributed Systems"], "round": "system_design", "company": "JP Morgan"},
]

def topic_difficulty_avg(topics):
    scores = [TOPIC_DIFFICULTY.get(t, 3.0) for t in topics]
    return float(np.mean(scores)) if scores else 3.0

def generate_sample(q, label):
    """Generate realistic feature values for a question given its true difficulty label."""
    base = label / 5.0   # normalise to 0-1

    # Higher difficulty → higher skip rate (students give up)
    skip_rate = np.clip(np.random.beta(label, 6 - label + 0.5), 0, 1)

    # Higher difficulty → more time spent
    avg_time = np.random.normal(loc=label * 45, scale=20)
    avg_time = max(10, min(600, avg_time))

    # Self-rated difficulty correlates strongly with true label but has noise
    self_rated = np.clip(np.random.normal(loc=label, scale=0.6), 1, 5)

    # Attempt count: medium difficulty → most attempts (bell curve)
    attempt_count = max(1, int(np.random.normal(loc=20 - abs(label - 3) * 5, scale=5)))

    return {
        "skip_rate":            round(float(skip_rate), 3),
        "avg_time_seconds":     round(float(avg_time), 1),
        "self_rated_difficulty":round(float(self_rated), 2),
        "attempt_count":        attempt_count,
        "topic_difficulty_avg": round(topic_difficulty_avg(q["topics"]), 2),
        "round_type_enc":       round(ROUND_DIFFICULTY.get(q["round"], 3.0), 1),
        "company_tier":         COMPANY_TIER.get(q["company"], 2.0),
        "difficulty_label":     int(label),
    }

def assign_true_label(q):
    """Derive ground-truth difficulty label from domain knowledge."""
    topic_score = topic_difficulty_avg(q["topics"])
    round_score = ROUND_DIFFICULTY.get(q["round"], 3.0)
    company_score = COMPANY_TIER.get(q["company"], 2.0)
    combined = topic_score * 0.45 + round_score * 0.35 + company_score * 0.20
    label = int(np.clip(round(combined), 1, 5))
    return label

if __name__ == "__main__":
    samples = []
    # Generate 10 samples per question with varied noise
    for q in QUESTION_BANK:
        base_label = assign_true_label(q)
        for _ in range(10):
            # Occasionally vary label by ±1 to simulate real disagreement
            label = np.clip(base_label + np.random.choice([-1, 0, 0, 0, 1]), 1, 5)
            samples.append(generate_sample(q, int(label)))

    out_path = Path("training/difficulty_training_data.json")
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(samples, f, indent=2)

    label_dist = {i: sum(1 for s in samples if s['difficulty_label']==i) for i in range(1,6)}
    print(f"✅ Generated {len(samples)} training samples")
    print(f"   Label distribution: {label_dist}")
    print(f"   Saved to: {out_path}")
