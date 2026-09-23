import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "HUGO BOSS Official Online Shop | Precision Tailoring & Luxury Fashion",
  description: "Explore the official HUGO BOSS online shop featuring handcrafted Italian virgin wool suits, precision outerwear, AI-assisted fit styling, and express global delivery.",
  keywords: ["HUGO BOSS", "luxury fashion", "men suits", "virgin wool", "formal wear", "designer apparel", "AI styling"],
  authors: [{ name: "HUGO BOSS Atelier" }],
  openGraph: {
    title: "HUGO BOSS Official Online Shop",
    description: "Precision tailoring, virgin wool suits, and AI-powered styling.",
    type: "website",
    locale: "en_US",
    siteName: "HUGO BOSS",
  },
  twitter: {
    card: "summary_large_image",
    title: "HUGO BOSS Official Online Shop",
    description: "Precision tailoring, virgin wool suits, and AI-powered styling.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative selection:bg-black selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
