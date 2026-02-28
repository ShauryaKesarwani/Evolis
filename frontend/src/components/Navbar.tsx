"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from 'wagmi';
import ConnectWalletModal from "./ConnectWalletModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
        scrolled ? "bg-white border-b border-[#111111]/10 py-4 shadow-sm" : "bg-[#FCFAF6] border-b border-[#111111]/5 py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
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
        <div className="flex items-center gap-4">
          {!mounted ? (
            <button className="px-6 py-2.5 rounded-full bg-[#111111]/5 text-transparent text-sm font-semibold font-mono select-none animate-pulse h-[42px] w-[150px]">
              Loading
            </button>
          ) : isConnected && address ? (
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 font-mono text-sm font-medium text-[#111111] bg-[#111111]/5 border border-[#111111]/10 rounded-full">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button 
                onClick={() => disconnect()}
                className="px-4 py-2 rounded-full bg-[#111111]/5 border border-[#111111]/20 text-[#111111] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-semibold font-mono transition-all transform active:translate-y-0 active:shadow-none"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-[#111111] text-[#FCFAF6] text-sm font-semibold font-mono hover:bg-accent hover:text-[#111111] transition-all border border-transparent hover:border-[#111111] shadow-md hover:shadow-lg hover:-translate-y-0.5 transform active:translate-y-0 active:shadow-none"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      
      <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav>
  );
}
