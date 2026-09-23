"use client";

import React from "react";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "./components/CartDrawer";
import AiConcierge from "./components/AiConcierge";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <AiConcierge />
    </CartProvider>
  );
}
