"use client";

import { useEffect, useState } from "react";
import CampaignCard from "./CampaignCard";

interface ProjectRow {
  id: number;
  name: string | null;
  tagline: string | null;
  logo_url: string | null;
  website_url: string | null;
  symbol: string | null;
  category: string | null;
  token_address: string | null;
  escrow_address: string | null;
  creator: string | null;
  funding_goal: string | null;
  total_raised: string | null;
  deadline: number | null;
  status: string | null;
}

export default function CampaignGrid() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/projects`);
        const data = await res.json();
        
        const mapped = (data.projects || []).map((p: ProjectRow) => {
          const raisedNum = Number(p.total_raised || 0) / 1e18;
          const targetNum = Number(p.funding_goal || 0) / 1e18;
          const progressPercent = targetNum > 0 ? Math.min(100, Math.floor((raisedNum / targetNum) * 100)) : 0;
          
          return {
            id: String(p.id),
            name: p.name || `Project #${p.id}`,
            category: p.category || "DeFi",
            symbol: p.symbol || null,
            tagline: p.tagline || null,
            logoUrl: p.logo_url || null,
            status: p.status || "Funding",
            milestoneStr: "View Details",
            raised: raisedNum.toLocaleString(undefined, { maximumFractionDigits: 4 }),
            target: targetNum.toLocaleString(undefined, { maximumFractionDigits: 4 }),
            price: "-",
            progressPercent,
          };
        });
        
        setCampaigns(mapped);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-6 bg-[#FCFAF6] min-h-[600px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#111111]/20 border-t-[#b5e315] rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 bg-[#FCFAF6]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-[#111111]">
            Active Campaigns.
          </h2>
          <span className="hidden md:inline-block text-sm font-sans font-semibold text-[#111111]/50 uppercase tracking-widest border border-[#111111]/20 rounded-full px-4 py-1">
            Displaying {campaigns.length} Projects
          </span>
        </div>

        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="h-auto aspect-[4/5] sm:aspect-auto sm:h-[420px]">
                <CampaignCard {...campaign} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-[#111111]/10 rounded-3xl">
            <p className="text-[#111111]/50 font-mono">No active campaigns found.</p>
          </div>
        )}
        
        {campaigns.length > 0 && (
          <div className="mt-16 flex justify-center">
            <button className="px-8 py-4 rounded-full bg-white text-[#111111] font-bold text-center border-2 border-[#111111]/10 hover:border-[#111111] shadow-sm hover:-translate-y-1 transition-all duration-200">
              Load More Projects
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
