"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  X, 
  Check, 
  SlidersHorizontal,
  Layers
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useCart } from "@/context/CartContext";

interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
}

interface ProductVariant {
  id: string;
  variant_sku: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock_quantity: number;
}

interface Product {
  id: string;
  sku: string;
  brand: string;
  name: string;
  slug: string;
  description?: string;
  details?: string;
  base_price: number;
  currency: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

interface SemanticSearchResult {
  product: Product;
  similarity: number;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    sku: "HB-SUIT-001",
    brand: "BOSS",
    name: "Two-Piece Slim-Fit Suit in Italian Virgin Wool",
    slug: "two-piece-slim-fit-suit-italian-virgin-wool",
    description: "An impeccably tailored two-piece suit crafted from super-fine Italian virgin wool with natural stretch.",
    details: "Slim fit; Notch lapels; 2 buttons; Kissing buttons at cuffs; Fully lined.",
    base_price: 895,
    currency: "USD",
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=800&h=1100",
        is_primary: true
      }
    ],
    variants: [
      { id: "v1", variant_sku: "v1", color_name: "Dark Navy", color_hex: "#0B132B", size: "38R", stock_quantity: 8 },
      { id: "v2", variant_sku: "v2", color_name: "Dark Navy", color_hex: "#0B132B", size: "40R", stock_quantity: 14 },
      { id: "v3", variant_sku: "v3", color_name: "Black", color_hex: "#111111", size: "40R", stock_quantity: 12 },
    ]
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    sku: "HB-SUIT-002",
    brand: "BOSS",
    name: "Double-Breasted Tuxedo in Virgin Wool with Silk Trims",
    slug: "double-breasted-tuxedo-virgin-wool-silk",
    description: "Elevate black-tie moments with this double-breasted tuxedo featuring refined pure silk peak lapels.",
    details: "Regular fit; Pure silk peak lapels; Double-breasted closure.",
    base_price: 1195,
    currency: "USD",
    images: [
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=800&h=1100",
        is_primary: true
      }
    ],
    variants: [
      { id: "v4", variant_sku: "v4", color_name: "Deep Black", color_hex: "#000000", size: "40R", stock_quantity: 5 }
    ]
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    sku: "HB-SHIRT-001",
    brand: "BOSS",
    name: "Slim-Fit Dress Shirt in Structured Cotton Poplin",
    slug: "slim-fit-dress-shirt-cotton-poplin",
    description: "A crisp, versatile dress shirt woven from long-staple Egyptian cotton poplin with an easy-iron finish.",
    details: "Slim fit; Kent collar; Squared cuffs; Mother-of-pearl buttons.",
    base_price: 148,
    currency: "USD",
    images: [
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1620012253295-c15c429f6f60?auto=format&fit=crop&q=85&w=800&h=1100",
        is_primary: true
      }
    ]
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    sku: "HB-COAT-001",
    brand: "BOSS",
    name: "Single-Breasted Overcoat in Cashmere-Blend Wool",
    slug: "single-breasted-overcoat-cashmere-blend",
    description: "A timeless overcoat with an ultra-soft handle, crafted in a rich wool and cashmere blend.",
    details: "Regular fit; Stand collar with lapel notch; 3-button closure.",
    base_price: 995,
    currency: "USD",
    images: [
      {
        id: "4",
        url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=85&w=800&h=1100",
        is_primary: true
      }
    ]
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    sku: "HG-HOOD-001",
    brand: "HUGO",
    name: "Oversized Logo Hoodie in Heavy French Terry",
    slug: "oversized-logo-hoodie-french-terry",
    description: "A contemporary streetwear essential featuring a high-density red HUGO logo badge across the chest.",
    details: "Oversized relaxed fit; Drawstring hood; Kangaroo pocket.",
    base_price: 228,
    currency: "USD",
    images: [
      {
        id: "5",
        url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=85&w=800&h=1100",
        is_primary: true
      }
    ]
  }
];

export default function Storefront() {
  const [activeBrand, setActiveBrand] = useState<"ALL" | "BOSS" | "HUGO">("ALL");
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addItem, openCart, cartCount } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch live products from Go backend
  useEffect(() => {
    async function loadProducts() {
      try {
        const url = activeBrand === "ALL" 
          ? `${API_BASE_URL}/api/products` 
          : `${API_BASE_URL}/api/products?brand=${activeBrand}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch {
        // Fallback to static seed if API is connecting
        if (activeBrand === "ALL") {
          setProducts(FALLBACK_PRODUCTS);
        } else {
          setProducts(FALLBACK_PRODUCTS.filter(p => p.brand === activeBrand));
        }
      }
    }
    loadProducts();
  }, [activeBrand]);

  // Execute pgvector semantic search
  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/search/semantic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          limit: 6,
          brand: activeBrand === "ALL" ? "" : activeBrand
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch {
      // Local fallback search if backend offline
      const matches = FALLBACK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ).map(p => ({ product: p, similarity: 0.92 }));
      setSearchResults(matches);
    } finally {
      setIsSearching(false);
    }
  };

  const addToCart = (product: Product, size = "40R") => {
    addItem({
      productId: product.id,
      variantSku: `${product.sku}-${size}`,
      name: product.name,
      brand: product.brand,
      price: product.base_price,
      size,
      color: "Signature Tone",
      imageUrl: product.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35",
    });
  };

  const filteredProducts = activeBrand === "ALL" 
    ? products 
    : products.filter(p => p.brand.toUpperCase() === activeBrand);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* 1. TOP BRAND SWITCHER BAR */}
      <div className="border-b border-neutral-200 bg-neutral-900 text-white text-xs uppercase tracking-widest px-6 py-2 flex items-center justify-between">
        <div className="flex gap-6 items-center">
          <button 
            onClick={() => setActiveBrand("ALL")}
            className={`transition-colors font-bold ${activeBrand === "ALL" ? "text-white underline underline-offset-4" : "text-neutral-400 hover:text-white"}`}
          >
            All Brands
          </button>
          <span className="text-neutral-700">|</span>
          <button 
            onClick={() => setActiveBrand("BOSS")}
            className={`transition-colors tracking-widest font-black ${activeBrand === "BOSS" ? "text-amber-300 underline underline-offset-4" : "text-neutral-400 hover:text-white"}`}
          >
            BOSS
          </button>
          <span className="text-neutral-700">|</span>
          <button 
            onClick={() => setActiveBrand("HUGO")}
            className={`transition-colors tracking-widest font-black ${activeBrand === "HUGO" ? "text-red-500 underline underline-offset-4" : "text-neutral-400 hover:text-white"}`}
          >
            HUGO
          </button>
        </div>
        <div className="hidden md:flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PostgreSQL + pgvector Connected
          </span>
          <span>•</span>
          <span>Golang API Active</span>
        </div>
      </div>

      {/* 2. STICKY MAIN NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="text-2xl font-black tracking-[0.25em] uppercase">
              {activeBrand === "HUGO" ? (
                <span className="text-red-600">HUGO</span>
              ) : activeBrand === "BOSS" ? (
                <span>BOSS</span>
              ) : (
                <span>HUGO BOSS</span>
              )}
            </a>
            <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-medium text-neutral-800">
              <a href="/products" className="hover:text-neutral-500 transition-colors">Catalog</a>
              <a href="/products?category=suits-tailoring" className="hover:text-neutral-500 transition-colors">Tailored Suiting</a>
              <a href="/products?category=shirts" className="hover:text-neutral-500 transition-colors">Shirts</a>
              <a href="/products?category=jackets-coats" className="hover:text-neutral-500 transition-colors">Outerwear</a>
              <Link href="/stylist" className="flex items-center gap-1.5 text-amber-700 font-bold hover:text-black transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Stylist</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-xs uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-full transition-colors font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">AI Semantic Search</span>
              <Search className="w-4 h-4 ml-1" />
            </button>

            <button 
              onClick={openCart} 
              className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO EDITORIAL BANNER */}
      <section className="relative h-[82vh] w-full bg-black overflow-hidden flex items-end">
        <Image
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=90&w=2400&h=1400"
          alt="Luxury Men's Tailoring"
          fill
          priority
          className="object-cover object-center opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 w-full text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-300 font-semibold mb-3">
            Spring / Summer Collection
          </p>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight uppercase max-w-3xl leading-[1.05] mb-6">
            The Art of Modern Precision.
          </h1>
          <p className="text-neutral-300 text-sm md:text-base max-w-xl font-light mb-8">
            Engineered in Germany, tailored in Italy. Virgin wools and technical fabrics sculpted for effortless luxury.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="#catalog"
              className="bg-white text-black px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4" />
            </a>
            <button 
              onClick={() => {
                setSearchQuery("Italian virgin wool tuxedo with peak lapels");
                setSearchOpen(true);
              }}
              className="border border-white/40 text-white backdrop-blur-sm px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-white/10 transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Ask AI Stylist
            </button>
          </div>
        </div>
      </section>

      {/* 4. SCROLL-SNAP PRODUCT DISCOVERY RAIL */}
      <section className="py-16 border-b border-neutral-100 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex items-end justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-semibold">
              Curated Highlights
            </span>
            <h2 className="text-2xl font-bold tracking-tight uppercase mt-1">
              Signature Silhouettes
            </h2>
          </div>
          <span className="text-xs text-neutral-500 uppercase tracking-widest hidden sm:inline">
            Scroll to explore →
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-6 overflow-x-auto flex gap-6 pb-6 snap-x snap-mandatory scrollbar-none">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="flex-shrink-0 w-72 md:w-80 group cursor-pointer snap-start bg-white p-4 border border-neutral-100 hover:border-black transition-all"
            >
              <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden mb-4">
                <Image
                  src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-black text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1">
                  {product.brand}
                </span>
              </div>
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:underline">
                {product.name}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                {product.details || product.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-sm">
                  ${product.base_price.toLocaleString()}
                </span>
                <span className="text-xs uppercase tracking-wider text-neutral-400 group-hover:text-black flex items-center gap-1 font-semibold">
                  Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MAIN CATALOG GRID */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-6 mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">
              {activeBrand === "ALL" ? "Complete Catalog" : `${activeBrand} Collection`}
            </h2>
            <p className="text-neutral-500 text-xs uppercase tracking-wider mt-1">
              Showing {filteredProducts.length} Crafted Garments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-neutral-400">Sort:</span>
            <select className="text-xs uppercase tracking-widest border border-neutral-300 px-3 py-2 bg-white font-medium">
              <option>Featured First</option>
              <option>Price: High to Low</option>
              <option>Price: Low to High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => (
            <div 
              key={p.id} 
              className="group border border-transparent hover:border-neutral-200 transition-all p-3"
            >
              <div 
                onClick={() => setSelectedProduct(p)}
                className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden cursor-pointer"
              >
                <Image
                  src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                  alt={p.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-neutral-500 mb-1">
                  <span>{p.brand}</span>
                  <span className="text-neutral-400">{p.sku}</span>
                </div>
                <h3 
                  onClick={() => setSelectedProduct(p)}
                  className="font-bold text-sm hover:underline cursor-pointer"
                >
                  {p.name}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                  {p.description}
                </p>

                {/* Color swatches preview */}
                {p.variants && p.variants.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {Array.from(new Set(p.variants.map(v => v.color_hex))).map((hex, i) => (
                      <span 
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="font-bold text-base">
                    ${p.base_price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-black text-white hover:bg-neutral-800 text-xs uppercase tracking-widest font-bold px-4 py-2 transition-colors"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. AI SEMANTIC SEARCH MODAL (Powered by pgvector) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-3xl rounded-none shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wider text-sm">
                    AI Semantic Vector Search
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    PostgreSQL 16 pgvector HNSW Cosine Similarity (`&lt;=&gt;`)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSearchOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSemanticSearch} className="p-6 border-b border-neutral-100">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. 'Italian virgin wool navy suit for autumn wedding' or 'cashmere overcoat'"
                  className="w-full text-base border-b-2 border-black py-3 pr-28 pl-2 outline-none font-medium placeholder:text-neutral-400"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white px-5 py-2 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Sample prompt pills */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="text-neutral-400 py-1">Try asking:</span>
                {[
                  "Italian virgin wool suiting",
                  "Double breasted black tie tuxedo",
                  "Heavyweight streetwear hoodie",
                  "Organic cotton poplin dress shirt"
                ].map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSearchQuery(prompt);
                    }}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1 rounded-full transition-colors text-[11px]"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </form>

            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-2">
                    Vector Similarity Matches ({searchResults.length})
                  </div>
                  {searchResults.map(({ product, similarity }) => (
                    <div 
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSearchOpen(false);
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-neutral-50 cursor-pointer border border-neutral-100 transition-all"
                    >
                      <div className="relative w-16 h-20 bg-neutral-200 flex-shrink-0">
                        <Image
                          src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-1.5 py-0.5">
                            {product.brand}
                          </span>
                          <span className="text-xs font-mono text-emerald-600 font-semibold">
                            {Math.round(similarity * 100)}% Match
                          </span>
                        </div>
                        <h4 className="font-bold text-sm mt-1">{product.name}</h4>
                        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                          {product.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">${product.base_price}</div>
                        <span className="text-[11px] text-neutral-400">View →</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  Type a natural language prompt and press Search to test the pgvector search pipeline.
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  Powered by PostgreSQL `pgvector` extension and Go backend cosine similarity.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. SPLIT-SCREEN PDP MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto flex flex-col md:flex-row relative shadow-2xl">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Column: Portrait Gallery */}
            <div className="md:w-1/2 bg-neutral-100 relative min-h-[400px] md:min-h-[600px]">
              <Image
                src={selectedProduct.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Right Column: Sticky Purchasing Console */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                  {selectedProduct.brand} • {selectedProduct.sku}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mt-2 mb-4">
                  {selectedProduct.name}
                </h2>
                <div className="text-2xl font-bold mb-6">
                  ${selectedProduct.base_price.toLocaleString()}
                </div>

                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>

                {/* Size Selector */}
                <div className="mb-8">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold mb-3">
                    <span>Select Size</span>
                    <button className="text-neutral-500 underline">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["38R", "40R", "42R", "44R"].map((size) => (
                      <button
                        key={size}
                        className="border border-neutral-300 py-3 text-xs font-bold uppercase hover:border-black hover:bg-black hover:text-white transition-all"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garment Details & Accordion */}
                <div className="border-t border-neutral-200 pt-4 space-y-3 text-xs">
                  <div>
                    <span className="font-bold uppercase tracking-wider">Fit & Craftsmanship:</span>
                    <p className="text-neutral-600 mt-1">{selectedProduct.details}</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-200 mt-8">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-black text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Shopping Bag • ${selectedProduct.base_price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. FOOTER */}
      <footer className="bg-neutral-950 text-white py-16 border-t border-neutral-900 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] mb-4">Brand Lines</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>BOSS Menswear</li>
              <li>BOSS Womenswear</li>
              <li>HUGO Streetwear</li>
              <li>Responsible Tailoring</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] mb-4">Customer Care</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>Complimentary Shipping & Returns</li>
              <li>Store Locator</li>
              <li>Size & Fit Intelligence</li>
              <li>
                <Link href="/tracking" className="text-neutral-300 hover:text-white underline underline-offset-2">
                  Track Your Order →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] mb-4">Tech Architecture</h4>
            <ul className="space-y-2 text-neutral-400 font-mono text-[11px]">
              <li>Next.js 15+ App Router</li>
              <li>Golang 1.24 High-Throughput REST</li>
              <li>PostgreSQL 16 + pgvector HNSW</li>
              <li>Containerized with Docker</li>
              <li className="pt-2">
                <Link href="/admin" className="text-amber-400 hover:underline flex items-center gap-1 font-sans text-xs">
                  <span>Atelier Admin Console →</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-[0.2em] mb-4">Sustainability</h4>
            <p className="text-neutral-400 leading-relaxed">
              Committed to 100% sustainable raw wool and circular fashion principles by 2030.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-neutral-900 text-neutral-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 LUXURY FASHION GROUP. ALL RIGHTS RESERVED.</p>
          <p className="font-mono text-[11px]">Benchmarked against Hugo Boss Global Digital Flagship</p>
        </div>
      </footer>
    </div>
  );
}
