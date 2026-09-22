# Product Requirements Document (PRD)
## Next-Gen Luxury Fashion E-Commerce Platform

---

## 1. Executive Summary & Vision

### 1.1 Objective
Design and engineer a modern, high-performance luxury clothing e-commerce web platform inspired by the visual language, technical performance, and conversion mechanics of leading luxury fashion houses (specifically benchmarking the **Hugo Boss** online flagship).

### 1.2 Vision Statement
To deliver an editorial, magazine-grade shopping experience that combines high-resolution imagery and minimalist typography with sub-second page performance, intuitive size-advising, and an effortless checkout funnel.

### 1.3 Key Benchmark Highlights (Hugo Boss Inspiration)
- **Minimalist Aesthetic:** Uncluttered monochrome interface where full-bleed photography and garment craftsmanship dominate.
- **Dual Brand Experience:** Unified storefront capable of hosting sub-brands (e.g., tailored luxury vs. contemporary streetwear).
- **Split-Screen PDP Architecture:** High-definition portrait gallery (left) paired with a sticky, low-friction purchasing console (right).
- **Dynamic Adaptive Media:** Viewport-tailored responsive image delivery (WebP/AVIF) across 8 screen tiers.
- **Predictive Merchandising & Rich Search:** Visual search overlays with direct editorial shortcuts.

---

## 2. Target Audience & User Personas

| Persona | Demographics & Mindset | Primary Goals | Key Friction Points |
| :--- | :--- | :--- | :--- |
| **Julian – The Executive Buyer** | Age 32–48. Professional, values premium fabrics, tailored cuts, and timeless elegance. | Quick search for high-end suiting, exact sizing guidance, reliable expedited shipping. | Inaccurate size charts, cluttered UI, slow checkout. |
| **Elena – The Trendsetter** | Age 22–35. Fashion-forward, values contemporary streetwear, capsule collections, and brand aesthetics. | Discovering latest drops, viewing outfits in lifestyle context ("Complete the Look"). | Static product views, generic photography, lack of mobile fluidity. |
| **Marcus – The Mobile Shopper** | Age 26–42. Browses primarily on smartphones during commutes or quick breaks. | Smooth swipeable product rails, rapid visual scanning, 1-tap mobile wallet checkout. | Janky carousels, intrusive popups, hard-to-tap size pickers. |

---

## 3. Design System & Visual Architecture

### 3.1 Color Palette & Tokens
```css
:root {
  /* Core Monochrome */
  --color-canvas-white:       #FFFFFF;
  --color-canvas-subtle:      #F9F9F9; /* Product card backdrop */
  --color-canvas-elevated:    #F4F4F4;
  --color-text-primary:       #000000;
  --color-text-secondary:     #666666;
  --color-text-muted:         #8C8C8C;
  --color-border-subtle:      #E5E5E5;
  --color-border-strong:      #111111;

  /* Brand Accents */
  --color-brand-tailored:     #C4A076; /* Warm camel / champagne luxury */
  --color-brand-streetwear:   #FF001E; /* High-contrast signature red */
  --color-success:            #1E7E34;
  --color-error:              #D92D20;
}
```

### 3.2 Typography Hierarchy
* **Primary Typeface:** Neo-grotesque geometric sans-serif (e.g., `Averta PE`, `Plus Jakarta Sans`, or `Inter`).
* **Display & Headlines:** Uppercase, tracked-out (`letter-spacing: 0.05em - 0.1em`), bold/extrabold weights.
* **Body & UI Controls:** Clean, high legibility at 14px–16px, line-height `1.5`.

| Level | Size (Desktop) | Size (Mobile) | Weight | Transform | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | 56px / 3.5rem | 36px / 2.25rem | 800 | Uppercase | Homepage campaign titles |
| **H1 / Collection** | 40px / 2.5rem | 28px / 1.75rem | 700 | Normal | Category & PLP headers |
| **H2 / PDP Title** | 28px / 1.75rem | 22px / 1.375rem| 700 | Normal | Product names, section titles |
| **H3 / Accordion** | 18px / 1.125rem| 16px / 1.0rem  | 600 | Normal | Modular drawers, filter groups |
| **Body / Copy** | 15px / 0.9375rem| 14px / 0.875rem| 400 | Normal | Product details, material specs |
| **Micro / Meta** | 12px / 0.75rem | 11px / 0.6875rem| 500 | Uppercase | Badges, SKUs, breadcrumbs |

### 3.3 Responsive Breakpoint Ladder
* **Mobile (xs/sm):** `360px` – `767px` (1-column hero, 2-column or horizontal scroll-snap product rails).
* **Tablet (md):** `768px` – `1023px` (3-column product grid, collapsible filter drawer).
* **Desktop (lg):** `1024px` – `1439px` (4-column grid, sticky PDP buying console, flyout mega-nav).
* **Ultra-wide (xl/xxl):** `1440px` – `2560px` (Fluid full-bleed media banners, 4- to 5-column product rails).

---

## 4. Feature Specifications & User Journeys

### 4.1 Global Navigation & Header
* **Dual Brand Switcher:** Sticky top toggle bar allowing seamless switching between luxury tailored collections and streetwear lines.
* **Flyout Mega-Menu:**
  * Multi-column category tree (Men, Women, Highlights, Accessories, Gifts).
  * Direct editorial preview cards embedded inside dropdowns.
* **Rich Search Overlay:**
  * Full-width expansion upon clicking the search icon.
  * Instant autocomplete for phrases, categories, and top 4 matching product cards with real-time thumbnails and prices.
* **Utility Triggers:** Currency/locale selector, Account portal, Wishlist counter, Slide-out Cart Bag.

### 4.2 Homepage & Discovery
* **Full-Bleed Campaign Banners:** High-impact hero photography/video background with subtle centered headline and dual CTAs ("Shop Men" / "Shop Women").
* **Horizontal Product Discovery Rails:**
  * Powered by CSS scroll-snap (`scroll-snap-type: x mandatory`).
  * Subtle edge gradient fade masks (`fade-out-slider-wrapper`) signaling off-screen content.
  * Arrow navigation controls that automatically fade in upon hover on desktop.
* **Curated Capsule Stories:** Alternating full-width split blocks pairing storytelling photography with shoppable looks.

### 4.3 Product Listing Page (PLP) & Merchandising
* **Faceted Filter Drawer:**
  * Multi-select filters: Size, Color, Fit (Slim, Regular, Relaxed), Category, Material, Price Range.
  * Instant URL synchronization via query parameters (e.g., `?fit=slim&color=black&size=40R`) for shareability and back-button consistency.
  * Active filter pill tags with 1-click "Clear All".
* **Product Card Component:**
  * **Aspect Ratio:** `3:4` or `1:1.5` portrait fashion crop.
  * **Secondary Hover Image:** Smooth fade/swap to garment back-view or on-model movement on hover.
  * **Inline Color Swatches:** Interactive swatch dots allowing real-time preview of alternate colorways without leaving the PLP.
  * **Status Badges:** Minimalist tags ("New In", "Responsible Wool", "Exclusive").
  * **Quick Shop Drawer:** Bottom slide-up or overlay to choose size and add to bag in 1 click.

### 4.4 Product Detail Page (PDP) & Conversion Funnel
* **Split-Screen Gallery & Buying Console:**
  * **Left Column:** Vertical stack of 5–8 high-resolution garment shots (full body, front, back, lapel/fabric close-up, styled outfit). Zoomable on click.
  * **Right Column:** Sticky purchasing box that remains in viewport while the user scrolls through gallery photos.
* **Progressive Size Selection Accordion:**
  * Accordion-style size picker showing US/EU sizing, stock levels ("Only 2 left"), and back-in-stock alert notifications.
* **Size & Fit Intelligence (ML Fit Advisor):**
  * Interactive "Find My Size" modal gathering height, weight, belly/chest profile, and fit preference to recommend the optimal size.
* **Primary Add to Bag CTA:**
  * Full-width high-contrast button with visual feedback state.
  * Mobile Sticky Bar: Floating bar docked to the bottom of mobile screens when the main CTA scrolls out of view.
* **Modular Multi-Panel Accordion:**
  * Detailed specifications: *Product Details*, *Material & Care*, *Sustainability / Responsible Sourcing*, *Delivery & Free 30-Day Returns*.
* **"Complete the Look" Cross-Selling Module:**
  * Carousel showcasing complementary garments (e.g., shoes, shirt, tie, pocket square) with 1-click bundle selection.

### 4.5 Cart & Mini-Bag Slide-Out
* **Slide-Out Drawer (Off-Canvas):** Triggered immediately upon "Add to Bag" without forcing a full page redirect.
* **Free Shipping Meter:** Dynamic progress bar showing how much more is needed to unlock free express shipping.
* **Express Checkout Actions:** Direct Apple Pay, Google Pay, and PayPal buttons alongside standard checkout.

---

## 5. Technical Architecture & Data Layer

### 5.1 Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│   Next.js 15+ (App Router, React 19, TypeScript, Tailwind CSS)         │
│   • Server Components (RSC) for SSR & Instant Catalog Delivery         │
│   • Client Components for Interactive PDP Carousel, Swatches & Cart    │
│   • Dynamic Image Optimization (Next/Image + WebP/AVIF Edge CDN)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON (Edge Cached)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           API SERVICES LAYER                           │
│   Golang 1.24 (High-Throughput REST API Engine)                       │
│   • Fast routing (Chi / Gin) with structured middleware                │
│   • Strict domain modeling & clean architecture                        │
│   • pgx / sqlx connection pooling with prepared statements             │
│   • AI Embedding Service & Vector Similarity Scoring Pipeline          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ PostgreSQL Native Protocol
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           PERSISTENCE LAYER                            │
│   PostgreSQL 16 + pgvector Extension                                   │
│   • Relational Catalog: products, variants, categories, inventory      │
│   • Vector Store: High-dimensional embeddings (768d / 1536d)           │
│   • HNSW Vector Indexing for <10ms Nearest Neighbor Semantic Search    │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 PostgreSQL + pgvector Schema Architecture

```sql
-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(64) UNIQUE NOT NULL,
    brand VARCHAR(64) NOT NULL, -- e.g. 'BOSS', 'HUGO'
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    base_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Product Variants (Color, Size, SKU, Inventory)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_sku VARCHAR(64) UNIQUE NOT NULL,
    color_name VARCHAR(64) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    size VARCHAR(16) NOT NULL, -- e.g. '38R', '40R', 'M', 'L'
    stock_quantity INT NOT NULL DEFAULT 0,
    price_override DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. High-Resolution Product Media
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_name VARCHAR(64),
    url TEXT NOT NULL,
    alt_text TEXT,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE
);

-- 5. AI Vector Embeddings Store
CREATE TABLE product_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    embedding_type VARCHAR(32) NOT NULL, -- 'text_semantic' or 'visual_style'
    embedding vector(768) NOT NULL,       -- 768-dim (Gemini / CLIP) or 1536-dim (OpenAI)
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. HNSW Vector Index for Sub-10ms Cosine Similarity Search
CREATE INDEX product_embeddings_hnsw_idx 
ON product_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### 5.3 AI-Powered Features via pgvector

1. **Semantic Natural Language Search:**
   * Converts conversational customer queries into vector embeddings (e.g., *"slim navy wool suit for summer beach wedding"*).
   * Executes fast cosine distance search (`SELECT product_id, 1 - (embedding <=> $1) AS similarity ... ORDER BY similarity DESC LIMIT 20`).
2. **Visual & Style Similarity ("Similar Styles"):**
   * Computes nearest neighbors based on cut, silhouette, fabric texture, and style attributes.
3. **AI "Complete the Look" Cross-Selling:**
   * Finds matching accessories (ties, pocket squares, shirts, leather shoes) that complement the selected suit based on style vector compatibility across product categories.

### 5.4 Media & Asset Delivery Pipeline
* **Format:** Automatic AVIF / WebP conversion based on browser `Accept` header.
* **Quality Tuning:** Default quality index `q=85` for optimal balance between fabric texture detail and file size.
* **Breakpoints:** Responsive multi-tier presets (`320px`, `640px`, `1024px`, `1440px`, `1920px`).

---

## 6. Non-Functional Requirements (NFRs)

### 6.1 Performance & Core Web Vitals
* **Largest Contentful Paint (LCP):** `< 1.8s` on mobile 4G / desktop.
* **Interaction to Next Paint (INP):** `< 150ms`.
* **Cumulative Layout Shift (CLS):** `< 0.05` (rigid aspect-ratio placeholders for all images).
* **Time to First Byte (TTFB):** `< 300ms` via edge caching.

### 6.2 Accessibility (WCAG 2.1 Level AA)
* Keyboard skip links (`.skiplink__link`) allowing instant navigation to main content, filters, and checkout console.
* Full WAI-ARIA roles on all interactive components:
  * Accordions: `aria-expanded="false"`, `aria-controls="panel-id"`.
  * Modals: `role="dialog"`, `aria-modal="true"`, focus trap enabled.
  * Color Swatches: `aria-label="Select Midnight Blue colorway"`, `aria-pressed="true"`.
* Minimum touch target size of `44x44px` on mobile screens.

### 6.3 Security & Compliance
* Full PCI-DSS Level 1 compliance through tokenized payment providers (Stripe Elements / Adyen / PayPal).
* Content Security Policy (CSP) restricting frame ancestors and authorized script origins.
* GDPR and CCPA compliant cookie and tracking consent management.

---

## 7. Implementation Roadmap & Phasing

```
┌───────────────────────────────────────────────────────────────┐
│ Phase 1: Foundation & Core Catalog (Weeks 1 - 4)              │
│  • Establish Design Tokens, Typography, and Base CSS          │
│  • Build Navigation, Mega-Menu, and Responsive Shell          │
│  • Homepage with Full-Bleed Banners & Scroll-Snap Rails       │
├───────────────────────────────────────────────────────────────┤
│ Phase 2: Merchandising, PLP & Split-Screen PDP (Weeks 5 - 8)  │
│  • Dynamic PLP Grid with Faceted URL-Based Filtering          │
│  • Split-Screen PDP with Responsive WebP Gallery              │
│  • Size Accordion Picker & Sticky Add-to-Cart Console         │
├───────────────────────────────────────────────────────────────┤
│ Phase 3: Cart, Checkout & Conversion Polish (Weeks 9 - 11)    │
│  • Slide-Out Mini-Bag with Free Shipping Threshold Bar        │
│  • Express Mobile Wallet Checkout (Apple Pay / Google Pay)    │
│  • Complete the Look / Recommendation Rails                   │
├───────────────────────────────────────────────────────────────┤
│ Phase 4: Sizing Intelligence, A11y & Hardening (Weeks 12 - 14)│
│  • Interactive Size Advisor / Fit Calculator Integration      │
│  • Full WCAG 2.1 AA Audit & Core Web Vitals Optimization      │
│  • Production Launch & Monitoring                             │
└───────────────────────────────────────────────────────────────┘
```

---

## 8. Acceptance Criteria Summary

1. **Brand Aesthetic:** Clean monochrome interface with high-contrast typography and portrait product photography.
2. **PLP Fluidity:** Filtering and sorting updates results instantly without full page reloads.
3. **Sticky PDP Console:** Right purchasing rail remains fixed on desktop while left gallery scrolls through all photos.
4. **Mobile Performance:** Horizontal swipeable product rails maintain smooth 60fps scrolling with snap alignment.
5. **Accessibility:** 100% navigable via keyboard with visible focus outlines and verified screen-reader announcements.
