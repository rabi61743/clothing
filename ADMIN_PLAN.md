# Digital Atelier Admin Platform Plan (PRD & Technical Blueprint)
## Luxury Fashion Operations, Merchandising & AI Vector Control Tower

---

## 1. Executive Summary & Objectives

### 1.1 Objective
Design and implement an enterprise-grade, internal administrative platform (**Digital Atelier Operations**) that empowers fashion merchandisers, fulfillment specialists, and atelier directors to manage luxury clothing catalogs, inventory matrices, customer orders, and AI vector embeddings with precision and speed.

### 1.2 Core Pillars
1. **Catalog & Garment Engineering:** Create, enrich, and publish luxury fashion items with real-time AI vector embedding generation.
2. **Order Management & White-Glove Fulfillment:** Track end-to-end order lifecycles from authorization to courier dispatch.
3. **VectorOps & AI Stylist Management:** Inspect, benchmark, and fine-tune `pgvector` HNSW indexes and semantic outfit pairing algorithms.
4. **Inventory & Stock Matrix:** Manage SKU variants across complex sizing tables (38R–46L) and colorways.
5. **VIP Clienteling & Sizing Intelligence:** View customer measurements, fit preferences, and purchase histories for personalized shopping curation.

---

## 2. Role-Based Access Control (RBAC)

```
┌─────────────────────────┬────────────────────────────────────────────────────────────────┐
│ Role                    │ Key Responsibilities & Permissions                             │
├─────────────────────────┼────────────────────────────────────────────────────────────────┤
│ **Atelier Director**    │ Full super-admin rights: pricing approval, financial reports,  │
│ (Super Admin)           │ role assignments, system & database configuration.             │
├─────────────────────────┼────────────────────────────────────────────────────────────────┤
│ **Merchandising Lead**  │ Product creation, category trees, visual lookbook curation,    │
│                         │ variant matrix management, campaign banners.                   │
├─────────────────────────┼────────────────────────────────────────────────────────────────┤
│ **Fulfillment Manager** │ Order processing, packing slips, shipping tracking assignments,│
│                         │ white-glove courier dispatch, return/exchange approvals.       │
├─────────────────────────┼────────────────────────────────────────────────────────────────┤
│ **AI / VectorOps Lead** │ Embedding generation oversight, HNSW index re-indexing,        │
│                         │ similarity threshold tuning, search failure analytics.         │
└─────────────────────────┴────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Functional Modules

### 3.1 Module 1: Catalog & Garment Engineering
* **Multi-Media Asset Manager:**
  * Upload high-resolution portrait model photography (`3:4` or `1:1.5` aspect ratio).
  * Automatic derivation of multi-tier responsive formats (WebP/AVIF across `640px` to `1920px`).
* **Variant & Sizing Matrix:**
  * Grid-based inventory editor allowing instant stock updates across all matrix points:
    * E.g., Color *Dark Navy* × Sizes *[38S, 38R, 40R, 42R, 44R, 44L]*.
* **Automated AI Vector Pipeline:**
  * Upon publishing a product, the backend automatically concatenates brand, title, description, and fabric details.
  * Generates a 768-dimensional normalized embedding vector via Google Gemini `text-embedding-004` (or local fallback).
  * Automatically updates the PostgreSQL `product_embeddings` table and re-indexes into the HNSW graph.

### 3.2 Module 2: Order Management System (OMS) & Fulfillment
* **Order Lifecycle State Machine:**
  ```
  [ PLACED ] ──▶ [ PAYMENT AUTHORIZED ] ──▶ [ ATELIER PREPARATION ]
                                                    │
  [ DELIVERED ] ◀── [ IN TRANSIT (COURIER) ] ◀──────┘
  ```
* **Order Inspection Details:**
  * Customer contact, shipping address, and garment items breakdown.
  * Payment authorization token and status.
  * 1-Click action triggers:
    * *Mark as In Preparation*
    * *Generate Packing Slip & Garment Box Label*
    * *Add Tracking Number (UPS Express / DHL Express)*
    * *Process Return / Size Exchange*

### 3.3 Module 3: VectorOps & AI Stylist Management (pgvector)
* **Embedding Inspection Sandbox:**
  * Real-time query test bench: type customer search prompts and inspect the top-k returned cosine distances with latency benchmarks.
* **Vector Health & Index Monitor:**
  * Displays total vectors indexed in `product_embeddings`.
  * HNSW index parameter controls (`m = 16`, `ef_construction = 64`).
  * "Re-index All Garments" button to refresh embeddings if product copy or embedding model changes.
* **Search Analytics & Zero-Result Discovery:**
  * Logs customer queries with similarity scores `< 0.30` to identify missing styles or demand gaps.

### 3.4 Module 4: VIP Clienteling & Fit Intelligence
* **Customer Measurement Profiles:**
  * Customer profiles integrated with data from the storefront **AI Fit Advisor** (height, weight, body shape, preferred fit).
* **Personal Shopper Look Builder:**
  * Allows atelier stylists to curate a private outfit lookbook and send a direct payment link to VIP clients.

---

## 4. Extended Database Schema (PostgreSQL 16)

```sql
-- 1. Admin Users & Authentication
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'MERCHANDISER', -- 'SUPER_ADMIN', 'MERCHANDISER', 'FULFILLMENT'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Audit Trail Log (Compliance & Security)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id),
    action VARCHAR(64) NOT NULL, -- e.g. 'UPDATE_PRICE', 'CREATE_PRODUCT', 'REFUND_ORDER'
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inventory Stock Adjustment Transactions
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id),
    quantity_change INT NOT NULL,
    reason VARCHAR(64) NOT NULL, -- 'RESTOCK', 'DAMAGE', 'RETURN', 'MANUAL_AUDIT'
    admin_user_id UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Search Query Analytics
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    results_count INT NOT NULL,
    top_similarity_score FLOAT,
    latency_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. API Endpoints for Admin Operations

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | KPI summary (Gross revenue, order counts, product counts, vector counts) |
| `GET` | `/api/admin/orders` | Paginated orders with filter by status (`CONFIRMED`, `SHIPPED`, `DELIVERED`) |
| `PATCH` | `/api/admin/orders/{id}/status` | Update fulfillment state (e.g. mark shipped + courier tracking number) |
| `POST` | `/api/admin/products` | Create product, variants, and trigger pgvector embedding generation |
| `PUT` | `/api/admin/products/{id}` | Update product pricing, descriptions, and regenerate vector embeddings |
| `PATCH` | `/api/admin/inventory` | Bulk update stock quantities across variant SKUs |
| `POST` | `/api/admin/vector/reindex` | Trigger background batch re-indexing of all catalog embeddings |
| `GET` | `/api/admin/vector/benchmark` | Latency and cosine distance distribution diagnostics |

---

## 6. Implementation Phasing & Milestones

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: Operational Core (Completed)                           │
│  ✔ Order streaming from PostgreSQL to Admin Dashboard           │
│  ✔ Real-time KPI revenue & order metrics calculations           │
│  ✔ "Craft New Garment" modal with automated pgvector embeddings │
├─────────────────────────────────────────────────────────────────┤
│ Phase 2: Order Fulfillment & State Machine (Weeks 1 - 2)        │
│  • Order detail slide-out drawer with status transitions        │
│  • Tracking number assignment & email dispatch simulation       │
│  • Print packing slip and return label generation               │
├─────────────────────────────────────────────────────────────────┤
│ Phase 3: VectorOps & AI Management Console (Weeks 3 - 4)        │
│  • Interactive semantic search playground & score visualizer    │
│  • Query analytics & zero-result demand reports                 │
│  • HNSW graph parameter tuning & one-click re-indexing          │
├─────────────────────────────────────────────────────────────────┤
│ Phase 4: Inventory Matrix & Clienteling (Weeks 5 - 6)           │
│  • Matrix table for bulk stock adjustments (Size × Color)       │
│  • Low stock threshold alert banners                            │
│  • VIP Clienteling customer measurement viewer                  │
└─────────────────────────────────────────────────────────────────┘
```
