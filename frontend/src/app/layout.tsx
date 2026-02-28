import type { Metadata } from "next";
import { Inter, Martian_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
    <html lang="en">
      <body
        className={`${inter.variable} ${martianMono.variable} antialiased selection:bg-accent selection:text-white`}
      >
        <SmoothScroll>
          <Providers>
            <Navbar />
            <AnchorScrollHandler />
            {children}
            <Footer />
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
