"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  SlidersHorizontal, 
  Grid3X3, 
  LayoutGrid, 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  X, 
  Check, 
  ChevronDown 
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
}

interface ProductVariant {
  id: string;
  variant_sku: string;
  color_name: string;
  color_hex: string;
  size: string;
}

interface Product {
  id: string;
  sku: string;
  brand: string;
  name: string;
  slug: string;
  description?: string;
  category_name?: string;
  base_price: number;
  currency: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const brandParam = searchParams.get("brand") || "ALL";
  const categoryParam = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState<string>(brandParam);
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam);
  const [columns, setColumns] = useState<3 | 4>(3);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [priceMax, setPriceMax] = useState<number>(1500);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let url = `${API_BASE_URL}/api/products`;
        const params = new URLSearchParams();
        if (activeBrand !== "ALL") params.append("brand", activeBrand);
        if (activeCategory) params.append("category", activeCategory);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed fetching catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeBrand, activeCategory]);

  const updateFilters = (newBrand: string, newCategory: string) => {
    setActiveBrand(newBrand);
    setActiveCategory(newCategory);
    const params = new URLSearchParams();
    if (newBrand !== "ALL") params.append("brand", newBrand);
    if (newCategory) params.append("category", newCategory);
    router.push(`/products?${params.toString()}`);
  };

  const filtered = products.filter((p) => p.base_price <= priceMax);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs">
          <Link 
            href="/"
            className="flex items-center gap-2 uppercase tracking-widest font-bold hover:text-neutral-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>

          <Link href="/" className="text-xl font-black tracking-[0.25em] uppercase">
            HUGO BOSS
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/checkout"
              className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CATALOG HERO TITLE */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6 border-b border-neutral-200">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
          The Curated Collection
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            {activeBrand === "ALL" ? "All Masterpieces" : `${activeBrand} Collection`}
          </h1>
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
            {filtered.length} Tailored Articles Available
          </span>
        </div>
      </div>

      {/* 3. FILTER & TOOLBAR */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-b border-neutral-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="flex items-center gap-2 font-bold uppercase tracking-wider hover:text-neutral-600 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters {activeBrand !== "ALL" || activeCategory ? "(Active)" : ""}</span>
          </button>

          {/* Quick Category Chips */}
          <div className="hidden md:flex items-center gap-3">
            {[
              { label: "All Items", cat: "" },
              { label: "Suits & Tailoring", cat: "suits-tailoring" },
              { label: "Shirts", cat: "shirts" },
              { label: "Jackets & Coats", cat: "jackets-coats" },
            ].map((chip) => (
              <button
                key={chip.cat}
                onClick={() => updateFilters(activeBrand, chip.cat)}
                className={`px-3 py-1.5 rounded-full uppercase tracking-wider text-[11px] font-semibold transition-all ${
                  activeCategory === chip.cat
                    ? "bg-black text-white"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column switchers */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-neutral-400 uppercase tracking-widest text-[10px] mr-2">Layout:</span>
          <button
            onClick={() => setColumns(3)}
            className={`p-1.5 border ${columns === 3 ? "border-black bg-black text-white" : "border-neutral-200 text-neutral-600"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setColumns(4)}
            className={`p-1.5 border ${columns === 4 ? "border-black bg-black text-white" : "border-neutral-200 text-neutral-600"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. EXPANDABLE FILTER DRAWER */}
      {filterDrawerOpen && (
        <div className="max-w-7xl mx-auto px-6 py-6 border-b border-neutral-200 bg-neutral-50 animate-in fade-in duration-200 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Filter */}
            <div>
              <span className="font-bold uppercase tracking-wider block mb-3">Brand Line</span>
              <div className="flex gap-2">
                {["ALL", "BOSS", "HUGO"].map((b) => (
                  <button
                    key={b}
                    onClick={() => updateFilters(b, activeCategory)}
                    className={`px-4 py-2 border uppercase font-bold text-xs ${
                      activeBrand === b ? "bg-black text-white border-black" : "bg-white border-neutral-200 hover:border-black"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <span className="font-bold uppercase tracking-wider block mb-3">
                Max Price: ${priceMax} USD
              </span>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setPriceMax(1500);
                  updateFilters("ALL", "");
                }}
                className="text-neutral-500 hover:text-black underline uppercase tracking-wider font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PRODUCT GRID */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20 font-mono text-xs uppercase tracking-widest text-neutral-400 animate-pulse">
            Querying PostgreSQL Catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold uppercase tracking-tight">No Garments Match Filter</h3>
            <p className="text-xs text-neutral-500 mt-2">Try adjusting price thresholds or clearing category filters.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-8`}>
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group border border-neutral-100 hover:border-black transition-all p-3 block bg-white"
              >
                <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden mb-4">
                  <Image
                    src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    {product.brand}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                  <span>{product.category_name || "Tailoring"}</span>
                  <span className="font-mono">{product.sku}</span>
                </div>

                <h3 className="font-bold text-sm line-clamp-1 group-hover:underline">
                  {product.name}
                </h3>

                <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                  {product.description}
                </p>

                {/* Color swatches */}
                {product.variants && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {Array.from(new Set(product.variants.map((v) => v.color_hex))).map((hex, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-neutral-300"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="font-bold text-sm">
                    ${product.base_price.toLocaleString()} {product.currency}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 group-hover:text-black">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
