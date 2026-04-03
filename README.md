<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=The%20Placement%20Archive&fontSize=50&fontAlignY=38&desc=Stop%20guessing.%20Start%20knowing.&descAlignY=55&descAlign=50&animation=fadeIn" width="100%"/>

<br/>

<a href="https://placement-archive.vercel.app/">
  <img src="https://img.shields.io/badge/🚀%20Live%20Demo-Try%20It%20Now-ff6b6b?style=for-the-badge&labelColor=1a1a2e" />
</a>
&nbsp;
<img src="https://img.shields.io/github/stars/yagneshj4/placement-archive?style=for-the-badge&logo=github&color=ffd700&labelColor=1a1a2e" />
&nbsp;
<img src="https://img.shields.io/github/forks/yagneshj4/placement-archive?style=for-the-badge&logo=github&color=60a5fa&labelColor=1a1a2e" />
&nbsp;
<img src="https://img.shields.io/badge/PRs-Welcome-4ade80?style=for-the-badge&labelColor=1a1a2e" />

<br/><br/>

> **"I got rejected from 5 companies because I didn't know what to prepare."**
> 
> The Placement Archive was built so that never happens to you.

<br/>

<p align="center">
🔥 Trusted by students preparing for Amazon, Infosys & TCS  
⭐ Join early users shaping the future of placement prep
</p>

<br/>

</div>

---

## 😤 The Problem Nobody Talks About

You spend 3 months grinding LeetCode. You practice DSA. You read system design blogs.

Then you walk into an interview at **Amazon, Infosys, or TCS** — and they ask something completely off your radar.

You fail. Not because you're not smart. But because **you prepared for the wrong things.**

**The information existed.** Someone from your own college answered that exact question last semester. But it was buried in a WhatsApp group, a forgotten Notion doc, or lost in a senior's memory.

**The Placement Archive fixes this.**

---

## ✨ What It Does

<table>
<tr>
<td width="50%">

### 🧠 Ask in Plain English
```
"What are the recurring graph patterns 
asked at Amazon SDE-1?"

"Which topics does Infosys ask freshers 
from a CS background?"
```
Get answers grounded in **real, verified student experiences** — not generic blog posts.

</td>
<td width="50%">

### 📊 Know Exactly Where You're Weak
Define your target companies. Our ML engine cross-references your profile against thousands of data points and generates a **personalized prep gap report**.

No more guessing. Just a clear list of what to learn next.

</td>
</tr>
<tr>
<td width="50%">

### ✍️ Submit & Help the Next Student
Share your interview experience through our intelligent wizard. It **auto-tags topics**, **predicts difficulty**, and structures your entry so future students get maximum value.

</td>
<td width="50%">

### ⚡ Real-Time Intelligence
Track trending companies, difficulty shifts over time, and what's hot this hiring season — powered by a live, growing community database.

</td>
</tr>
</table>

---

## 🎬 See It In Action

<div align="center">

> **🔗 [→ Try the Live App (Production)](https://placement-archive.vercel.app/)**

</div>

<div align="center">
<img src="https://via.placeholder.com/850x480/0f0f1a/60a5fa?text=📸+Add+Your+App+Screenshot+Here" width="85%" style="border-radius:12px; border: 1px solid #2d2d4e"/>
<br/><i>The Semantic Search dashboard — ask questions, get answers from your peers.</i>
</div>

<br/>

<div align="center">
<img src="https://via.placeholder.com/420x260/0f0f1a/4ade80?text=Gap+Analysis" width="41%" />
&nbsp;&nbsp;
<img src="https://via.placeholder.com/420x260/0f0f1a/f472b6?text=Experience+Feed" width="41%" />
</div>

---

## 🔋 The Intelligence Stack

```
┌─────────────────────────────────────────────────────────┐
│                   PLACEMENT ARCHIVE                      │
├───────────────────┬─────────────────────────────────────┤
│   🌐 Frontend     │  React 18 · Tailwind CSS             │
│                   │  Framer Motion · Lucide Icons        │
├───────────────────┼─────────────────────────────────────┤
│   ⚙️  Backend     │  Node.js · Express · Mongoose        │
│                   │  JWT Auth · Redis Bull Queue         │
├───────────────────┼─────────────────────────────────────┤
│   🧠 ML Engine    │  FastAPI · Sentence Transformers     │
│   (The Secret)    │  all-MiniLM-L6-v2 + FAISS           │
│                   │  XGBoost · DistilBERT NER            │
│                   │  Gemini API (RAG Pipeline)           │
├───────────────────┼─────────────────────────────────────┤
│   🗄️  Data        │  MongoDB Atlas · Redis Cache         │
└───────────────────┴─────────────────────────────────────┘
```

**Why this stack?**
- `all-MiniLM-L6-v2` gives production-grade semantic search at near-zero inference cost.
- `FAISS` enables sub-10ms similarity search across thousands of entries.
- `XGBoost` for difficulty scoring outperforms neural approaches on our tabular feature set.
- `DistilBERT NER` auto-extracts companies, roles, and topics — zero manual tagging.

---

## 🚀 Get It Running in 5 Minutes

### Prerequisites
- Node.js ≥ 18, Python ≥ 3.10
- MongoDB Atlas URI + Redis instance
- Gemini API Key ([free tier works](https://aistudio.google.com))

```bash
# 1. Clone
git clone https://github.com/yagneshj4/placement-archive.git
cd placement-archive-ml

# 2. Backend
cd server
cp .env.example .env       # Add your keys here
npm install
npm run seed               # Seeds verified interview data
npm run dev                # → http://localhost:5000

# 3. ML Service
cd ../ml-service
pip install -r requirements.txt
uvicorn main:app --reload  # → http://localhost:8000

# 4. Frontend
cd ../client
npm install
npm run dev                # → http://localhost:5173
```

**One-command demo (Docker):**
```bash
docker-compose up --build
```

---

## 📂 Project Structure

```
placement-archive-ml/
├── client/               # React 18 + Vite frontend
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Route pages
│       └── hooks/        # Custom React hooks
├── server/               # Node.js + Express API
│   ├── routes/
│   ├── models/           # Mongoose schemas
│   └── workers/          # Redis Bull queue workers
└── ml-service/           # FastAPI intelligence layer
    ├── embeddings/        # FAISS index + MiniLM
    ├── gap_analysis/      # XGBoost gap model
    └── ner/               # DistilBERT extraction
```

---

## 🗺️ Roadmap

- [x] **Phase 1** — Core Experience Archive & Semantic Search
- [x] **Phase 2** — ML-Powered Gap Analysis & Topic Radar
- [ ] **Phase 3** — Peer-to-Peer Mock Interviews + AI Feedback *(in progress 🚧)*
- [ ] **Phase 4** — Real-time Referral Networking Bridge
- [ ] **Phase 5** — College-level leaderboards & placement dashboards

---

## 🤝 Contributing

The archive grows stronger with every contribution. If you've had a placement experience, share it. If you're a developer, build with us.

```bash
# Fork → Branch → Code → PR
git checkout -b feature/your-awesome-feature
git commit -m "feat: add something amazing"
git push origin feature/your-awesome-feature
```

**Not a developer?** You can still contribute by [submitting your interview experience →](#) — that's the most valuable thing you can give.

---

## 💬 Community & Support

<div align="center">

| Platform | Link |
|---|---|
| 🐛 Bug Reports | [Open an Issue](../../issues) |
| 💡 Feature Ideas | [Start a Discussion](../../discussions) |
| 📧 Direct Contact | yagneshyallapu@gmail.com |

</div>

---

## ⭐ If This Helped You

If this project helped you crack an interview, land an offer, or just made your prep less chaotic — **a star means the world and helps more students find this.**

> 🚀 Every ⭐ helps one more student prepare better

<div align="center">

<a href="https://github.com/yagnesh08/placement-archive-ml">
  <img src="https://img.shields.io/badge/⭐_Give_a_Star-It_helps_students-ffd700?style=for-the-badge&logo=github&labelColor=1a1a2e" />
</a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

<sub>Built by <a href="https://github.com/yagnesh08">Yagnesh</a> · For engineers, by an engineer · MIT License</sub>

</div>
