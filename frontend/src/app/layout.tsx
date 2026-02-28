import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Martian_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShrinkingFooter from "@/components/ShrinkingFooter";
import SmoothScroll from "@/components/SmoothScroll";
import AnchorScrollHandler from "@/components/AnchorScrollHandler";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const martianMono = Martian_Mono({
  variable: "--font-martian",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evolis | Funding the Future",
  description: "A milestone-gated tokenized crowdfunding platform built on BNB Chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body
        className={`${inter.variable} ${martianMono.variable} antialiased selection:bg-accent selection:text-white bg-black`}
      >
        <SmoothScroll>
          <Providers>
            <Navbar />
            <Suspense fallback={null}>
              <AnchorScrollHandler />
            </Suspense>
            <ShrinkingFooter>
                <main className="relative z-20 min-h-screen bg-black shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
                  {children}
                </main>
                <div id="footer-sentinel" className="w-full" aria-hidden />
                
              </ShrinkingFooter> 
            <Footer />
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
