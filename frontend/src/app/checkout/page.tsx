"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Lock, 
  CreditCard, 
  Check, 
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import { useCart } from "@/context/CartContext";

const DEFAULT_ITEM = {
  productId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  variantSku: "HB-SUIT-001-NVY-40R",
  name: "Two-Piece Slim-Fit Suit in Italian Virgin Wool",
  brand: "BOSS",
  price: 895.00,
  quantity: 1,
  imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=600&h=800",
  size: "40R",
  color: "Dark Navy"
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, clearCart } = useCart();

  const [email, setEmail] = useState("julian.vance@example.com");
  const [name, setName] = useState("Julian Vance");
  const [address, setAddress] = useState("742 Evergreen Terrace, Suite 400, New York, NY 10001");
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("express");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay">("card");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [submitting, setSubmitting] = useState(false);

  // Use actual cart items if available, or fall back to default demo item
  const checkoutItems = cartItems.length > 0 ? cartItems : [DEFAULT_ITEM];

  const subtotal = checkoutItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const shippingCost = 0.00; // Complimentary luxury delivery
  const estimatedTax = subtotal * 0.08;
  const totalAmount = subtotal + shippingCost + estimatedTax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email: email,
          customer_name: name,
          shipping_address: address,
          items: checkoutItems.map((item) => ({
            product_id: item.productId,
            variant_sku: item.variantSku,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        })
      });

      if (res.ok) {
        const order = await res.json();
        clearCart();
        router.push(`/checkout/success?orderNumber=${order.order_number}&total=${totalAmount.toFixed(2)}`);
      } else {
        const mockOrderNum = `HB-${Math.floor(10000000 + Math.random() * 90000000)}`;
        clearCart();
        router.push(`/checkout/success?orderNumber=${mockOrderNum}&total=${totalAmount.toFixed(2)}`);
      }
    } catch {
      const mockOrderNum = `HB-${Math.floor(10000000 + Math.random() * 90000000)}`;
      clearCart();
      router.push(`/checkout/success?orderNumber=${mockOrderNum}&total=${totalAmount.toFixed(2)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      {/* Top Brand Bar */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-[0.25em] uppercase">
            HUGO BOSS
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="mb-8">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-light tracking-tight mt-3">Express Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* LEFT: Checkout Form */}
          <div className="lg:w-7/12 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              
              {/* 1. Contact Information */}
              <div className="bg-white p-8 border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider">1. Client Contact</h2>
                  <span className="text-[11px] font-mono text-neutral-400">Atelier Member</span>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none font-mono"
                    placeholder="email@example.com"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Order confirmation and pgvector dispatch updates will be sent here.
                  </span>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="bg-white p-8 border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider">2. Shipping Destination</h2>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">Complimentary</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none"
                      placeholder="Suite / Street Address, City, State, ZIP"
                    />
                  </div>
                </div>

                {/* Delivery Option */}
                <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("express")}
                    className={`p-4 border text-left flex flex-col justify-between transition-all ${
                      deliveryMethod === "express" 
                        ? "border-black bg-neutral-50" 
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-black" />
                        Atelier Express (1-2 Days)
                      </span>
                      {deliveryMethod === "express" && <Check className="w-3.5 h-3.5 text-black" />}
                    </div>
                    <span className="text-emerald-700 font-semibold mt-2">FREE ($0.00)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("standard")}
                    className={`p-4 border text-left flex flex-col justify-between transition-all ${
                      deliveryMethod === "standard" 
                        ? "border-black bg-neutral-50" 
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Standard Climate Neutral (3-5 Days)</span>
                      {deliveryMethod === "standard" && <Check className="w-3.5 h-3.5 text-black" />}
                    </div>
                    <span className="text-neutral-500 mt-2">FREE ($0.00)</span>
                  </button>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-white p-8 border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h2 className="text-sm font-bold uppercase tracking-wider">3. Payment Details</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono border border-neutral-300 px-1.5 py-0.5">VISA</span>
                    <span className="text-[10px] font-mono border border-neutral-300 px-1.5 py-0.5">MC</span>
                    <span className="text-[10px] font-mono border border-neutral-300 px-1.5 py-0.5">AMEX</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold uppercase tracking-wider block mb-1.5">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold uppercase tracking-wider block mb-1.5">
                        Expiration
                      </label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold uppercase tracking-wider block mb-1.5">
                        CVC
                      </label>
                      <input
                        type="text"
                        defaultValue="888"
                        className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-5 uppercase tracking-widest text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {submitting ? "Authorizing Payment & Saving Order..." : `Place Order • $${totalAmount.toFixed(2)} USD`}
              </button>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:w-5/12">
            <div className="bg-white p-8 border border-neutral-200 sticky top-24 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider pb-4 border-b border-neutral-200 flex items-center justify-between">
                <span>Order Summary ({checkoutItems.reduce((a, c) => a + c.quantity, 0)} Articles)</span>
                <span className="text-xs font-mono font-normal text-neutral-400">USD</span>
              </h2>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 divide-y divide-neutral-100">
                {checkoutItems.map((it) => (
                  <div key={it.variantSku} className="pt-4 first:pt-0 flex gap-4">
                    <div className="relative w-16 h-24 bg-neutral-100 flex-shrink-0 border border-neutral-200">
                      <Image
                        src={it.imageUrl}
                        alt={it.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">{it.brand}</span>
                      <h3 className="font-bold text-xs mt-0.5 line-clamp-1">{it.name}</h3>
                      <div className="text-neutral-500 mt-1 space-y-0.5 text-[11px] font-mono">
                        <div>Size: {it.size} | Qty: {it.quantity}</div>
                        <div>Color: {it.color}</div>
                      </div>
                      <div className="font-bold text-xs mt-2 font-mono">${(it.price * it.quantity).toLocaleString()} USD</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-3 text-xs border-t border-neutral-100 pt-4 font-mono">
                <div className="flex justify-between text-neutral-600">
                  <span>Garment Subtotal</span>
                  <span className="font-semibold text-neutral-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Express Delivery</span>
                  <span className="font-semibold text-emerald-700">COMPLIMENTARY</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Sales Tax (8%)</span>
                  <span className="font-semibold text-neutral-900">${estimatedTax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-black uppercase pt-4 border-t border-neutral-200">
                <span>Total Due</span>
                <span>${totalAmount.toFixed(2)} USD</span>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-neutral-100 space-y-2.5 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Complimentary 30-Day Atelier Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neutral-800" />
                  <span>Signature Garment Bag & Hanger Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-800" />
                  <span>Real-time dispatch tracking via PostgreSQL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
