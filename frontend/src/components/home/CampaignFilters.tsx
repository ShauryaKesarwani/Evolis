"use client";

import { useState } from "react";

export default function CampaignFilters() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStage, setActiveStage] = useState("Active");

  const categories = ["All", "DeFi", "Gaming", "Infra", "Social"];
  const stages = ["Upcoming", "Active", "Funded"];

  return (
    <div className="w-full bg-[#FCFAF6] border-y border-[#111111]/10 sticky top-[73px] z-40 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-6 justify-between items-center">
        
        {/* Categories (Left) */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                activeCategory === cat
                  ? "bg-accent text-[#111111] border-[#111111]"
                  : "bg-white text-[#111111]/70 border-[#111111]/10 hover:border-[#111111]/30 hover:text-[#111111]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stages & Sort (Right) */}
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex bg-white rounded-full p-1 border border-[#111111]/10 shadow-sm">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeStage === stage
                    ? "bg-[#111111] text-[#FCFAF6] shadow-sm"
                    : "text-[#111111]/60 hover:text-[#111111]"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-[#111111]/20 hidden sm:block"></div>

          <select className="bg-white border border-[#111111]/10 rounded-full px-4 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-accent cursor-pointer shadow-sm appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23111111%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem_1rem] bg-no-repeat bg-[right_0.5rem_center]">
            <option>Most Funded</option>
            <option>Newest</option>
            <option>Ending Soon</option>
          </select>
        </div>

      </div>
    </div>
  );
}
