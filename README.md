# Luxury Fashion E-Commerce Platform

A modern luxury clothing web platform inspired by the visual design, UX patterns, and performance of **Hugo Boss**.

---

## 🌐 Live Production Deployment ($0 Cost)

| Service | Public Live URL | Platform | Plan |
| :--- | :--- | :--- | :--- |
| **Storefront (Primary Edge)** | [https://frontend-rabi-abd5.vercel.app](https://frontend-rabi-abd5.vercel.app) (or [lyart-alpha](https://frontend-lyart-alpha-44.vercel.app)) | **Vercel** | Free Hobby (Global Edge CDN) |
| **Storefront (Secondary)** | [https://clothing-frontend-pzkq.onrender.com](https://clothing-frontend-pzkq.onrender.com) | Render | Free Web Service |
| **API Backend (Golang)** | [https://clothing-backend-96ai.onrender.com](https://clothing-backend-96ai.onrender.com) | Render | Free Docker Web Service |
| **Database (PostgreSQL + pgvector)** | `oregon-postgres.render.com:5432` | Render | Managed Free PostgreSQL 16 |

### Live Portal Features (Vercel)
- **Luxury Storefront:** [Catalog / PLP](https://frontend-rabi-abd5.vercel.app/products)
- **AI Outfit Studio:** [Personal Stylist Studio](https://frontend-rabi-abd5.vercel.app/stylist)
- **Split-Screen PDP:** [Two-Piece Slim-Fit Suit](https://frontend-rabi-abd5.vercel.app/products/two-piece-slim-fit-suit-italian-virgin-wool)
- **Atelier Admin Command Center:** [Admin Ops & Vector Sandbox](https://frontend-rabi-abd5.vercel.app/admin)
- **Client Order Tracking:** [Real-Time Fulfillment Timeline](https://frontend-rabi-abd5.vercel.app/tracking)
- **AI Concierge:** Floating interactive style advisor on all storefront pages

---

## 🏗 Architecture & Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript, Tailwind CSS)
  * Editorial magazine-grade UI, monochrome typography tokens
  * Split-screen PDP with responsive multi-tier portrait gallery
  * AI Natural Language Search & Similar Styles discovery UI
  * Responsive scroll-snap product rails with horizontal fade masks
* **Backend:** [Go](https://golang.org/) (Go 1.24, Chi router, clean architecture)
  * High-throughput REST API with CORS enabled for production
  * AI embedding pipeline (Gemini `text-embedding-004` & local normalized fallback)
  * Dynamic cosine similarity scoring for semantic search & outfit pairing
* **Database:** [PostgreSQL 16](https://www.postgresql.org/) + [pgvector](https://github.com/pgvector/pgvector)
  * High-dimensional (768-dim) vector indexing using **HNSW** (`vector_cosine_ops`)
  * Sub-10ms nearest neighbor semantic search queries
  * Full relational catalog (categories, products, variants, images, embeddings)

---

## 🚀 Quick Start Guide (Local Development)

### 1. Start Docker Containers

```bash
docker compose up -d --build
```
*Starts PostgreSQL 16 + pgvector on `localhost:5434`, Go API on `localhost:8080`, and Next.js on `localhost:3000`.*

### 2. Live Local URLs
- Storefront: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/health`
- Admin Center: `http://localhost:3000/admin`

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & pgvector check |
| `GET` | `/api/products` | Catalog listing with `?brand=BOSS` & `?category=slug` filters |
| `GET` | `/api/products/{slug}` | Detailed PDP data with images, color swatches & variants |
| `POST` | `/api/search/semantic` | AI vector semantic search using pgvector cosine distance |
| `GET` | `/api/products/{id}/similar` | Closest style & cut matches via vector similarity |
| `POST` | `/api/orders` | Checkout transaction order placement |
| `GET` | `/api/orders/track/{orderNumber}` | Live order fulfillment lookup |
| `GET` | `/api/admin/stats` | Atelier KPIs (revenue, order count, vector count) |
| `POST` | `/api/concierge/chat` | AI Concierge conversational advisor |

---

## 📁 Repository Structure

```
clothing/
├── PRD.md                 # Product Requirements Document
├── ADMIN_PLAN.md          # Admin Center specifications
├── docker-compose.yml     # Multi-container orchestration (DB, API, Web)
├── database/
│   └── init.sql           # Schema, pgvector extension, HNSW index & seed data
├── backend/               # Go REST API with pgvector & AI embeddings
│   ├── cmd/server/        # Entrypoint (main.go)
│   ├── Dockerfile         # Multi-stage production container
│   └── internal/
│       ├── database/      # pgx connection pool + vector registration
│       ├── embedding/     # Gemini & local deterministic embedding service
│       ├── handlers/      # HTTP REST controllers
│       ├── models/        # Go structs
│       └── repository/    # pgvector SQL queries & HNSW cosine search
└── frontend/              # Next.js luxury fashion storefront
    ├── Dockerfile         # Standalone production container
    └── src/
        ├── app/           # App router pages (Storefront, PDP, Stylist, Admin, Tracking)
        ├── components/    # Reusable components (AiConcierge)
        └── config/        # Centralized environment API base URL
```
