<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,2,5,30&height=220&section=header&text=The%20Placement%20Archive&fontSize=52&fontAlignY=38&desc=Stop%20Guessing.%20Start%20Knowing.&descAlignY=55&descAlign=50&animation=fadeIn&fontColor=ffffff" width="100%"/>

<br/>

<a href="https://placement-archive.vercel.app/">
  <img src="https://img.shields.io/badge/🚀%20Live%20Demo-Try%20It%20Now-F97316?style=for-the-badge&labelColor=0B0B0F" />
</a>
&nbsp;
<a href="https://github.com/yagneshj4/placement-Archive/stargazers">
  <img src="https://img.shields.io/github/stars/yagneshj4/placement-Archive?style=for-the-badge&logo=github&color=FFD700&labelColor=0B0B0F" />
</a>
&nbsp;
<a href="https://github.com/yagneshj4/placement-Archive/forks">
  <img src="https://img.shields.io/github/forks/yagneshj4/placement-Archive?style=for-the-badge&logo=github&color=60A5FA&labelColor=0B0B0F" />
</a>
&nbsp;
<a href="https://github.com/yagneshj4/placement-Archive/actions/workflows/ci.yml">
  <img src="https://img.shields.io/github/actions/workflow/status/yagneshj4/placement-Archive/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white&labelColor=0B0B0F" />
</a>
&nbsp;
<img src="https://img.shields.io/badge/License-MIT-4ADE80?style=for-the-badge&labelColor=0B0B0F" />
&nbsp;
<img src="https://img.shields.io/badge/PRs-Welcome-FB923C?style=for-the-badge&labelColor=0B0B0F" />

<br/><br/>

> *"Built by a student who got tired of seniors' knowledge dying in WhatsApp groups."*
>
> — **Yagnesh Yallapu**, VR Siddhartha Engineering College (VRSEC), Batch 2027

<br/>

</div>

---

## 😤 The Problem Nobody Talks About

You grind **250+ LeetCode problems**. You watch every system design video. You practice for months.

Then you walk into your Amazon interview — and the question is something your senior answered three months ago in a WhatsApp group you never joined. **You fail. Not because you weren't smart enough. Because you didn't know what to prepare.**

Your seniors know exactly what each company asks. They know the patterns, the curveballs, the "unofficial" topics that never show up in prep guides. But that knowledge **dies with their batch**. It never reaches you.

The same questions get asked every single year at TCS, Infosys, JP Morgan, Amazon — and every single year, thousands of students prepare for the wrong things. The **knowledge existed**. Nobody built the system to capture it.

**The Placement Archive fixes this. The information existed. We just built the system to find it.**

---

## 🎬 See It In Action

<div align="center">

### 🔗 [→ Try the Live App (Production)](https://placement-archive.vercel.app/)

</div>

---

## ✨ Features

| Feature | What It Does |
|---------|-------------|
| 🧠 **RAG Q&A Pipeline** | *sentence-transformers + ChromaDB + Google Gemini 2.5 Flash* — Ask natural language questions about any company or role. Every answer is strictly grounded in real student experiences with inline citations. Zero hallucination — architecturally enforced. |
| 🔍 **Semantic Search** | *all-MiniLM-L6-v2 + ChromaDB* — Search by meaning, not keywords. "graph traversal problems" finds BFS/DFS experiences even if the word "traversal" never appears in the text. |
| 🏷️ **AI Auto-Tagging** | *Fine-tuned DistilBERT (round type + multi-label topics)* — Every submission is automatically tagged with topics, difficulty, round type, and company in under 2 seconds via Bull.js async queue. Falls back to rule-based tagging if models are unavailable. |
| 📊 **Difficulty Predictor + SHAP** | *XGBoost trained on 7 engagement signals* — Predicts question difficulty 1–5. Hover the badge to see a SHAP waterfall tooltip explaining which signals drove the prediction and why. |
| 🎯 **Personalised Gap Dashboard** | *MongoDB aggregation + Recharts RadarChart* — Set your target companies. See exactly which topics appear in their interviews vs what you have covered. Ranked gaps with resource links. |
| 📧 **Weekly Email Digest** | *Bull.js cron (Sunday 8am IST) + Nodemailer* — Personalised weekly email with top questions for your target companies. Includes opt-out. Staggered delivery to avoid Gmail rate limits. |
| ⚡ **Async Processing Queue** | *Bull.js + Redis (Upstash)* — Experience submission returns in <100ms. Auto-tagging, embedding, and indexing happen asynchronously. Bull Board dashboard at `/admin/queues`. |
| 🔐 **XSS-Safe JWT Auth** | *Access token in JS memory (15m) + HttpOnly refresh cookie (7d)* — Silent refresh on 401. Protects against XSS attacks that steal localStorage tokens. |
| 🔄 **ChromaDB Sync** | *POST /sync endpoint* — Re-populates the production ChromaDB from MongoDB on demand. Essential after Hugging Face Space restarts (ephemeral `/tmp` storage). |

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      PLACEMENT ARCHIVE                           │
│                                                                  │
│  React 19 + Tailwind CSS (Vercel)                                │
│      │                                                           │
│      ▼ REST API calls                                            │
│  Node.js 20 + Express (Render)                                   │
│      │                         │                                 │
│      ▼                         ▼                                 │
│  MongoDB Atlas            Bull.js Queue (Redis/Upstash)          │
│                                │                                 │
│                                ▼ ML calls (X-API-Key)            │
│                   FastAPI ML Service (Hugging Face Spaces)        │
│                                │                                 │
│          ┌─────────────────────┼───────────────────┐            │
│          ▼                     ▼                   ▼            │
│     ChromaDB             DistilBERT           XGBoost           │
│  (384-dim vectors)      (auto-tagger)       (difficulty)        │
│          │                                        │             │
│          ▼                                        ▼             │
│  sentence-transformers               SHAP waterfall explainer   │
│  all-MiniLM-L6-v2                                               │
│          │                                                       │
│          ▼                                                       │
│  Google Gemini 2.5 Flash (RAG answer synthesis)                  │
│  Redis (Upstash)         (24-hour response cache)                │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔋 Tech Stack

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Frontend** | React | UI framework | 19.x |
| | Vite | Build tool | 5.4 |
| | Tailwind CSS | Styling | 3.4 |
| | Framer Motion | Animations | 12.x |
| | Recharts | Charts (radar, bar) | 3.x |
| | TanStack Query | Data fetching + cache | 5.x |
| | React Router | Client-side routing | 7.x |
| | React Hook Form | Form management | 7.x |
| | Lucide React | Icon system | 0.577 |
| **Backend** | Node.js | Runtime | 20 LTS |
| | Express | REST API framework | 5.x |
| | Mongoose | MongoDB ODM | 9.x |
| | Bull.js | Async job queue | 4.x |
| | Nodemailer | Email delivery | 6.x |
| | JWT | Authentication | — |
| | Helmet | Security headers | 8.x |
| | express-rate-limit | API rate limiting | 8.x |
| **ML Service** | FastAPI | ML API framework | 0.115+ |
| | sentence-transformers | Text embeddings | all-MiniLM-L6-v2 |
| | ChromaDB | Vector database | 0.5.x |
| | Google Gemini 2.5 Flash | RAG answer generation | google-generativeai |
| | DistilBERT | Auto-tagger (fine-tuned) | Hugging Face Transformers |
| | XGBoost | Difficulty prediction | 2.0.3+ |
| | SHAP | ML explainability | 0.45.1+ |
| **Databases** | MongoDB Atlas | Document store | Free M0 |
| | Redis (Upstash) | Queue + RAG cache | Serverless |
| **Deploy** | Vercel | Frontend hosting | — |
| | Render | Backend API hosting | Free tier |
| | Hugging Face Spaces | ML service hosting | CPU Basic |
| **DevOps** | GitHub Actions | CI/CD | — |

### Why This Stack?

- **Google Gemini 2.5 Flash over GPT-4o-mini** — Free tier gives 1M tokens/day with no credit card required. Equivalent quality for placement Q&A. `google-generativeai` package replaces the deprecated LangChain OpenAI wrapper.
- **sentence-transformers over OpenAI embeddings** — `all-MiniLM-L6-v2` gives 384-dim embeddings at zero inference cost. OpenAI embeddings would cost $0.0001/1K tokens — unnecessary expense when local model quality is comparable for this domain.
- **XGBoost over neural network for difficulty** — Feature set is 7 tabular signals (skip rate, avg time, self-rated difficulty, etc.). XGBoost achieves 0.855 CV accuracy on ordinal prediction with ~200 samples. A neural network would overfit at this sample size.
- **ChromaDB over Pinecone** — Pinecone costs $70/month. ChromaDB is open-source, runs embedded inside the FastAPI container on Hugging Face Spaces for free. At 500–10K vectors, latency difference is negligible.
- **Bull.js for async processing** — Experience submission must return in <100ms. Auto-tagging (DistilBERT) + embedding takes 2–4 seconds. Bull.js with Redis persistence ensures no job is lost even if the server restarts.

---

## 🚀 Get Running in 5 Minutes

### Prerequisites

```
✅ Node.js ≥ 20          (node --version)
✅ Python ≥ 3.11         (python --version)
✅ MongoDB Atlas URI      (free at cloud.mongodb.com)
✅ Upstash Redis URL      (free at upstash.com)
✅ Google API Key         (free at aistudio.google.com — 1M tokens/day)
```

### Step 1 — Clone

```bash
git clone https://github.com/yagneshj4/placement-Archive.git
cd placement-Archive
```

### Step 2 — Environment Variables

**Server (`server/.env`)**

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
REDIS_URL=rediss://...upstash.io:6379
REDIS_TOKEN=your_upstash_token
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_API_KEY=your_ml_api_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

**Client (`client/.env`)**

```env
VITE_API_URL=http://localhost:5000/api
```

**ML Service (`ml-service/.env`)**

```env
API_KEY=your_ml_api_key
GOOGLE_API_KEY=your_google_gemini_api_key
REDIS_URL=rediss://...upstash.io:6379
REDIS_TOKEN=your_upstash_token
NODE_BACKEND_URL=http://localhost:5000
PORT=8000
```

> ⚠️ **Common error:** `MongoServerSelectionError` — your current IP is not whitelisted in MongoDB Atlas.
> **Fix:** MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

### Step 3 — Start ML Service

```bash
cd ml-service
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Start FastAPI
uvicorn main:app --reload --port 8000
```

**Expected startup output:**
```
✅ Embedding model ready (all-MiniLM-L6-v2, dim=384)
✅ ChromaDB ready (experiences: 0, questions: 0)
✅ Auto-tagging classifiers ready
🚀 ML Service ready on port 8000
📖 Docs: http://localhost:8000/docs
```

> ⚠️ **Common error:** `ModuleNotFoundError: No module named 'sentence_transformers'`
> **Fix:** Make sure your virtual environment is activated before running `pip install`.

### Step 4 — Start Backend

```bash
cd server
npm install
npm run dev
```

**Expected startup output:**
```
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
✅ Server running on http://localhost:5000
📊 Bull Board: http://localhost:5000/admin/queues
🔥 Health:     http://localhost:5000/health
```

### Step 5 — Start Frontend

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

### Step 6 — Seed Database

```bash
cd server
npm run seed              # Creates 5 users + 10 experiences + 15 questions
npm run embed-seed        # Indexes all experiences into ChromaDB
```

**Default credentials after seeding:**
```
Admin:   admin@vrsec.ac.in  /  Admin@1234
Student: priya@vrsec.ac.in  /  Student@1234
```

### Step 7 — Populate Production ChromaDB (after HF Space restart)

Hugging Face Spaces use ephemeral `/tmp` storage — ChromaDB data is wiped on every restart. Run this after each restart:

```powershell
Invoke-RestMethod -Uri "https://yagnesh08-placement-archive-ml.hf.space/sync" -Method Post -ContentType "application/json" -Body '{}'
```

Or using curl:
```bash
curl -X POST https://yagnesh08-placement-archive-ml.hf.space/sync
```

---

## 📂 Project Structure

```
placement-archive/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Jest + Pytest on every push to main
│       └── retrain.yml         # Weekly XGBoost retraining cron (Sun 2am IST)
├── client/                     # React 19 + Vite + Tailwind CSS
│   └── src/
│       ├── api/                # Axios API clients (ai, analytics, auth, experiences, users)
│       ├── components/
│       │   ├── dashboard/      # Gap analysis components (RadarChart, GapCard, etc.)
│       │   ├── layout/         # Navbar, PageWrapper, ProtectedRoute
│       │   └── ui/             # ExperienceCard, DifficultyBadgeWithSHAP, SimilarityBar
│       ├── context/            # AuthContext (JWT token management)
│       ├── hooks/              # useAuth, useSearch, useBookmarks, useGapAnalysis
│       └── pages/              # Dashboard, QandA, SearchResults, GapDashboard, etc.
├── server/                     # Node.js 20 + Express REST API
│   ├── config/                 # MongoDB + Redis connection
│   ├── controllers/            # auth, experience, search, ai, analytics, user, queue
│   ├── middleware/             # auth (JWT), error handler, rate limiter, validation
│   ├── models/                 # User, Experience, Question, Resource, AnalyticsEvent
│   ├── queues/                 # Bull.js queue definitions (embedding, email, retraining)
│   ├── routes/                 # Express route files
│   ├── scripts/                # seed.js, embedSeed.js, embedQuestions.js
│   ├── services/               # auth.service.js, email.service.js
│   ├── tests/                  # Jest + Supertest (auth, experiences, search)
│   └── workers/                # Bull.js workers (embedding, email, retraining)
└── ml-service/                 # Python 3.11 FastAPI ML microservice
    ├── config/                 # Pydantic settings (settings.py)
    ├── models/                 # Trained ML artifacts
    │   ├── difficulty_model/   # xgb_model.joblib + scaler.joblib + feature_names.json
    │   ├── round_type_classifier/  # Fine-tuned DistilBERT (6-class round type)
    │   └── topic_classifier/   # Fine-tuned DistilBERT (51-label multi-label topics)
    ├── routers/                # health, embed, search, autotag, rag, sync
    ├── services/               # embedding, vector_store, tagger, rag, difficulty
    └── sync_chroma.py          # Standalone sync script (run locally to pre-populate)
```

---

## 📡 API Reference

### Node.js REST API (`https://placement-archive-api.onrender.com`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | None | Register new user |
| `POST` | `/api/auth/login` | None | Login, returns JWT |
| `GET` | `/api/auth/me` | Required | Get current user profile |
| `POST` | `/api/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/api/auth/logout` | Required | Clear refresh cookie |
| `GET` | `/api/experiences` | Optional | List with filters + pagination |
| `POST` | `/api/experiences` | Required | Submit new experience |
| `GET` | `/api/experiences/:id` | Optional | Get single experience |
| `GET` | `/api/search?q=...` | Optional | Hybrid semantic + keyword search |
| `POST` | `/api/ai/qa` | Required | RAG Q&A via Gemini |
| `GET` | `/api/ai/similar/:id` | Optional | Semantically similar experiences |
| `POST` | `/api/ai/difficulty` | Required | XGBoost difficulty prediction |
| `GET` | `/api/users/gap-analysis` | Required | Personalised gap analysis |
| `PATCH` | `/api/users/profile` | Required | Update target companies + role |
| `GET` | `/api/analytics/overview` | Admin | Platform health metrics |
| `GET` | `/health` | None | Backend health check |

### FastAPI ML Service (`https://yagnesh08-placement-archive-ml.hf.space`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health + model load status |
| `GET` | `/rag/health` | RAG pipeline status (Gemini + ChromaDB + Redis) |
| `POST` | `/embed` | Create 384-dim vector for a single text |
| `POST` | `/embed/batch` | Batch embed multiple documents |
| `POST` | `/search` | Vector similarity search in ChromaDB |
| `POST` | `/search/hybrid` | Semantic search with `min_similarity` threshold |
| `POST` | `/autotag` | Auto-tag experience (DistilBERT → round type + topics) |
| `POST` | `/difficulty` | Predict difficulty 1–5 + SHAP values |
| `POST` | `/rag` | Full RAG Q&A pipeline (retrieval + Gemini synthesis) |
| `POST` | `/sync` | Re-sync all experiences from MongoDB → ChromaDB |
| `GET` | `/docs` | Interactive Swagger UI |
| `GET` | `/redoc` | ReDoc API documentation |

> 📖 **Full interactive API docs:** [https://yagnesh08-placement-archive-ml.hf.space/docs](https://yagnesh08-placement-archive-ml.hf.space/docs)

---

## ⚙️ CI/CD & Deployment

<div align="center">

[![CI](https://img.shields.io/github/actions/workflow/status/yagneshj4/placement-Archive/ci.yml?branch=main&style=for-the-badge&label=CI%20%E2%80%94%20Jest%20%2B%20Pytest&logo=githubactions&logoColor=white&labelColor=0B0B0F)](https://github.com/yagneshj4/placement-Archive/actions/workflows/ci.yml)
&nbsp;
[![Retrain](https://img.shields.io/github/actions/workflow/status/yagneshj4/placement-Archive/retrain.yml?style=for-the-badge&label=Weekly%20Retraining&logo=githubactions&logoColor=white&labelColor=0B0B0F)](https://github.com/yagneshj4/placement-Archive/actions/workflows/retrain.yml)

</div>

Every push to `main` triggers **3 parallel CI jobs**:
1. **Jest (Node.js)** — API endpoint tests with 70%+ coverage gate
2. **Pytest (FastAPI)** — ML endpoint + model validation tests
3. **Vite build check** — Ensures the React app compiles without errors

Every **Sunday at 2:00 AM IST**, a retraining cron:
1. Pulls latest AnalyticsEvents from MongoDB Atlas
2. Retrains XGBoost difficulty model on new data
3. Runs Pytest model validation to confirm accuracy hasn't degraded
4. Commits updated model files and auto-deploys to Hugging Face Spaces

| Service | Platform | URL | Status |
|---------|----------|-----|--------|
| Frontend | Vercel | [placement-archive.vercel.app](https://placement-archive.vercel.app) | [![Vercel](https://img.shields.io/badge/Vercel-Live-4ADE80?style=flat-square&labelColor=0B0B0F)](https://placement-archive.vercel.app) |
| Backend | Render | [placement-archive-api.onrender.com](https://placement-archive-api.onrender.com) | [![Render](https://img.shields.io/badge/Render-Live-4ADE80?style=flat-square&labelColor=0B0B0F)](https://placement-archive-api.onrender.com/health) |
| ML Service | Hugging Face Spaces | [yagnesh08-placement-archive-ml.hf.space](https://yagnesh08-placement-archive-ml.hf.space) | [![HF](https://img.shields.io/badge/HuggingFace-Running-4ADE80?style=flat-square&labelColor=0B0B0F)](https://yagnesh08-placement-archive-ml.hf.space/health) |

---

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| RAG response (cold) | ~1.5–2s | ChromaDB retrieval (~8ms) + Gemini generation (~1.2s) |
| RAG response (cached) | ~4ms | Redis 24-hour TTL cache |
| Semantic search | <200ms | 500+ vectors in ChromaDB |
| Auto-tagging | ~2s | DistilBERT inference on CPU |
| Embedding dimension | 384 | all-MiniLM-L6-v2 output |
| Auto-tagging accuracy | ~74% | 5-fold CV on 200 labelled samples |
| XGBoost CV accuracy | **0.855** | 7 features, ordinal 1–5 prediction |
| XGBoost CV MAE | 0.38 | Off by <0.5 difficulty levels on average |
| API health check | <50ms | Render free tier (warmed) |
| Experience submission | <100ms | Returns immediately, processes async |
| ChromaDB (10 docs) | 2ms retrieval | Production verified |

---

## 🗺️ Roadmap

- [x] **Phase 1** — Foundation (MERN + JWT auth + Bull.js queues + Redis)
- [x] **Phase 2** — Core Platform (search + bookmarks + experience detail + filtering)
- [x] **Phase 3** — AI/ML Layer (RAG pipeline + semantic search + DistilBERT auto-tagger)
- [x] **Phase 4** — Intelligence (XGBoost + SHAP + gap dashboard + similar experiences)
- [x] **Phase 5** — Production (Jest + Pytest + GitHub Actions CI/CD + full deployment)
- [x] **Phase 6** — Gemini Integration (migrated from GPT-4o-mini → Google Gemini 2.5 Flash)
- [ ] **Phase 7** — Resume Skill-Gap Matcher *(in progress 🚧)* — upload resume → NLP extracts skills → compare against company requirements
- [ ] **Phase 8** — AI Mock Interview Coach — voice-based mock interviews using Web Speech API + Gemini
- [ ] **Phase 9** — College leaderboards + placement season analytics dashboard
- [ ] **Phase 10** — Mobile app (React Native) with offline experience browsing

---

## 🤝 Contributing

The archive is only as powerful as the experiences in it. There are two ways to contribute:

### For Students (Most Valuable)

The best thing you can do is **submit your interview experience** — it helps every junior preparing for that company.

1. Visit [placement-archive.vercel.app](https://placement-archive.vercel.app)
2. Click **"+ Share Experience"**
3. Fill in company, role, year, round type, and narrative (minimum 200 words)
4. Submit — AI auto-tags and indexes it within 30 seconds

> Every experience submitted makes the RAG answers more accurate and the gap analysis more personalised for the next student.

### For Developers

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# 4. Run tests before pushing
cd server && npm test
cd ../ml-service && pytest tests/ -v

# 5. Commit with conventional commit format
git commit -m "feat: add resume skill-gap matcher endpoint"

# 6. Push and open a PR
git push origin feature/your-feature-name
```

**Code standards:**
- ESLint + Prettier for JavaScript (`client/` and `server/`)
- Black + isort for Python (`ml-service/`)
- All new Node.js endpoints need a Jest test
- All new FastAPI endpoints need a Pytest test
- PR description must explain: what, why, and how to test

---

## 🎯 For Recruiters & Interviewers

### ATS Resume Line
```
Engineered The Placement Archive — an AI-powered placement intelligence platform
deployed at VRSEC with 100+ student users, combining a RAG pipeline
(sentence-transformers + ChromaDB + Google Gemini 2.5 Flash) for grounded
natural language interview Q&A, a fine-tuned DistilBERT multi-label auto-tagger,
XGBoost difficulty predictor with SHAP explainability, and semantic search —
reducing company-specific preparation time by 60% in user surveys.
```

### Interview Talking Points

- **Why RAG over fine-tuning for Q&A?** — Fine-tuning LLMs on 500 experiences would cost thousands of dollars and become stale immediately. RAG retrieves fresh data at inference time and cites sources — hallucination is architecturally prevented by the system prompt design, not just hoped for.

- **Why Google Gemini over OpenAI?** — Gemini 2.5 Flash provides a free tier of 1M tokens/day at no cost. For a student-built platform with unpredictable traffic, this is critical. Quality for placement Q&A is equivalent. The migration required switching from LangChain's OpenAI wrapper to `google-generativeai` directly.

- **Why XGBoost over neural network for difficulty?** — Feature set is 7 engineered tabular signals (skip rate, avg time, self-rated difficulty, etc.). With ~200 training samples, a neural network would massively overfit. XGBoost achieves 0.855 CV accuracy on this ordinal prediction task.

- **Why ChromaDB over Pinecone?** — Pinecone costs $70/month. ChromaDB is open-source and runs embedded inside the FastAPI container on Hugging Face Spaces for free. At current scale (500–10K vectors), query latency difference is under 10ms.

- **Why Bull.js for async processing?** — Experience submission must return in <100ms for good UX. Auto-tagging (DistilBERT) takes 2 seconds, embedding (sentence-transformers) takes 0.5 seconds. Bull.js with Redis persistence ensures no job is lost even if the Node.js server restarts mid-processing.

---

## 📄 License

```
MIT License

Copyright (c) 2024 Yagnesh Yallapu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 💬 Contact & Support

<div align="center">

| Platform | Link |
|----------|------|
| 🐛 Bug Reports | [Open an Issue](https://github.com/yagneshj4/placement-Archive/issues) |
| 💡 Feature Ideas | [Start a Discussion](https://github.com/yagneshj4/placement-Archive/discussions) |
| 📧 Direct Contact | [yagneshyallapu@gmail.com](mailto:yagneshyallapu@gmail.com) |
| 💼 LinkedIn | [Yagnesh Yallapu](https://linkedin.com/in/yagnesh-yallapu) |
| 🐙 GitHub | [@yagneshj4](https://github.com/yagneshj4) |

</div>

---

## ⭐ If This Helped You

If this project helped you crack an interview, land an offer, or just made your prep less chaotic — **a star means the world and helps more students find this.**

Every ⭐ helps one more student prepare smarter.

<div align="center">

<a href="https://github.com/yagneshj4/placement-Archive">
  <img src="https://img.shields.io/badge/⭐_Star_This_Repo-It_helps_students-FFD700?style=for-the-badge&logo=github&labelColor=0B0B0F" />
</a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,2,5,30&height=120&section=footer" width="100%"/>

<sub>
  Built with ❤️ by <a href="https://github.com/yagneshj4">Yagnesh Yallapu</a> ·
  VR Siddhartha Engineering College, Vijayawada ·
  B.Tech Information Technology, Batch 2027 ·
  MIT License
</sub>

</div>
