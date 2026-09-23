"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Sparkles, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  X,
  Database,
  Cpu,
  SlidersHorizontal,
  ChevronRight,
  Truck,
  Check,
  Search
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  shipping_address: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  items?: {
    product_name: string;
    variant_sku: string;
    price: number;
    quantity: number;
  }[];
}

interface AdminStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_embeddings: number;
}

interface VectorInspectItem {
  product_id: string;
  product_name: string;
  brand: string;
  sku: string;
  vector_dim: number;
  sample_vector: number[];
}

export default function AtelierAdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "vectorops" | "catalog">("orders");
  const [stats, setStats] = useState<AdminStats>({
    total_revenue: 0,
    total_orders: 0,
    total_products: 0,
    total_embeddings: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [vectors, setVectors] = useState<VectorInspectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdProductSuccess, setCreatedProductSuccess] = useState<string | null>(null);

  // VectorOps Sandbox State
  const [sandboxQuery, setSandboxQuery] = useState("Italian virgin wool navy suit for gala");
  const [sandboxResults, setSandboxResults] = useState<any[]>([]);
  const [sandboxLatency, setSandboxLatency] = useState<number | null>(null);
  const [isTestingVector, setIsTestingVector] = useState(false);

  // New Garment Form State
  const [sku, setSku] = useState("HB-BLAZER-001");
  const [brand, setBrand] = useState<"BOSS" | "HUGO">("BOSS");
  const [name, setName] = useState("Unstructured Virgin Wool Blazer in Navy");
  const [slug, setSlug] = useState("unstructured-virgin-wool-blazer-navy");
  const [basePrice, setBasePrice] = useState(695);
  const [description, setDescription] = useState("A lightweight, modern unlined blazer crafted from high-twist Italian wool hopsack with patch pockets.");
  const [details, setDetails] = useState("Slim fit; Patch pockets; Unlined interior; Horn buttons; Dual rear vents.");
  const [materialCare, setMaterialCare] = useState("100% Virgin Wool. Dry clean only.");
  const [sustainabilityNote, setSustainabilityNote] = useState("RESPONSIBLE Sourced Italian Wool.");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=85&w=800&h=1100");
  const [colorName, setColorName] = useState("Midnight Navy");
  const [colorHex, setColorHex] = useState("#0C1821");

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, vectorsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`),
        fetch(`${API_BASE_URL}/api/orders?limit=25`),
        fetch(`${API_BASE_URL}/api/admin/vector/inspect`),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
      if (vectorsRes.ok) {
        const vectorsData = await vectorsRes.json();
        setVectors(vectorsData.items || []);
      }
    } catch (err) {
      console.error("Failed loading admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Failed updating order status:", err);
    }
  };

  const runVectorSandbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxQuery.trim()) return;

    setIsTestingVector(true);
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/api/search/semantic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sandboxQuery, limit: 5 }),
      });
      const end = performance.now();
      setSandboxLatency(Math.round(end - start));

      if (res.ok) {
        const data = await res.json();
        setSandboxResults(data.results || []);
      }
    } catch (err) {
      console.error("Sandbox test failed:", err);
    } finally {
      setIsTestingVector(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setCreatedProductSuccess(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          brand,
          name,
          slug,
          base_price: Number(basePrice),
          currency: "USD",
          description,
          details,
          material_care: materialCare,
          sustainability_note: sustainabilityNote,
          image_url: imageUrl,
          color_name: colorName,
          color_hex: colorHex,
          sizes: ["38R", "40R", "42R", "44R"],
        }),
      });

      if (res.ok) {
        const product = await res.json();
        setCreatedProductSuccess(product.name);
        setIsModalOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      console.error("Failed to create product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-white selection:text-black">
      {/* 1. ADMIN HEADER */}
      <header className="border-b border-neutral-800 bg-black/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <Link 
              href="/"
              className="flex items-center gap-2 uppercase tracking-widest font-bold text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Storefront</span>
            </Link>
            <span className="text-neutral-800">|</span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PostgreSQL 16 pgvector Atelier Console</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black px-4 py-2 uppercase tracking-widest text-[11px] font-bold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Craft New Garment</span>
            </button>
            <button
              onClick={loadDashboardData}
              className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. DASHBOARD BODY */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
              Digital Atelier Operations & Merchandising
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight mt-1">
              Atelier Command Center
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2">
            {[
              { id: "orders", label: "Orders & Fulfillment", icon: ShoppingBag },
              { id: "vectorops", label: "VectorOps & AI Sandbox", icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 border ${
                    activeTab === tab.id
                      ? "bg-white text-black border-white"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Alert */}
        {createdProductSuccess && (
          <div className="bg-emerald-950/60 border border-emerald-800 p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>{createdProductSuccess}</strong> published with 768-d pgvector embedding indexed!
              </span>
            </div>
            <button 
              onClick={() => setCreatedProductSuccess(null)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold">Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black">
              ${stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
              Direct PostgreSQL `orders` sum
            </span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold">Orders Confirmed</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black">{stats.total_orders}</div>
            <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
              100% Authorized & Persisted
            </span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold">Active Garments</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black">{stats.total_products}</div>
            <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
              Across BOSS & HUGO lines
            </span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold">pgvector Embeddings</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-3xl font-black">{stats.total_embeddings}</div>
            <span className="text-[11px] text-neutral-500 font-mono mt-1 block">
              768-Dim HNSW Index Live
            </span>
          </div>
        </div>

        {/* 4. TAB CONTENT */}

        {/* TAB 1: ORDERS & FULFILLMENT */}
        {activeTab === "orders" && (
          <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider">
                  Live Orders & White-Glove Fulfillment
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Update order lifecycle status with direct PostgreSQL synchronization
                </p>
              </div>
              <span className="text-xs font-mono bg-neutral-800 px-3 py-1 text-neutral-300">
                {orders.length} Records
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                No orders in queue. Visit the checkout page to simulate a customer order.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800 uppercase tracking-wider text-[11px]">
                      <th className="pb-3">Order Number</th>
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Destination</th>
                      <th className="pb-3">Articles</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 font-bold text-white">{o.order_number}</td>
                        <td className="py-4">
                          <div className="font-semibold text-neutral-200">{o.customer_name}</div>
                          <div className="text-[11px] text-neutral-500">{o.customer_email}</div>
                        </td>
                        <td className="py-4 text-neutral-400 max-w-xs truncate">{o.shipping_address}</td>
                        <td className="py-4 text-neutral-300">
                          {o.items?.map((it, idx) => (
                            <div key={idx} className="truncate max-w-xs">
                              {it.quantity}x {it.product_name}
                            </div>
                          )) || "1 Article"}
                        </td>
                        <td className="py-4 font-bold text-white">
                          ${o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {o.currency}
                        </td>
                        <td className="py-4">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border rounded-none outline-none cursor-pointer transition-colors ${
                              o.status === "DELIVERED"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                : o.status === "DISPATCHED"
                                ? "bg-blue-950 text-blue-400 border-blue-800"
                                : o.status === "IN_ATELIER"
                                ? "bg-amber-950 text-amber-400 border-amber-800"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700"
                            }`}
                          >
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="IN_ATELIER">In Atelier Prep</option>
                            <option value="DISPATCHED">Dispatched (UPS)</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VECTOROPS & AI SANDBOX */}
        {activeTab === "vectorops" && (
          <div className="space-y-8">
            {/* Vector Sandbox Playground */}
            <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>pgvector Cosine Distance Sandbox</span>
                  </h2>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Test live similarity queries against the HNSW index in PostgreSQL
                  </p>
                </div>
                {sandboxLatency !== null && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1">
                    Index Latency: {sandboxLatency}ms
                  </span>
                )}
              </div>

              <form onSubmit={runVectorSandbox} className="flex gap-3">
                <input
                  type="text"
                  value={sandboxQuery}
                  onChange={(e) => setSandboxQuery(e.target.value)}
                  placeholder="Enter natural language test prompt..."
                  className="flex-1 bg-black border border-neutral-700 p-3 text-white outline-none focus:border-white font-mono text-xs"
                />
                <button
                  type="submit"
                  disabled={isTestingVector}
                  className="bg-white text-black px-6 py-3 uppercase tracking-widest text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isTestingVector ? "Benchmarking..." : "Benchmark Query"}</span>
                </button>
              </form>

              {sandboxResults.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold block">
                    Top Nearest Neighbors (Ranked by Cosine Similarity):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sandboxResults.map(({ product, similarity }) => (
                      <div key={product.id} className="bg-black border border-neutral-800 p-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px] bg-neutral-800 px-1.5 py-0.5 text-neutral-300">
                            {product.brand}
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            {Math.round(similarity * 100)}% Similarity
                          </span>
                        </div>
                        <h4 className="font-bold text-white line-clamp-1">{product.name}</h4>
                        <p className="text-neutral-500 text-[11px] line-clamp-2">{product.details || product.description}</p>
                        <div className="text-neutral-400 font-mono text-[11px] pt-1">
                          Base Price: ${product.base_price} USD
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vector Embeddings Inspection Table */}
            <div className="bg-neutral-900 border border-neutral-800 p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span>High-Dimensional Vector Store Inspection</span>
                  </h2>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Sample float32 values from the 768-dimensional normalized embeddings table
                  </p>
                </div>
                <span className="text-xs font-mono bg-neutral-800 px-3 py-1 text-neutral-300">
                  HNSW (m=16, ef=64)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800 uppercase tracking-wider text-[11px]">
                      <th className="pb-3">Garment SKU</th>
                      <th className="pb-3">Brand & Name</th>
                      <th className="pb-3">Dimensions</th>
                      <th className="pb-3">Sample Float32 Coordinates (First 6 dims)</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {vectors.map((v) => (
                      <tr key={v.product_id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 text-neutral-300 font-bold">{v.sku}</td>
                        <td className="py-4 text-white font-medium">
                          <span className="text-neutral-500 mr-2">[{v.brand}]</span>
                          {v.product_name}
                        </td>
                        <td className="py-4 text-amber-400 font-bold">{v.vector_dim}D</td>
                        <td className="py-4 text-neutral-400 text-[11px]">
                          [{v.sample_vector.map((val) => val.toFixed(4)).join(", ")}...]
                        </td>
                        <td className="py-4">
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                            HNSW INDEXED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. "CRAFT NEW GARMENT" MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative text-xs">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Craft New Garment into Catalog
                </h3>
                <p className="text-neutral-400 text-[11px]">
                  Automatically triggers Go AI Embedding Pipeline + pgvector HNSW indexing
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Brand Line</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as "BOSS" | "HUGO")}
                    className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white"
                  >
                    <option value="BOSS">BOSS (Tailored Luxury)</option>
                    <option value="HUGO">HUGO (Contemporary Streetwear)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider block mb-1">Garment Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Base Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider block mb-1">
                  Tailoring & Fit Specifications
                </label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Color Name</label>
                  <input
                    type="text"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1">Color Hex</label>
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider block mb-1">Image URL (High-Res)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-black border border-neutral-700 p-2.5 text-white outline-none focus:border-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-neutral-700 text-neutral-300 uppercase tracking-widest text-[11px] font-bold hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-white text-black px-6 py-2.5 uppercase tracking-widest text-[11px] font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{submitting ? "Embedding & Publishing..." : "Publish & Generate Embedding"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
