<p align="center">
  <img src="https://raw.githubusercontent.com/dagracarui25-hash/regbridge/main/public/regbridge-sponsors-banner.png" width="800" alt="RegBridge — Partners: Qdrant · HuggingFace · Lovable"/>
</p>

<p align="center">
  <a href="https://regbridge.lovable.app"><img src="https://img.shields.io/badge/🚀_Demo_Live-regbridge.lovable.app-blue?style=for-the-badge" alt="App Live"/></a>
  <a href="https://qdrant.tech"><img src="https://img.shields.io/badge/Vector_DB-Qdrant_Cloud-red?style=for-the-badge" alt="Qdrant"/></a>
  <a href="https://huggingface.co"><img src="https://img.shields.io/badge/Embeddings-HuggingFace-yellow?style=for-the-badge" alt="HuggingFace"/></a>
</p>

<p align="center">
  <a href="https://colab.research.google.com/github/dagracarui25-hash/regbridge/blob/main/notebooks/RegBridge%20%E2%80%94%20Step%201%20:%20Ingestion%20des%20PDFs%20FINMA"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open in Colab – Step 1"/></a>
  <a href="https://colab.research.google.com/github/dagracarui25-hash/regbridge/blob/main/notebooks/RegBridge%20%E2%80%94%20Step%202%20:%20Build%20Serveur%20Complet.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open in Colab – Step 2"/></a>
</p>

# RegBridge — FINMA Compliance Assistant

> **GenAI Zürich Hackathon 2026** · Qdrant Challenge

---

## 🎯 The Problem

Compliance teams at Swiss private banks spend **weeks manually** verifying that their internal procedures align with FINMA circulars.

> _"A compliance officer spends an average of 3 hours per week manually searching through FINMA texts."_

**RegBridge automates this analysis using generative AI and Qdrant vector search.**

---

## 💡 The Solution

RegBridge is a conversational AI assistant that enables a compliance officer to:

- 📄 **Query FINMA regulations** in natural language (circulars 2016/7, 2023/1, 2025/2)
- 📁 **Upload internal documents** (policies, procedures, contracts) → indexed in real time
- 🔀 **Cross-reference** official regulations + internal documents in a single query
- ⚡ **Get sourced answers** with precise article and page references
- 📊 **Export cross-analysis results** as a PDF compliance report
- 🌍 **Multilingual** : FR · EN · DE · IT

---

## 🔷 Qdrant at the Core — Dual-Collection Architecture

> This is the technical heart of RegBridge. Two dedicated Qdrant collections are queried **simultaneously** to detect compliance gaps between official regulations and internal procedures.

```
┌─────────────────────────────────────────────────────────────────┐
│                  QDRANT CLOUD — Dual Collection                  │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │   Collection 1           │  │   Collection 2               │ │
│  │   finma_docs             │  │   internal_docs              │ │
│  │                          │  │                              │ │
│  │  • Circ. FINMA 2023/1    │  │  • Internal procedures       │ │
│  │  • Circ. FINMA 2016/7    │  │  • Policies & regulations    │ │
│  │  • OBA-FINMA             │  │  • Uploaded PDFs             │ │
│  │  • CDB 2020              │  │  • Auto-chunked + indexed    │ │
│  │                          │  │                              │ │
│  │  HuggingFace Embeddings  │  │  HuggingFace Embeddings      │ │
│  │  384 dimensions          │  │  384 dimensions              │ │
│  └──────────┬───────────────┘  └──────────────┬───────────────┘ │
│             │                                  │                 │
│             └──────────────┬───────────────────┘                 │
│                            │                                     │
│                    Cross-Query Engine                            │
│               (LangChain MergerRetriever)                        │
│          → Gap detection · Sourced citations · FR/DE/EN/IT       │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │    Groq API · LLaMA 3.1 8B  │
              │    (response generation)     │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   FastAPI Backend · Python   │
              │   POST /query               │
              │   POST /cross-query         │
              │   POST /upload              │
              └──────────────┬──────────────┘
                             │  HTTPS · ngrok
              ┌──────────────▼──────────────┐
              │  React Frontend · Lovable   │
              │  regbridge.lovable.app       │
              └─────────────────────────────┘
```

### Why dual-collection matters

| Single-collection RAG | RegBridge dual-collection |
|---|---|
| Can only answer questions about one corpus | Queries FINMA + internal docs simultaneously |
| No gap detection | Detects misalignments between regulation and practice |
| Generic compliance Q&A | Actionable recommendations per institution |
| Replicable by any LLM | Private document indexing = institutional value |

---

## 🚀 Live Demo

### 👉 [https://regbridge.lovable.app](https://regbridge.lovable.app)

> React interface deployed via Lovable  
> FastAPI backend on Google Colab + ngrok  
> ⚠️ To test: run notebook Step 2 first to activate the backend

---

## 🗂️ Three Tabs, One Workflow

| Tab | What it does |
|---|---|
| 💬 **FINMA Question** | Natural language query on indexed FINMA circulars · sourced answers with PDF + page |
| 🔀 **Cross-analysis** | Simultaneous query of both Qdrant collections · compliance gap detection · **export results as PDF report** |
| 📁 **Internal documents** | Upload PDFs · real-time Qdrant indexing · library with audit trail |

---

## ⚙️ Full Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React · TypeScript · Lovable | User interface (FR/DE/EN/IT) |
| Backend | FastAPI · Python · Uvicorn | REST API |
| Embeddings | **HuggingFace** `paraphrase-multilingual-MiniLM-L12-v2` | Multilingual vectorization (384 dim) |
| **Vector DB** | **Qdrant Cloud** | **Dual-collection vector storage + search** |
| RAG | LangChain · MergerRetriever | Cross-collection retrieval pipeline |
| LLM | Groq API · `llama-3.1-8b-instant` | Response generation (<1s latency) |
| Backend deploy | Google Colab · ngrok | Public FastAPI server |
| Frontend deploy | Lovable | Web interface |

---

## 🗄️ Qdrant Collections

| Collection | Content | Embedding model | Usage |
|---|---|---|---|
| `finma_docs` | FINMA Circulars 2016/7, 2023/1, OBA-FINMA, CDB 2020 | `paraphrase-multilingual-MiniLM-L12-v2` | Regulatory questions |
| `internal_docs` | Internal documents uploaded by the user | `paraphrase-multilingual-MiniLM-L12-v2` | Cross-reference queries |

---

## 🚀 Running the Project

### 1. Environment Variables

```env
QDRANT_URL=https://xxx.qdrant.io
QDRANT_API_KEY=your_qdrant_key
GROQ_API_KEY=your_groq_key
NGROK_AUTH_TOKEN=your_ngrok_token
VITE_API_URL=https://xxx.ngrok-free.app
```

### 2. Backend — Google Colab

```bash
# Step 1 — Index FINMA documents (run once)
# Open notebooks/Step 1 → Run all cells
# FINMA circulars indexed in Qdrant finma_docs ✅

# Step 2 — Start the server (each session)
# Open notebooks/Step 2 → Run all cells
# Copy the public ngrok URL → paste into the frontend
```

### 3. Frontend

No installation required — live at **[regbridge.lovable.app](https://regbridge.lovable.app)**

---

## 📓 Notebooks

| # | Notebook | Description |
|---|---|---|
| 1 | Step 1 — FINMA PDF Ingestion | Load, split and index FINMA circulars into `finma_docs` |
| 2 | Step 2 — Full Server | FastAPI + dual-collection RAG + ngrok + internal document upload |

---

## 🗺️ Roadmap

| Version | Features | Status |
|---|---|---|
| **v1.0 MVP** | FINMA RAG · Internal docs upload · Dual-collection cross-analysis · **PDF report export** · 4 languages | ✅ Today |
| **v2.0** | DORA · DPA/GDPR · Basel III/IV · Multi-user with roles · Cross-session memory | 🔒 Post-hackathon |
| **v3.0** | 40+ regulatory frameworks · Auto-alerts · Core banking integration | 🔒 Long-term |

---

## 👤 Team

| Name | Role |
|---|---|
| [@dagracarui25-hash](https://github.com/dagracarui25-hash) | Senior Systems Engineer · Private Bank Geneva |

---

## 📜 License

MIT — Built for **GenAI Zürich Hackathon 2026 · Qdrant Challenge**
