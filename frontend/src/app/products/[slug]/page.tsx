"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ShoppingBag, 
  Heart, 
  Share2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowLeft, 
  Ruler, 
  Truck, 
  ShieldCheck, 
  RefreshCw,
  X
} from "lucide-react";

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
  material_care?: string;
  sustainability_note?: string;
  category_name?: string;
  base_price: number;
  currency: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

interface SimilarProductResult {
  product: Product;
  similarity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [similarItems, setSimilarItems] = useState<SimilarProductResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [fitModalOpen, setFitModalOpen] = useState(false);
  
  // Fit advisor state
  const [heightCm, setHeightCm] = useState(180);
  const [weightKg, setWeightKg] = useState(78);
  const [fitPreference, setFitPreference] = useState<"slim" | "regular">("slim");
  const [recommendedSize, setRecommendedSize] = useState<string>("");

  // Accordion open states
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    details: true,
    material: false,
    sustainability: false,
    shipping: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!slug) return;
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/products/${slug}`);
        if (res.ok) {
          const data: Product = await res.json();
          setProduct(data);
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0].url);
          }
          if (data.variants && data.variants.length > 0) {
            setSelectedSize(data.variants[0].size);
            setSelectedColor(data.variants[0].color_name);
          }

          // Fetch pgvector similar items
          const simRes = await fetch(`http://localhost:8080/api/products/${data.id}/similar?limit=4`);
          if (simRes.ok) {
            const simData = await simRes.json();
            setSimilarItems(simData.similar || []);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const calculateRecommendedSize = () => {
    let size = "40R";
    const bmi = weightKg / ((heightCm / 100) * (heightCm / 100));
    if (bmi < 22) {
      size = "38R";
    } else if (bmi >= 22 && bmi < 26) {
      size = fitPreference === "slim" ? "40R" : "42R";
    } else {
      size = "44R";
    }
    setRecommendedSize(size);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-neutral-500 animate-pulse">
          Loading Garment Architecture...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-4">Garment Not Found</h1>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4">
          Return to Flagship Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* 1. TOP UTILITY HEADER */}
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
            {product.brand === "HUGO" ? <span className="text-red-600">HUGO</span> : <span>BOSS</span>}
          </Link>

          <button 
            onClick={() => setCartOpen(true)}
            className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. SPLIT-SCREEN EDITORIAL PDP */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* LEFT COLUMN: Multi-Tier High-Resolution Portrait Gallery */}
          <div className="lg:w-7/12">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden border border-neutral-100">
              <Image
                src={selectedImage || product.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                alt={product.name}
                fill
                priority
                className="object-cover object-center"
              />
              <span className="absolute top-4 left-4 bg-black text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5">
                {product.brand} • {product.category_name || "Tailoring"}
              </span>
            </div>

            {/* Thumbnail switcher gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-20 h-28 flex-shrink-0 bg-neutral-100 border-2 transition-all ${
                      selectedImage === img.url ? "border-black" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt={img.alt_text || "Thumbnail"} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sticky Purchasing Console */}
          <div className="lg:w-5/12">
            <div className="sticky top-24 space-y-6">
              {/* Breadcrumb & SKU */}
              <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-neutral-500">
                <span>{product.brand} Atelier</span>
                <span className="font-mono">{product.sku}</span>
              </div>

              {/* Title & Price */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight leading-tight">
                  {product.name}
                </h1>
                <div className="text-2xl font-black mt-3">
                  ${product.base_price.toLocaleString()} {product.currency}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-sm text-neutral-600 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Colorway Selection */}
              {product.variants && (
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold mb-2 flex items-center justify-between">
                    <span>Colorway: <strong className="font-bold">{selectedColor}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {Array.from(new Set(product.variants.map((v) => v.color_name))).map((colorName) => {
                      const variant = product.variants?.find((v) => v.color_name === colorName);
                      const isSelected = selectedColor === colorName;
                      return (
                        <button
                          key={colorName}
                          onClick={() => {
                            setSelectedColor(colorName);
                            if (variant) setSelectedSize(variant.size);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-semibold uppercase tracking-wider transition-all ${
                            isSelected ? "border-black bg-neutral-50" : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                            style={{ backgroundColor: variant?.color_hex || "#000" }}
                          />
                          <span>{colorName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector Accordion with AI Fit Advisor */}
              <div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold mb-2">
                  <span>Select Size</span>
                  <button
                    onClick={() => {
                      calculateRecommendedSize();
                      setFitModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-neutral-600 hover:text-black font-semibold underline underline-offset-4"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Fit Advisor</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {["38R", "40R", "42R", "44R"].map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-white text-neutral-800 border-neutral-200 hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={() => setCartOpen(true)}
                  className="w-full bg-black text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Shopping Bag • ${product.base_price}
                </button>

                <div className="flex items-center justify-center gap-6 text-[11px] text-neutral-500 uppercase tracking-widest pt-2">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> Complimentary Shipping
                  </span>
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Free 30-Day Returns
                  </span>
                </div>
              </div>

              {/* 3. MULTI-PANEL ACCORDIONS */}
              <div className="border-t border-neutral-200 pt-6 space-y-4">
                {/* Details Accordion */}
                <div className="border-b border-neutral-100 pb-4">
                  <button
                    onClick={() => toggleSection("details")}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-left"
                  >
                    <span>Tailoring & Silhouette Details</span>
                    {openSections.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openSections.details && (
                    <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                      {product.details || "Crafted to exacting German specifications with traditional horsehair chest canvassing for a sculpted, enduring drape."}
                    </p>
                  )}
                </div>

                {/* Material & Care */}
                <div className="border-b border-neutral-100 pb-4">
                  <button
                    onClick={() => toggleSection("material")}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-left"
                  >
                    <span>Fabric Composition & Care</span>
                    {openSections.material ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openSections.material && (
                    <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                      {product.material_care || "100% Super-Fine Virgin Wool woven in Biella, Italy. Lining: 100% Cupro. Professional gentle dry clean only."}
                    </p>
                  )}
                </div>

                {/* Sustainability */}
                <div className="border-b border-neutral-100 pb-4">
                  <button
                    onClick={() => toggleSection("sustainability")}
                    className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-left"
                  >
                    <span>Responsible Sourcing Standards</span>
                    {openSections.sustainability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openSections.sustainability && (
                    <p className="text-xs text-neutral-600 mt-3 leading-relaxed">
                      {product.sustainability_note || "RESPONSIBLE Commitment: Produced with mulesing-free virgin wool from farms adhering to verified animal-welfare benchmarks."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. AI "COMPLETE THE LOOK" / "SIMILAR STYLES" RAIL (pgvector) */}
        {similarItems.length > 0 && (
          <section className="mt-24 pt-16 border-t border-neutral-200">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  AI Vector Recommendation Engine
                </span>
                <h2 className="text-2xl font-black tracking-tight uppercase mt-1">
                  Complete the Look & Similar Styles
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                pgvector cosine distance ranked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarItems.map(({ product: item, similarity }) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="group bg-white border border-neutral-100 hover:border-black transition-all p-3 block"
                >
                  <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden mb-3">
                    <Image
                      src={item.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-mono font-bold px-1.5 py-0.5">
                      {Math.round(similarity * 100)}% Style Match
                    </span>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                    {item.brand}
                  </div>
                  <h3 className="font-bold text-xs line-clamp-1 group-hover:underline">
                    {item.name}
                  </h3>
                  <div className="font-black text-sm mt-2">
                    ${item.base_price.toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 5. AI FIT ADVISOR MODAL */}
      {fitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-8 shadow-2xl relative">
            <button
              onClick={() => setFitModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider text-sm">
                  AI Fit Intelligence Advisor
                </h3>
                <p className="text-xs text-neutral-500">
                  Precision measurement modeling for {product.brand}
                </p>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider block mb-2">
                  Height: {heightCm} cm ({Math.floor(heightCm / 30.48)}&apos;{Math.round((heightCm % 30.48) / 2.54)}&quot;)
                </label>
                <input
                  type="range"
                  min="160"
                  max="205"
                  value={heightCm}
                  onChange={(e) => {
                    setHeightCm(Number(e.target.value));
                    calculateRecommendedSize();
                  }}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider block mb-2">
                  Weight: {weightKg} kg ({Math.round(weightKg * 2.20462)} lbs)
                </label>
                <input
                  type="range"
                  min="55"
                  max="130"
                  value={weightKg}
                  onChange={(e) => {
                    setWeightKg(Number(e.target.value));
                    calculateRecommendedSize();
                  }}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider block mb-2">
                  Fit Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFitPreference("slim");
                      calculateRecommendedSize();
                    }}
                    className={`py-3 border uppercase font-bold text-xs ${
                      fitPreference === "slim" ? "border-black bg-black text-white" : "border-neutral-200"
                    }`}
                  >
                    Tailored Slim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFitPreference("regular");
                      calculateRecommendedSize();
                    }}
                    className={`py-3 border uppercase font-bold text-xs ${
                      fitPreference === "regular" ? "border-black bg-black text-white" : "border-neutral-200"
                    }`}
                  >
                    Classic Regular
                  </button>
                </div>
              </div>

              {/* Recommendation Output */}
              <div className="bg-neutral-50 border border-neutral-200 p-4 mt-6 text-center">
                <span className="text-neutral-500 uppercase tracking-widest text-[10px] font-semibold block mb-1">
                  AI Recommended Size
                </span>
                <div className="text-3xl font-black">{recommendedSize || "40R"}</div>
                <p className="text-neutral-500 text-[11px] mt-1">
                  89% of customers with similar measurements preferred size {recommendedSize || "40R"}.
                </p>
                <button
                  onClick={() => {
                    setSelectedSize(recommendedSize || "40R");
                    setFitModalOpen(false);
                  }}
                  className="mt-4 bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  Apply Size {recommendedSize || "40R"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SLIDE-OUT CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-8 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                <h3 className="font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Shopping Bag (1)
                </h3>
                <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 border-b border-neutral-100 flex gap-4">
                <div className="relative w-20 h-28 bg-neutral-100 flex-shrink-0">
                  <Image
                    src={selectedImage || product.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold uppercase tracking-wider text-neutral-400">{product.brand}</span>
                  <h4 className="font-bold text-sm mt-0.5">{product.name}</h4>
                  <p className="text-neutral-500 mt-1">Color: {selectedColor || "Dark Navy"} • Size: {selectedSize || "40R"}</p>
                  <div className="font-bold text-sm mt-3">${product.base_price.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-200">
              <div className="flex items-center justify-between text-sm font-bold uppercase mb-4">
                <span>Subtotal</span>
                <span>${product.base_price.toLocaleString()} USD</span>
              </div>
              <button className="w-full bg-black text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-neutral-800 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
