# Luxury Fashion E-Commerce Platform

A modern luxury clothing web platform inspired by the visual design, UX patterns, and performance of **Hugo Boss**.

## 🏗 Architecture & Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript, Tailwind CSS)
  * Editorial magazine-grade UI, monochrome typography tokens
  * Split-screen PDP with responsive multi-tier portrait gallery
  * AI Natural Language Search & Similar Styles discovery UI
  * Responsive scroll-snap product rails with horizontal fade masks
* **Backend:** [Go](https://golang.org/) (Go 1.24, Chi router, clean architecture)
  * High-throughput REST API
  * AI embedding pipeline (Gemini `text-embedding-004` & local normalized fallback)
  * Dynamic cosine similarity scoring for semantic search & outfit pairing
* **Database:** [PostgreSQL 16](https://www.postgresql.org/) + [pgvector](https://github.com/pgvector/pgvector)
  * High-dimensional (768-dim) vector indexing using **HNSW** (`vector_cosine_ops`)
  * Sub-10ms nearest neighbor semantic search queries
  * Full relational catalog (categories, products, variants, images, embeddings)

---

## 🚀 Quick Start Guide

### 1. Start PostgreSQL with pgvector (Docker)

```bash
docker compose up -d
```
*This starts PostgreSQL on port `5432` and automatically runs `database/init.sql` to initialize the `vector` extension, catalog tables, HNSW indexes, and seed products.*

### 2. Start the Go Backend API

```bash
cd backend
cp .env.example .env # (Optional: Add your GEMINI_API_KEY for live embeddings)
go run ./cmd/server
```
The Go API will be listening on **`http://localhost:8080`**.

### 3. Start the Next.js Frontend

```bash
cd frontend
npm run dev
```
The storefront will be available at **`http://localhost:3000`**.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & pgvector check |
| `GET` | `/api/products` | Catalog listing with `?brand=BOSS` & `?category=slug` filters |
| `GET` | `/api/products/{slug}` | Detailed PDP data with images, color swatches & variants |
| `POST` | `/api/search/semantic` | AI vector semantic search using pgvector cosine distance |
| `GET` | `/api/products/{id}/similar` | Closest style & cut matches via vector similarity |

---

## 📁 Repository Structure

```
clothing/
├── PRD.md                 # Product Requirements Document
├── docker-compose.yml     # PostgreSQL 16 + pgvector container
├── database/
│   └── init.sql           # Schema, pgvector extension, HNSW index & seed data
├── backend/               # Go REST API with pgvector & AI embeddings
│   ├── cmd/server/        # Entrypoint (main.go)
│   └── internal/
│       ├── database/      # pgx connection pool + vector registration
│       ├── embedding/     # Gemini & local deterministic embedding service
│       ├── handlers/      # HTTP REST controllers
│       ├── models/        # Go structs
│       └── repository/    # pgvector SQL queries & HNSW cosine search
└── frontend/              # Next.js luxury fashion storefront
```
