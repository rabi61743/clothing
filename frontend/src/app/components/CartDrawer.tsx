"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles 
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    cartCount, 
    cartSubtotal 
  } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-sm font-black tracking-[0.2em] uppercase text-black">
                Shopping Bag ({cartCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-neutral-400 hover:text-black transition-colors rounded-full hover:bg-neutral-100"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Luxury Delivery Badge */}
          <div className="bg-neutral-900 text-white px-6 py-2.5 text-[11px] font-mono tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-neutral-400" />
              Complimentary Atelier Express Delivery
            </span>
            <span className="text-emerald-400 font-bold">$0.00</span>
          </div>

          {/* Drawer Body: Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">Your Bag is Empty</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                    Explore precision tailored garments and modern streetwear looks.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-4 inline-flex items-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-neutral-800 transition-colors"
                >
                  Explore Collection
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantSku} className="pt-6 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-28 bg-neutral-100 flex-shrink-0 overflow-hidden border border-neutral-200">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black tracking-widest uppercase text-neutral-400">
                            {item.brand}
                          </span>
                          <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                            {item.name}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-900">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                        <span>Size: <strong className="text-neutral-900">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-neutral-900">{item.color}</strong></span>
                      </div>
                    </div>

                    {/* Quantity controls & Remove */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-neutral-200">
                        <button
                          onClick={() => updateQuantity(item.variantSku, -1)}
                          className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-mono font-medium text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantSku, 1)}
                          className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantSku)}
                        className="text-neutral-400 hover:text-red-600 transition-colors text-xs flex items-center gap-1 font-mono"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Express Shipping</span>
                  <span className="text-emerald-600 font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <span>${cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white text-xs font-bold tracking-[0.2em] uppercase py-4 flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Encrypted Checkout
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Atelier Guarantee
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
