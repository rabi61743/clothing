"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  Sparkles,
  ShoppingBag,
  FileText
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface OrderItem {
  id: string;
  product_name: string;
  variant_sku: string;
  price: number;
  quantity: number;
}

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
  items?: OrderItem[];
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("orderNumber") || "HB-55007091";

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/track/${num.trim()}`);
      if (res.ok) {
        const data: Order = await res.json();
        setOrder(data);
      } else {
        setOrder(null);
        setError(`Order ${num} not found in PostgreSQL registry. Please check your order reference.`);
      }
    } catch (err) {
      setError("Failed connecting to backend tracking service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      fetchOrder(initialOrder);
    }
  }, [initialOrder]);

  const stages = [
    { key: "CONFIRMED", title: "Order Confirmed", desc: "Payment authorized & registered in atelier database" },
    { key: "IN_ATELIER", title: "Atelier Preparation", desc: "Garment hand-inspection, steaming & luxury boxing" },
    { key: "DISPATCHED", title: "In Transit with Courier", desc: "Dispatched via UPS Express White-Glove (Tracking #UPS-7890)" },
    { key: "DELIVERED", title: "Delivered & Signed", desc: "Arrived at destination address" },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case "CONFIRMED": return 0;
      case "IN_ATELIER": return 1;
      case "DISPATCHED": return 2;
      case "DELIVERED": return 3;
      default: return 0;
    }
  };

  const currentStageIdx = order ? getStageIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-neutral-50 text-black font-sans selection:bg-black selection:text-white">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between text-xs">
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

          <Link 
            href="/products"
            className="text-xs uppercase tracking-widest font-bold hover:underline"
          >
            Catalog →
          </Link>
        </div>
      </header>

      {/* 2. TRACKING SEARCH HERO */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-6 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
          Atelier White-Glove Logistics
        </span>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-2 mb-6">
          Track Your Delivery
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrder(orderNumberInput);
          }}
          className="max-w-xl mx-auto flex gap-2 bg-white p-2 border border-neutral-300 shadow-sm"
        >
          <input
            type="text"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value)}
            placeholder="Enter Order Reference (e.g. HB-55007091)..."
            className="flex-1 px-3 py-2 text-xs font-mono outline-none uppercase font-semibold"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? "Searching..." : "Track"}</span>
          </button>
        </form>

        {error && (
          <div className="mt-6 text-xs text-red-600 bg-red-50 border border-red-200 p-3 max-w-xl mx-auto font-mono">
            {error}
          </div>
        )}
      </div>

      {/* 3. ORDER STATUS CARD & TIMELINE */}
      {order && (
        <main className="max-w-4xl mx-auto px-6 pb-20 space-y-8">
          <div className="bg-white border border-neutral-200 p-8 shadow-sm">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                  Order Reference
                </span>
                <h2 className="text-xl font-bold font-mono text-black mt-0.5">
                  {order.order_number}
                </h2>
              </div>
              <div className="sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono block">
                  Current Status
                </span>
                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider mt-1 border ${
                  order.status === "DELIVERED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : order.status === "DISPATCHED"
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : order.status === "IN_ATELIER"
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-neutral-100 text-neutral-800 border-neutral-300"
                }`}>
                  {order.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="py-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {stages.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div key={stage.key} className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-3 mb-3 w-full">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          isCompleted
                            ? "bg-black text-white"
                            : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : `0${idx + 1}`}
                        </div>
                        {idx < stages.length - 1 && (
                          <div className={`flex-1 h-0.5 ${idx < currentStageIdx ? "bg-black" : "bg-neutral-200"}`} />
                        )}
                      </div>

                      <h3 className={`font-bold text-xs uppercase tracking-wider ${
                        isCurrent ? "text-black" : isCompleted ? "text-neutral-700" : "text-neutral-400"
                      }`}>
                        {stage.title}
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Details & Garment Articles */}
            <div className="pt-6 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div>
                <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Destination Address
                </span>
                <div className="font-bold text-neutral-900">{order.customer_name}</div>
                <div className="text-neutral-600 mt-0.5">{order.shipping_address}</div>
                <div className="text-neutral-400 font-mono mt-1">{order.customer_email}</div>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Purchased Garments ({order.items?.length || 1})
                </span>
                <div className="space-y-2">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between border-b border-neutral-100 pb-2">
                      <div>
                        <div className="font-bold text-neutral-900">{it.product_name}</div>
                        <div className="text-neutral-400 text-[11px] font-mono">SKU: {it.variant_sku}</div>
                      </div>
                      <div className="font-bold text-neutral-900 font-mono">${it.price.toFixed(2)}</div>
                    </div>
                  )) || (
                    <div className="flex justify-between">
                      <span className="font-bold">Tailored Atelier Garment</span>
                      <span className="font-bold font-mono">${order.total_amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm font-black uppercase pt-3 mt-3 border-t border-neutral-200">
                  <span>Total Paid</span>
                  <span>${order.total_amount.toFixed(2)} {order.currency}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap gap-4 justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-neutral-700" />
                <span>Eligible for Complimentary 30-Day Atelier Exchange</span>
              </div>
              <button
                onClick={() => alert("Size Exchange Request logged. An atelier representative will reach out within 2 hours.")}
                className="border border-neutral-300 hover:border-black px-4 py-2 font-bold uppercase tracking-wider text-[11px] transition-colors"
              >
                Request Size Exchange
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Tracking Portal...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
