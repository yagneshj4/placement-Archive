---
title: Placement Archive ML Service
emoji: 🎓
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Placement Archive ML Service

FastAPI-based ML service for semantic search, RAG Q&A, auto-tagging, and difficulty prediction.

## Endpoints
- `GET /health` — Health check
- `POST /embed` — Embed a single experience
- `POST /search` — Semantic search
- `POST /autotag` — Auto-tag an experience
- `POST /rag` — RAG Q&A
- `POST /difficulty` — Difficulty prediction