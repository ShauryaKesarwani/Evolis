"use client";

import { useState } from "react";
import { Search, Lock, Handshake, Rocket, ShieldCheck, Unlock } from "lucide-react";

const backerSteps = [
  {
    id: "01",
    title: "Discover & Fund",
    description: "Explore curated, early-stage campaigns and back projects directly with your BNB.",
    icon: <Search className="w-10 h-10" />
  },
  {
    id: "02",
    title: "Milestone Escrow",
    description: "Funds are locked in a secure smart contract escrow and released only when milestones are met.",
    icon: <Lock className="w-10 h-10" />
  },
  {
    id: "03",
    title: "Engage & Validate",
    description: "Track progress, engage with founders, and participate in community validation to shape the future.",
    icon: <Handshake className="w-10 h-10" />
  }
];

const creatorSteps = [
  {
    id: "01",
    title: "Launch Campaign",
    description: "Define your vision, set transparent milestones, and outline your funding goals on BNB Chain.",
    icon: <Rocket className="w-10 h-10" />
  },
  {
    id: "02",
    title: "Secure Escrow",
    description: "Receive funds safely in a smart contract. Backers' confidence grows as funds are tied to your delivery.",
    icon: <ShieldCheck className="w-10 h-10" />
  },
  {
    id: "03",
    title: "Execute & Unlock",
    description: "Deliver on your promises, hit your milestones, and automatically unlock capital to scale.",
    icon: <Unlock className="w-10 h-10" />
  }
];

export default function HowItWorksSection() {
  const [isCreator, setIsCreator] = useState(false);

  const steps = isCreator ? creatorSteps : backerSteps;

  return (
    <section id="how-it-works" className="relative py-24 px-6 text-[#FCFAF6] bg-[#111111] overflow-hidden transition-colors duration-700 ease-in-out">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 flex flex-col md:flex-row md:justify-between md:items-start text-center md:text-left gap-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-black font-mono tracking-tighter uppercase mb-4">
              How Evolis Works
            </h2>
            <p className="text-xl text-[#FCFAF6]/70 font-sans max-w-2xl">
              A transparent and milestone-driven approach to funding the next generation of web3 startups.
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="bg-[#1a1a1a] p-[6px] rounded-full border border-[#333] flex relative min-w-[320px] shrink-0">
            <div 
              className={`absolute top-[6px] bottom-[6px] w-[calc(50%-6px)] rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
                isCreator ? "left-[50%] bg-[#b5e315]" : "left-[6px] bg-[#b5e315]"
              }`}
            ></div>
            
            <button
              onClick={() => setIsCreator(false)}
              className={`flex-1 relative z-10 py-3 rounded-full font-mono font-bold text-sm transition-colors duration-300 ${
                !isCreator ? "text-[#111111]" : "text-[#FCFAF6]/70 hover:text-[#FCFAF6]"
              }`}
            >
              For Backers
            </button>
            <button
              onClick={() => setIsCreator(true)}
              className={`flex-1 relative z-10 py-3 rounded-full font-mono font-bold text-sm transition-colors duration-300 ${
                isCreator ? "text-[#111111]" : "text-[#FCFAF6]/70 hover:text-[#FCFAF6]"
              }`}
            >
              For Creators
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div 
              key={`${isCreator ? 'creator' : 'backer'}-${step.id}`} 
              className={`border rounded-[2rem] p-8 transition-all duration-300 flex flex-col ${
                isCreator 
                  ? "bg-[#b5e315] border-[#b5e315] text-[#111111] hover:shadow-[8px_8px_0px_#111111] hover:-translate-y-1" 
                  : "bg-[#1a1a1a] border-[#333] text-[#FCFAF6] hover:border-[#b5e315]"
              }`}
            >
              <div className="text-4xl mb-6 transform transition-transform duration-500 hover:scale-110 origin-left inline-block">
                {step.icon}
              </div>
              <div className={`font-mono font-bold text-sm mb-4 transition-colors duration-500 ${isCreator ? "text-[#111111]/80" : "text-[#b5e315]"}`}>
                STEP {step.id}
              </div>
              <h3 className="text-2xl font-black font-mono tracking-tight uppercase mb-4">{step.title}</h3>
              <p className={`font-sans leading-relaxed flex-grow transition-colors duration-500 ${isCreator ? "text-[#111111]/80" : "text-[#FCFAF6]/70"}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
