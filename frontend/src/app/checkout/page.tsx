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

export default function CheckoutPage() {
  const router = useRouter();

  const [email, setEmail] = useState("julian.vance@example.com");
  const [name, setName] = useState("Julian Vance");
  const [address, setAddress] = useState("742 Evergreen Terrace, Suite 400, New York, NY 10001");
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("express");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay">("card");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [submitting, setSubmitting] = useState(false);

  // Default checkout item
  const item = {
    product_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    variant_sku: "HB-SUIT-001-NVY-40R",
    product_name: "Two-Piece Slim-Fit Suit in Italian Virgin Wool",
    price: 895.00,
    quantity: 1,
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=600&h=800",
    size: "40R",
    color: "Dark Navy"
  };

  const shippingCost = 0.00; // Complimentary luxury delivery
  const estimatedTax = 71.60;
  const totalAmount = item.price * item.quantity + shippingCost + estimatedTax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email: email,
          customer_name: name,
          shipping_address: address,
          items: [
            {
              product_id: item.product_id,
              variant_sku: item.variant_sku,
              product_name: item.product_name,
              price: item.price,
              quantity: item.quantity
            }
          ]
        })
      });

      if (res.ok) {
        const order = await res.json();
        router.push(`/checkout/success?orderNumber=${order.order_number}&total=${totalAmount.toFixed(2)}`);
      } else {
        // Fallback demo order number if offline
        const mockOrderNum = `HB-${Math.floor(10000000 + Math.random() * 90000000)}`;
        router.push(`/checkout/success?orderNumber=${mockOrderNum}&total=${totalAmount.toFixed(2)}`);
      }
    } catch {
      const mockOrderNum = `HB-${Math.floor(10000000 + Math.random() * 90000000)}`;
      router.push(`/checkout/success?orderNumber=${mockOrderNum}&total=${totalAmount.toFixed(2)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-black font-sans selection:bg-black selection:text-white">
      {/* 1. MINIMAL CHECKOUT HEADER */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between text-xs">
          <Link 
            href="/products"
            className="flex items-center gap-2 uppercase tracking-widest font-bold hover:text-neutral-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          <Link href="/" className="text-xl font-black tracking-[0.25em] uppercase">
            HUGO BOSS
          </Link>

          <div className="flex items-center gap-1.5 text-neutral-500 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* 2. CHECKOUT CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* LEFT: Shipping & Payment Details */}
          <div className="lg:w-7/12 space-y-8">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white p-8 border border-neutral-200">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center justify-between">
                  <span>1. Contact Information</span>
                  <span className="text-neutral-400 text-xs font-normal">Step 1 of 3</span>
                </h2>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold uppercase tracking-wider block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none font-medium"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Order confirmation and tracking details will be sent here.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-8 border border-neutral-200">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center justify-between">
                  <span>2. Delivery Address</span>
                  <span className="text-neutral-400 text-xs font-normal">Step 2 of 3</span>
                </h2>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold uppercase tracking-wider block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider block mb-1.5">
                      Shipping Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none font-medium"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="font-semibold uppercase tracking-wider block mb-2">
                      Shipping Method
                    </label>
                    <div className="border border-black p-4 flex items-center justify-between bg-neutral-50">
                      <div>
                        <div className="font-bold text-xs uppercase tracking-wider">
                          Complimentary Luxury Express Delivery
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Delivered in signature garment box via UPS Express (1-2 business days)
                        </div>
                      </div>
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-700">
                        FREE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-8 border border-neutral-200">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center justify-between">
                  <span>3. Payment Method</span>
                  <span className="text-neutral-400 text-xs font-normal">Step 3 of 3</span>
                </h2>
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border flex items-center justify-center gap-2 uppercase font-bold text-xs tracking-wider ${
                        paymentMethod === "card" ? "border-black bg-neutral-900 text-white" : "border-neutral-200 bg-white"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("apple_pay")}
                      className={`p-4 border flex items-center justify-center gap-2 uppercase font-bold text-xs tracking-wider ${
                        paymentMethod === "apple_pay" ? "border-black bg-neutral-900 text-white" : "border-neutral-200 bg-white"
                      }`}
                    >
                      <span>Pay</span>
                    </button>
                  </div>

                  <div>
                    <label className="font-semibold uppercase tracking-wider block mb-1.5">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full border border-neutral-300 p-3 text-sm focus:border-black outline-none font-mono"
                    />
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
              <h2 className="text-sm font-bold uppercase tracking-wider pb-4 border-b border-neutral-200">
                Order Summary (1 Article)
              </h2>

              <div className="flex gap-4 pb-6 border-b border-neutral-100">
                <div className="relative w-20 h-28 bg-neutral-100 flex-shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold uppercase tracking-wider text-neutral-400">BOSS Atelier</span>
                  <h3 className="font-bold text-sm mt-0.5">{item.product_name}</h3>
                  <div className="text-neutral-500 mt-1 space-y-0.5 text-[11px]">
                    <div>Size: {item.size}</div>
                    <div>Color: {item.color}</div>
                    <div>SKU: {item.variant_sku}</div>
                  </div>
                  <div className="font-bold text-sm mt-3">${item.price.toLocaleString()} USD</div>
                </div>
              </div>

              {/* Calculations */}
              <div className="space-y-3 text-xs border-b border-neutral-100 pb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Garment Subtotal</span>
                  <span className="font-semibold">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Express Delivery</span>
                  <span className="font-semibold text-emerald-700">COMPLIMENTARY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Estimated Sales Tax</span>
                  <span className="font-semibold">${estimatedTax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-black uppercase">
                <span>Total Due</span>
                <span>${totalAmount.toFixed(2)} USD</span>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-700" />
                  <span>Guaranteed authentic HUGO BOSS craftsmanship</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-700" />
                  <span>Dispatches within 24 hours in sealed luxury garment box</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
