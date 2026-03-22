# 🚀 ML Service API Reference

**Service Status:** ✅ Running  
**Base URL:** `http://localhost:8000`  
**Default Port:** `8000`

---

## 📋 Available Endpoints

### 1. Health Check
```http
GET /health
```
**Purpose:** Verify service is running  
**Response:** `{"status": "healthy"}`

**cURL:**
```bash
curl http://localhost:8000/health
```

---

### 2. Single Embedding
```http
POST /embed
```
**Purpose:** Generate embedding for a single text  

**Request Body:**
```json
{
  "text": "This is a sample question or experience description"
}
```

**Response:**
```json
{
  "embedding": [0.123, -0.456, 0.789, ...],
  "dimension": 384,
  "model": "all-MiniLM-L6-v2"
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/embed \
  -H "Content-Type: application/json" \
  -d '{"text":"sample text"}'
```

---

### 3. Batch Embeddings
```http
POST /embed/batch
```
**Purpose:** Generate embeddings for multiple texts  

**Request Body:**
```json
{
  "texts": [
    "First text",
    "Second text",
    "Third text"
  ]
}
```

**Response:**
```json
{
  "embeddings": [
    [0.123, -0.456, ...],
    [0.234, -0.567, ...],
    [0.345, -0.678, ...]
  ],
  "count": 3,
  "model": "all-MiniLM-L6-v2"
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/embed/batch \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["text1", "text2", "text3"]
  }'
```

---

### 4. Semantic Search
```http
POST /search
```
**Purpose:** Search existing experiences using semantic similarity  

**Request Body:**
```json
{
  "query": "dynamic programming problems",
  "top_k": 5,
  "min_similarity": 0.4
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "exp_123",
      "similarity": 0.87,
      "text": "DP problem from Amazon interview"
    }
  ],
  "count": 1,
  "query_embedding_dim": 384
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "dynamic programming",
    "top_k": 5
  }'
```

---

### 5. Auto-Tagging
```http
POST /autotag
```
**Purpose:** Automatically extract round type and topics from text  

**Request Body:**
```json
{
  "text": "This was a technical interview at Google focused on designing a distributed cache system",
  "company": "Google"
}
```

**Response:**
```json
{
  "round_type": "technical",
  "round_type_confidence": 0.94,
  "topics": ["system_design", "distributed_systems"],
  "topic_confidences": [0.89, 0.85],
  "company": "Google"
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/autotag \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Technical interview about cache design",
    "company": "Google"
  }'
```

---

### 6. Difficulty Prediction
```http
POST /difficulty
```
**Purpose:** Predict question difficulty with SHAP explanability  

**Request Body:**
```json
{
  "company": "Amazon",
  "round_type": "technical",
  "topics": ["arrays", "strings"],
  "skip_rate": 0.15,
  "avg_time_seconds": 180,
  "self_rated_difficulty": 3.5,
  "attempt_count": 25
}
```

**Response:**
```json
{
  "success": true,
  "difficulty": 4,
  "difficulty_label": "Hard",
  "probability": 0.78,
  "probabilities": [0.05, 0.12, 0.25, 0.43, 0.15],
  "shap_values": [
    {
      "feature": "avg_time_seconds",
      "description": "Average time per attempt",
      "shap_value": 0.34,
      "direction": "up"
    },
    {
      "feature": "attempt_count",
      "description": "Number of attempts",
      "shap_value": -0.12,
      "direction": "down"
    }
  ],
  "model_used": "xgboost",
  "top_driver": "Time spent per attempt indicates harder problem"
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/difficulty \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Amazon",
    "round_type": "technical",
    "topics": ["arrays"],
    "skip_rate": 0.15,
    "avg_time_seconds": 180,
    "self_rated_difficulty": 3.5,
    "attempt_count": 25
  }'
```

---

### 7. RAG (Retrieval-Augmented Generation)
```http
POST /rag
```
**Purpose:** Generate AI explanation using retrieved similar experiences  

**Request Body:**
```json
{
  "query": "How to approach system design interviews?",
  "context": "Preparing for Google interview"
}
```

**Response:**
```json
{
  "answer": "Based on similar experiences, here are key strategies...",
  "sources": [
    {
      "id": "exp_456",
      "similarity": 0.85,
      "excerpt": "We discussed caching strategies..."
    }
  ],
  "model": "gemini-pro"
}
```

**cURL:**
```bash
curl -X POST http://localhost:8000/rag \
  -H "Content-Type: application/json" \
  -d '{
    "query": "System design interview tips",
    "context": "Google interview"
  }'
```

---

### 8. API Documentation
```http
GET /docs
```
**Purpose:** Interactive Swagger UI for all endpoints  
**URL:** `http://localhost:8000/docs`

Also available:
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## 🧪 Quick Test Script

### PowerShell Test All Endpoints
```powershell
# Test service health
Write-Host "Testing ML Service Endpoints..."
Write-Host "================================"

$baseUrl = "http://localhost:8000"

# 1. Health Check
Write-Host "`n1️⃣ Health Check..."
Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json

# 2. Single Embedding
Write-Host "`n2️⃣ Single Embedding..."
$embedReq = @{text = "test question about arrays and strings"} | ConvertTo-Json
Invoke-WebRequest -Uri "$baseUrl/embed" -Method POST -Body $embedReq -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json

# 3. Auto-tagging
Write-Host "`n3️⃣ Auto-tagging..."
$tagReq = @{
  text = "This was a technical interview focusing on distributed systems"
  company = "Amazon"
} | ConvertTo-Json
Invoke-WebRequest -Uri "$baseUrl/autotag" -Method POST -Body $tagReq -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json

# 4. Difficulty Prediction
Write-Host "`n4️⃣ Difficulty Prediction..."
$diffReq = @{
  company = "Google"
  round_type = "technical"
  topics = @("arrays", "strings")
  skip_rate = 0.15
  avg_time_seconds = 240
  self_rated_difficulty = 3.5
  attempt_count = 20
} | ConvertTo-Json
Invoke-WebRequest -Uri "$baseUrl/difficulty" -Method POST -Body $diffReq -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json

Write-Host "`n================================"
Write-Host "✅ All tests completed!"
```

### Bash Test Script
```bash
#!/bin/bash
BASE_URL="http://localhost:8000"

echo "Testing ML Service Endpoints..."
echo "================================"

# 1. Health
echo -e "\n1️⃣ Health Check..."
curl -s $BASE_URL/health | jq .

# 2. Embed
echo -e "\n2️⃣ Single Embedding..."
curl -s -X POST $BASE_URL/embed \
  -H "Content-Type: application/json" \
  -d '{"text":"test question"}' | jq .

# 3. Autotag
echo -e "\n3️⃣ Auto-tagging..."
curl -s -X POST $BASE_URL/autotag \
  -H "Content-Type: application/json" \
  -d '{
    "text":"Technical interview on distributed systems",
    "company":"Amazon"
  }' | jq .

# 4. Difficulty
echo -e "\n4️⃣ Difficulty Prediction..."
curl -s -X POST $BASE_URL/difficulty \
  -H "Content-Type: application/json" \
  -d '{
    "company":"Google",
    "round_type":"technical",
    "topics":["arrays"],
    "skip_rate":0.15,
    "avg_time_seconds":240,
    "self_rated_difficulty":3.5,
    "attempt_count":20
  }' | jq .

echo -e "\n================================"
echo "✅ All tests completed!"
```

---

## 🔗 Integration with Node.js Backend

The Node.js backend (`/server`) proxies to these ML service endpoints:

```javascript
// Example: Node.js AI controller
const response = await axios.post('http://localhost:8000/difficulty', {
  company: req.body.company,
  round_type: req.body.roundType,
  topics: req.body.topics,
  skip_rate: 0.15,
  avg_time_seconds: 120,
  self_rated_difficulty: 3,
  attempt_count: 15
});
```

---

## ⚙️ Configuration

**Environment Variables** (in `.env`):
```bash
PORT=8000
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMA_PERSIST_DIR=./chroma_data
API_KEY=ml-service-dev-key
NODE_BACKEND_URL=http://localhost:5000
```

**Performance Notes:**
- Average response time: **50-100ms**
- Embedding dimension: **384**
- Max batch size: **100** texts
- Model loading: **10-15 seconds** (first startup)

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `Connection refused` | Ensure service is running: `.\start-ml-service.ps1` |
| `Port 8000 in use` | Use different port: `.\start-ml-service.ps1 -Port 9000` |
| `ModuleNotFoundError` | Wrong Python venv - use ml-service venv |
| `Slow responses` | Normal during model loading - check `/health` status |
| `CORS errors` | Add client URL to allowed origins in main.py |

---

## 📚 See Also
- [STARTUP.md](./STARTUP.md) - Service startup guide
- [.env](./.env) - Configuration
- [main.py](./main.py) - Service entry point
- [API Documentation](http://localhost:8000/docs) - Interactive Swagger UI
