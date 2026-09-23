"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  ChevronRight, 
  ShieldCheck,
  User,
  ShoppingBag
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface Product {
  id: string;
  sku: string;
  brand: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  currency: string;
  images?: { url: string }[];
}

interface Message {
  sender: "user" | "concierge";
  text: string;
  products?: Product[];
}

export default function AiConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "concierge",
      text: "Welcome to the HUGO BOSS Digital Atelier. I am your Master Tailoring Concierge, powered by real-time vector embeddings. How may I assist you with tailoring, fabric provenance, or evening styling today?",
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const newMsg: Message = { sender: "user", text: userText };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/concierge/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: "concierge",
            text: data.reply,
            products: data.recommended_products,
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "concierge",
            text: "Our Biella virgin wool two-piece suit and double-breasted silk tuxedo are exemplary selections for refined elegance. Would you like me to guide you to their atelier detail pages?",
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "concierge",
          text: "I recommend our Italian Virgin Wool Two-Piece Suit in Dark Navy ($895) crafted with natural stretch, paired with our Egyptian cotton poplin shirt.",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING LUXURY TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-neutral-700/60"
            aria-label="Open Atelier AI Concierge"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest pr-1">
              Atelier Concierge
            </span>
          </button>
        )}
      </div>

      {/* 2. CHAT DRAWER */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white border border-neutral-200 shadow-2xl rounded-none overflow-hidden flex flex-col h-[580px] animate-in fade-in slide-in-from-bottom-6 duration-200 text-black">
          {/* Header */}
          <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <span>HUGO BOSS Atelier</span>
                  <span className="text-[9px] font-mono text-emerald-400">• Online</span>
                </h3>
                <p className="text-[10px] text-neutral-400 font-mono">
                  pgvector Stylist & Master Tailor
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-neutral-50 border-b border-neutral-200 p-2 overflow-x-auto flex gap-2 text-[11px] whitespace-nowrap scrollbar-none">
            {[
              "Black-tie gala outfit",
              "Virgin wool suit provenance",
              "Sizing for 180cm / 78kg",
              "Casual urban look",
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="bg-white border border-neutral-200 hover:border-black px-2.5 py-1 text-neutral-700 transition-colors"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 leading-relaxed ${
                    m.sender === "user"
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-800 border border-neutral-200"
                  }`}
                >
                  <p>{m.text}</p>
                </div>

                {/* Inline Product Recommendations */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-3 w-full space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">
                      Recommended Atelier Garments:
                    </span>
                    {m.products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition-colors block text-left"
                      >
                        <div className="relative w-12 h-16 bg-neutral-200 flex-shrink-0">
                          <Image
                            src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35"}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                            {p.brand}
                          </span>
                          <h4 className="font-bold text-xs truncate">{p.name}</h4>
                          <span className="font-black text-xs">${p.base_price} {p.currency}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px] animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Consulting pgvector atelier archives...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 border-t border-neutral-200 bg-white flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Master Tailor..."
              className="flex-1 text-xs border border-neutral-300 p-2.5 outline-none focus:border-black font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
