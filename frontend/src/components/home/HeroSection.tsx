"use client";

import Link from "next/link";
import { useLenis } from "@studio-freight/react-lenis";
import { useState, useEffect } from "react";
import EscrowSphere from "./EscrowSphere";

const SYMBOLS = "!@#$%^&*()_+";

function ScramblingText({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(phrases[0]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const tick = () => {
      const isLastWord = index === phrases.length - 1;
      const delay = isLastWord ? 4000 : 1500; // Wait longer on the final word

      timeoutId = setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
      }, delay);
    };

    tick();

    return () => clearTimeout(timeoutId);
  }, [index, phrases.length]);

  useEffect(() => {
    let iteration = 0;
    const targetText = phrases[index];
    const maxLen = Math.max(...phrases.map((p) => p.length));
    
    const scrambleInterval = setInterval(() => {
      setText((prev) => {
        const currentLen = Math.max(prev.length, targetText.length);
        
        return Array.from({ length: currentLen })
          .map((_, i) => {
            if (i < iteration) {
              return targetText[i] || "";
            }
            return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          })
          .join("");
      });

      iteration += 1 / 2;
      
      if (iteration >= maxLen) {
        clearInterval(scrambleInterval);
        setText(targetText);
      }
    }, 38);
    
    return () => clearInterval(scrambleInterval);
  }, [index, phrases]);

  const chWidth = Math.max(...phrases.map((p) => p.length));

  return (
    <span 
      className="inline-block text-left whitespace-nowrap" 
      style={{ minWidth: `${chWidth}ch` }}
    >
      {text}
    </span>
  );
}

export default function HeroSection() {
  const lenis = useLenis();

  return (
    <section className="relative pt-40 pb-32 px-6 overflow-hidden bg-[#FCFAF6]">
      {/* Abstract Background Element for extra warmth */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column (Copy & CTA) */}
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-mono tracking-tighter text-[#111111] leading-[1.1] mb-8 uppercase">
            <ScramblingText phrases={["Fund the ", "Build the", "Scale the"]} /> <br />
            <span className="relative inline-block z-10">
              Future
              <span className="absolute bottom-2 left-0 w-full h-4 bg-accent -z-10 rotate-[-1deg]"></span>
            </span>,
            <br />with every Milestone.
          </h1>
          
          <p className="text-xl md:text-2xl text-[#111111]/70 font-sans mb-10 leading-relaxed max-w-xl">
            Store, fund, and engage with early-stage startups securely through 
            milestone-gated token escrows directly on BNB Chain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 font-mono">
            <a 
              href="#explore"
              onClick={(e) => {
                e.preventDefault();
                lenis?.scrollTo('#explore');
              }}
              className="px-8 py-4 rounded-full bg-accent text-[#111111] font-bold text-center border-2 border-[#111111] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#111111] active:translate-y-0 active:shadow-none transition-all duration-200"
            >
              Explore Campaigns ↗
            </a>
            <Link 
              href="/create"
              className="px-8 py-4 rounded-full bg-transparent text-[#111111] font-bold text-center border-2 border-[#111111] hover:bg-[#111111] hover:!text-[#FCFAF6] active:translate-y-0 active:shadow-none transition-all duration-200"
            >
              Launch a Project
            </Link>
          </div>
        </div>
        
        {/* Right Column (Interactive Sphere) */}
        <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[2rem] bg-white border-[3px] border-[#111111] overflow-hidden shadow-[8px_8px_0px_#111111]">
          {/* Abstract Background Element inside */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          
          <EscrowSphere completionPercentage={65} />
        </div>

      </div>
    </section>
  );
}
