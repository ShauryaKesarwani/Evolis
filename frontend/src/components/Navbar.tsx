"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white border-b border-[#111111]/10 py-4 shadow-sm" : "bg-[#FCFAF6] border-b border-[#111111]/5 py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold font-mono text-[#111111] tracking-tighter flex items-center gap-1">
          <div className="w-6 h-6 bg-accent rounded-sm shadow-sm border border-[#111111]"></div>
          EVOLIS
        </Link>
        
        {/* Center Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-[#111111]">
          <Link href="/" className="hover:text-accent font-sans transition-colors relative group">
            Explore
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#111111] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/create" className="hover:text-accent font-sans transition-colors relative group">
            Create Campaign
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#111111] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/dashboard" className="hover:text-accent font-sans transition-colors relative group">
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#111111] transition-all group-hover:w-full"></span>
          </Link>
        </div>
        
        {/* Action */}
        <button className="px-6 py-2.5 rounded-full bg-[#111111] text-[#FCFAF6] text-sm font-semibold font-mono hover:bg-accent hover:text-[#111111] transition-all border border-transparent hover:border-[#111111] shadow-md hover:shadow-lg hover:-translate-y-0.5 transform active:translate-y-0">
          Connect Wallet
        </button>
      </div>
    </nav>
  );
}
