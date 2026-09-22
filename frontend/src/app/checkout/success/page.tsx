"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Package, ShieldCheck, Mail } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "HB-84729103";
  const total = searchParams.get("total") || "966.60";

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between">
      {/* HEADER */}
      <header className="border-b border-neutral-100 py-6 text-center">
        <Link href="/" className="text-2xl font-black tracking-[0.25em] uppercase">
          HUGO BOSS
        </Link>
      </header>

      {/* CONFIRMATION CARD */}
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
          Order Confirmed & Stored in PostgreSQL
        </span>

        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-2 mb-4">
          Thank You For Your Order
        </h1>

        <p className="text-sm text-neutral-600 leading-relaxed max-w-md mx-auto mb-8 font-light">
          Your luxury tailoring piece has been received and registered at our atelier. You will receive real-time shipment updates via email.
        </p>

        {/* Order Details Badge */}
        <div className="bg-neutral-50 border border-neutral-200 p-6 text-left max-w-md mx-auto mb-8 font-mono text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-400 uppercase tracking-wider">Order Reference:</span>
            <span className="font-bold text-black">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400 uppercase tracking-wider">Payment Status:</span>
            <span className="text-emerald-700 font-bold">CONFIRMED (256-Bit)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400 uppercase tracking-wider">Amount Paid:</span>
            <span className="font-bold text-black">${total} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400 uppercase tracking-wider">Shipping Carrier:</span>
            <span className="text-neutral-800">UPS Express White-Glove</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-black text-white px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Explore More Garments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="border border-neutral-300 text-neutral-800 px-8 py-4 text-xs uppercase tracking-widest font-bold hover:border-black transition-colors inline-flex items-center justify-center"
          >
            Return to Storefront
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-100 py-6 text-center text-xs text-neutral-400 font-mono">
        PostgreSQL 16 Order ID Persisted • Hugo Boss Digital Atelier
      </footer>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
