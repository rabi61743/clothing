"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowLeft, 
  ShoppingBag, 
  Check, 
  Layers, 
  Send, 
  RefreshCw, 
  CheckCircle2,
  ChevronRight
} from "lucide-react";

interface OutfitItem {
  category: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  color: string;
  reason: string;
}

interface OutfitPreset {
  id: string;
  title: string;
  occasion: string;
  description: string;
  harmonyScore: number;
  items: OutfitItem[];
}

const PRESET_OUTFITS: OutfitPreset[] = [
  {
    id: "black-tie-gala",
    title: "The Sovereign Black-Tie",
    occasion: "Gala & Opera Premiere",
    description: "Architectural double-breasted tuxedo paired with structured Egyptian cotton and pure silk accents for unmatched evening elegance.",
    harmonyScore: 98,
    items: [
      {
        category: "Outerwear & Tailoring",
        name: "Double-Breasted Tuxedo in Virgin Wool with Silk Trims",
        brand: "BOSS",
        price: 1195,
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=800&h=1100",
        color: "Deep Black",
        reason: "Silk peak lapels create regal framing under dramatic indoor lighting."
      },
      {
        category: "Shirt & Collar",
        name: "Slim-Fit Dress Shirt in Structured Cotton Poplin",
        brand: "BOSS",
        price: 148,
        image: "https://images.unsplash.com/photo-1620012253295-c15c429f6f60?auto=format&fit=crop&q=85&w=800&h=1100",
        color: "Optical White",
        reason: "High-thread-count poplin ensures crisp collar posture throughout the evening."
      },
      {
        category: "Overcoat Layer",
        name: "Single-Breasted Overcoat in Cashmere-Blend Wool",
        brand: "BOSS",
        price: 995,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=85&w=800&h=1100",
        color: "Camel",
        reason: "Rich camel wool provides high-contrast warmth arriving at the venue."
      }
    ]
  },
  {
    id: "executive-boardroom",
    title: "The Milanese Power Look",
    occasion: "Executive Boardroom & Keynote",
    description: "Natural stretch Italian virgin wool in dark navy, projecting quiet authority, precision tailoring, and modern versatility.",
    harmonyScore: 95,
    items: [
      {
        category: "Tailored Suiting",
        name: "Two-Piece Slim-Fit Suit in Italian Virgin Wool",
        brand: "BOSS",
        price: 895,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=800&h=1100",
        color: "Dark Navy",
        reason: "Super-fine Biella virgin wool drapes cleanly with breathable all-day comfort."
      },
      {
        category: "Dress Shirt",
        name: "Slim-Fit Dress Shirt in Structured Cotton Poplin",
        brand: "BOSS",
        price: 148,
        image: "https://images.unsplash.com/photo-1620012253295-c15c429f6f60?auto=format&fit=crop&q=85&w=800&h=1100",
        color: "Optical White",
        reason: "Kent collar perfectly frames neckwear without gapping."
      }
    ]
  },
  {
    id: "streetwear-atelier",
    title: "Berlin Neo-Streetwear",
    occasion: "Gallery Opening & Weekend Social",
    description: "Heavyweight 450gsm French terry loops meet stark red typography for an unapologetic urban statement.",
    harmonyScore: 92,
    items: [
      {
        category: "Streetwear Top",
        name: "Oversized Logo Hoodie in Heavy French Terry",
        brand: "HUGO",
        price: 228,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=85&w=800&h=1100",
        color: "Black / Red",
        reason: "Boxy silhouette with dropped shoulders delivers contemporary edge."
      },
      {
        category: "Tailored Contrast",
        name: "Single-Breasted Overcoat in Cashmere-Blend Wool",
        brand: "BOSS",
        price: 995,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=85&w=800&h=1100",
        color: "Black",
        reason: "High-low layering combining tailored luxury outerwear over streetwear."
      }
    ]
  }
];

export default function StylistStudioPage() {
  const router = useRouter();

  const [activePreset, setActivePreset] = useState<OutfitPreset>(PRESET_OUTFITS[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const subtotal = activePreset.items.reduce((acc, curr) => acc + curr.price, 0);
  const bundleDiscount = subtotal * 0.10; // 10% Atelier bundle discount
  const finalTotal = subtotal - bundleDiscount;

  const handleCustomGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    try {
      // Query pgvector backend semantic search for top items matching the occasion
      const res = await fetch("http://localhost:8080/api/search/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: customPrompt, limit: 3 })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const generatedItems: OutfitItem[] = data.results.map((r: any, idx: number) => ({
            category: idx === 0 ? "Hero Garment" : idx === 1 ? "Complementary Layer" : "Accompanying Piece",
            name: r.product.name,
            brand: r.product.brand,
            price: r.product.base_price,
            image: r.product.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35",
            color: "Signature Tone",
            reason: `Vector match similarity (${Math.round(r.similarity * 100)}%) for prompt: "${customPrompt}"`
          }));

          setActivePreset({
            id: "custom-look",
            title: `Custom AI Look: "${customPrompt}"`,
            occasion: customPrompt,
            description: "Custom curated ensemble generated through pgvector cosine distance across fabric, silhouette, and dress code.",
            harmonyScore: 96,
            items: generatedItems
          });
        }
      }
    } catch (err) {
      console.error("AI Stylist generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddLookToBag = () => {
    setAddedSuccess(true);
    setTimeout(() => {
      router.push("/checkout");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-black font-sans selection:bg-black selection:text-white">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs">
          <Link 
            href="/"
            className="flex items-center gap-2 uppercase tracking-widest font-bold hover:text-neutral-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>

          <Link href="/" className="text-xl font-black tracking-[0.25em] uppercase flex items-center gap-2">
            <span>HUGO BOSS</span>
            <span className="text-[10px] font-mono font-normal bg-neutral-100 px-2 py-0.5 rounded-full">
              ATELIER AI
            </span>
          </Link>

          <Link 
            href="/checkout"
            className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* 2. HERO TITLE & OCCASION TABS */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Styling Engine • pgvector Vector Compatibility
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-2">
              The Virtual Atelier & AI Stylist
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 font-bold uppercase tracking-wider">
              Ensemble Harmony: {activePreset.harmonyScore}%
            </span>
          </div>
        </div>

        {/* Occasion Switcher */}
        <div className="flex flex-wrap gap-3 mt-6">
          {PRESET_OUTFITS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setActivePreset(preset)}
              className={`px-5 py-2.5 text-xs uppercase tracking-wider font-bold transition-all border ${
                activePreset.id === preset.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-black"
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>

        {/* Custom Natural Language Prompt Bar */}
        <form onSubmit={handleCustomGenerate} className="mt-6 bg-white p-4 border border-neutral-200 flex gap-3">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Or describe any custom dress code: e.g. 'October rooftop wedding in Manhattan' or 'casual tech conference keynote'"
            className="flex-1 text-sm outline-none px-2 font-medium placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isGenerating ? "Styling..." : "Generate Look"}</span>
          </button>
        </form>
      </div>

      {/* 3. VISUAL OUTFIT CANVAS */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT: Curated Look Board */}
          <div className="lg:w-8/12 space-y-6">
            <div className="bg-white p-6 border border-neutral-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Occasion Blueprint
              </span>
              <h2 className="text-xl font-bold uppercase tracking-tight mt-1 mb-2">
                {activePreset.title}
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                {activePreset.description}
              </p>
            </div>

            {/* Individual Garment Cards */}
            <div className="space-y-4">
              {activePreset.items.map((garment, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-neutral-200 p-6 flex flex-col sm:flex-row gap-6 hover:border-black transition-all"
                >
                  <div className="relative w-full sm:w-36 aspect-[3/4] bg-neutral-100 flex-shrink-0">
                    <Image
                      src={garment.image}
                      alt={garment.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                      {garment.brand}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                        <span>Piece 0{idx + 1} • {garment.category}</span>
                        <span className="font-bold text-black text-sm">${garment.price.toLocaleString()} USD</span>
                      </div>
                      <h3 className="font-bold text-base mt-1 mb-2">
                        {garment.name}
                      </h3>
                      <p className="text-neutral-500 text-xs leading-relaxed">
                        <strong className="text-black">Styling Rationale:</strong> {garment.reason}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-4">
                      <span className="text-neutral-400 font-mono text-[11px]">
                        Color: {garment.color}
                      </span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready in Inventory
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Complete Look Order Console */}
          <div className="lg:w-4/12">
            <div className="bg-white border border-neutral-200 p-8 sticky top-24 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block">
                Atelier Bundle Package
              </span>

              <h3 className="text-lg font-black uppercase tracking-tight">
                Complete {activePreset.items.length}-Piece Ensemble
              </h3>

              <div className="space-y-3 text-xs border-y border-neutral-100 py-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Individual Garments Sum</span>
                  <span className="font-semibold">${subtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Atelier Bundle Discount (10%)</span>
                  <span>-${bundleDiscount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Luxury Courier Delivery</span>
                  <span className="font-semibold text-emerald-700">COMPLIMENTARY</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-wider font-bold">Bundle Price</span>
                <span className="text-2xl font-black">${finalTotal.toFixed(2)} USD</span>
              </div>

              <button
                onClick={handleAddLookToBag}
                className="w-full bg-black text-white py-5 uppercase tracking-widest text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedSuccess ? "Ensemble Added!" : "Add Complete Look to Bag"}</span>
              </button>

              <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2 font-bold text-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>The Hugo Boss Promise</span>
                </div>
                <p>
                  Every piece in this ensemble is matched using high-dimensional fabric and silhouette embeddings. Includes free 30-day exchanges for individual sizes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
