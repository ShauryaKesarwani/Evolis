'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inter, Martian_Mono } from 'next/font/google';
import { useAccount } from 'wagmi';

const inter = Inter({ subsets: ['latin'] });
const martianMono = Martian_Mono({ subsets: ['latin'] });

// --- Mock Data ---

type Investment = {
  id: string;
  projectName: string;
  tokensHeld: string;
  fundingProgress: number; // percentage
  currentPhase: string;
};

type CreatedCampaign = {
  id: string;
  projectName: string;
  goalBNB: number;
  raisedBNB: number;
  currentPhase: string;
  milestoneReady: boolean;
};

const mockInvestments: Investment[] = [
  { id: 'inv1', projectName: 'DeFi Liquidity Hub', tokensHeld: '5,000 DLH', fundingProgress: 100, currentPhase: 'Milestone 2 Active' },
  { id: 'inv2', projectName: 'GameFi NFT Marketplace', tokensHeld: '12,500 GNM', fundingProgress: 85, currentPhase: 'Initial Funding Phase' },
  { id: 'inv3', projectName: 'Regen Agriculture Tracker', tokensHeld: '2,000 REGEN', fundingProgress: 100, currentPhase: 'Milestone 1 Active' },
];

const mockCreatedCampaigns: CreatedCampaign[] = [
  { id: 'camp1', projectName: 'zkBNB Identity Protocol', goalBNB: 1500, raisedBNB: 1500, currentPhase: 'Milestone 1', milestoneReady: true },
  { id: 'camp2', projectName: 'BNB Greenfield Storage App', goalBNB: 500, raisedBNB: 230, currentPhase: 'Funding Phase', milestoneReady: false },
];

// --- Components ---

function DashboardProfile({ address, totalInvested, projectsBacked }: { address: string, totalInvested: number, projectsBacked: number }) {
  return (
    <div className="bg-[#111111] text-[#FCFAF6] rounded-3xl p-8 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#b5e315]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <h1 className={`${martianMono.className} text-4xl md:text-5xl font-bold tracking-tight mb-2`}>
            Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b5e315] to-[#7a990e] border-2 border-white/10"></div>
            <p className={`${martianMono.className} text-xl text-white/80`}>{address}</p>
          </div>
        </div>
        
        <div className="flex gap-8 border-t border-white/10 pt-6 md:pt-0 md:border-none w-full md:w-auto">
          <div>
            <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Total Invested</p>
            <p className={`${martianMono.className} text-3xl font-bold text-[#b5e315]`}>
              {totalInvested.toLocaleString()} <span className="text-xl">BNB</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-white/50 uppercase tracking-wider mb-1">Projects Backed</p>
            <p className={`${martianMono.className} text-3xl font-bold text-white`}>
              {projectsBacked}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardTabs({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const tabs = ['My Investments', 'My Campaigns', 'Token Portfolio'];
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#111111]/10 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab 
              ? 'bg-[#111111] text-[#FCFAF6] border border-[#111111]' 
              : 'border border-[#111111]/20 text-[#111111]/70 hover:bg-[#111111]/5 hover:text-[#111111]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function InvestmentsGrid({ investments }: { investments: Investment[] }) {
  if (investments.length === 0) {
    return (
      <div className="py-12 text-center border border-[#111111]/10 border-dashed rounded-2xl bg-white/50">
        <p className="text-[#111111]/60 mb-4">You haven't backed any projects yet.</p>
        <Link href="/#explore" className="bg-[#111111] text-white px-6 py-3 rounded-full font-medium inline-block hover:bg-[#111111]/80 transition-colors">
          Explore Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {investments.map((inv) => (
        <div key={inv.id} className="bg-white rounded-2xl border border-[#111111]/10 p-6 flex flex-col hover:border-[#111111]/30 transition-colors shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#111111]/5 flex items-center justify-center border border-[#111111]/10">
              {/* Mock Logo Placeholder */}
              <span className="font-bold text-[#111111]/40">{inv.projectName.charAt(0)}</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-1 bg-[#111111]/5 text-[#111111] rounded whitespace-nowrap">
              {inv.currentPhase}
            </span>
          </div>
          
          <h3 className="font-bold text-lg mb-1 truncate">{inv.projectName}</h3>
          
          <div className="mt-4 mb-6 flex-1">
            <p className="text-sm text-[#111111]/50 mb-1">Tokens Held</p>
            <p className={`${martianMono.className} font-bold text-lg`}>{inv.tokensHeld}</p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#111111]/50">Funding Progress</span>
              <span className="font-bold">{inv.fundingProgress}%</span>
            </div>
            <div className="h-2 w-full bg-[#111111]/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${inv.fundingProgress >= 100 ? 'bg-[#b5e315]' : 'bg-[#111111]'}`}
                style={{ width: `${inv.fundingProgress}%` }}
              ></div>
            </div>
          </div>
          
          <Link href={`/campaign/${inv.id}`} className="w-full py-3 border border-[#111111]/20 rounded-xl text-center font-medium hover:bg-[#111111]/5 transition-colors">
            View Campaign
          </Link>
        </div>
      ))}
    </div>
  );
}

function FounderCampaignsGrid({ campaigns }: { campaigns: CreatedCampaign[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="py-16 px-6 text-center border-2 border-[#111111]/10 border-dashed rounded-3xl bg-white/50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-[#b5e315]/20 text-[#b5e315] rounded-full flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-8m0 0V4m0 8h8m-8 0H4"/></svg>
        </div>
        <h3 className={`${martianMono.className} text-xl font-bold mb-2`}>No Projects Launched</h3>
        <p className="text-[#111111]/60 mb-6 max-w-md">You haven't launched any projects yet. Start your journey by creating a campaign directly on the BNB Chain.</p>
        <Link 
          href="/create" 
          className="bg-[#b5e315] hover:bg-[#a3cc12] text-[#111111] font-bold py-4 px-8 rounded-full shadow-[4px_4px_0px_#111111] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Launch a Campaign
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {campaigns.map((camp) => (
        <div key={camp.id} className="bg-white rounded-2xl border border-[#111111]/20 p-6 md:p-8 flex flex-col shadow-sm relative overflow-hidden">
          {camp.milestoneReady && (
            <div className="absolute top-0 right-0 bg-[#b5e315] text-[#111111] text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
              Action Required
            </div>
          )}
          
          <div className="flex justify-between items-start mb-6">
            <h3 className={`${martianMono.className} text-xl font-bold pr-8`}>{camp.projectName}</h3>
            <span className="text-[10px] uppercase font-bold px-2 py-1 bg-[#111111]/5 text-[#111111] rounded whitespace-nowrap">
              {camp.currentPhase}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-[#111111]/10 rounded-xl p-4 bg-[#FCFAF6]">
              <p className="text-xs text-[#111111]/50 uppercase tracking-wider mb-1">Raised</p>
              <p className="font-bold text-xl">{camp.raisedBNB} <span className="text-sm font-normal text-[#111111]/60">BNB</span></p>
            </div>
            <div className="border border-[#111111]/10 rounded-xl p-4 bg-[#FCFAF6]">
              <p className="text-xs text-[#111111]/50 uppercase tracking-wider mb-1">Goal</p>
              <p className="font-bold text-xl">{camp.goalBNB} <span className="text-sm font-normal text-[#111111]/60">BNB</span></p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#111111]/50">Funding Progress</span>
              <span className="font-bold">{Math.round((camp.raisedBNB / camp.goalBNB) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-[#111111]/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-[#111111]"
                style={{ width: `${Math.min((camp.raisedBNB / camp.goalBNB) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <Link href={`/campaign/${camp.id}`} className="flex-1 py-3 border border-[#111111]/20 rounded-xl text-center font-medium hover:bg-[#111111]/5 transition-colors">
              Manage Project
            </Link>
            {camp.milestoneReady && (
              <Link
                href={`/campaign/${camp.id}/submit-milestone`}
                className="flex-1 bg-[#111111] hover:bg-[#222222] text-white font-bold py-3 rounded-xl transition-colors text-center"
              >
                Submit Milestone
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main Page ---

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('My Investments');
  const [isFounderMode, setIsFounderMode] = useState(false); // Toggle for mock states
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  
  const [fetchedCampaigns, setFetchedCampaigns] = useState<CreatedCampaign[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const fetchProjects = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const res = await fetch(`${apiUrl}/projects`);
          const data = await res.json();
          const projects = data.projects || [];
          
          // Try to filter by creator if wallet is connected
          let filteredProjects = projects;
          if (isConnected && address) {
            const myProjects = projects.filter(
              (p: any) => p.creator?.toLowerCase() === address.toLowerCase()
            );
            // If creator filter found nothing (contract stores 0x000...), show all
            if (myProjects.length > 0) {
              filteredProjects = myProjects;
            }
          }
          
          const myCampaigns = filteredProjects.map((p: any) => ({
            id: String(p.id),
            projectName: p.name || `Project #${p.id}`,
            goalBNB: Number(p.funding_goal || 0) / 1e18,
            raisedBNB: Number(p.total_raised || 0) / 1e18,
            currentPhase: p.status || 'Active',
            milestoneReady: false
          }));
            
          setFetchedCampaigns(myCampaigns);
        } catch (e) {
          console.error("Failed to fetch dashboard campaigns", e);
        }
      };
      
      fetchProjects();
    }
  }, [mounted, isConnected, address]);

  const displayAddress = mounted && isConnected && address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : 'Not Connected';

  return (
    <div className={`min-h-screen bg-[#FCFAF6] text-[#111111] pb-24 ${inter.className}`}>
      {/* Dev Toggle purely for demonstration purposes */}
      <div className="bg-[#b5e315] text-[#111111] py-2 px-4 text-xs font-bold flex justify-center items-center gap-4 border-b border-[#111111]/10">
        <span>DEMO MODE TOGGLE:</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isFounderMode} 
            onChange={(e) => setIsFounderMode(e.target.checked)}
            className="accent-[#111111] w-4 h-4 cursor-pointer"
          />
          Show Mock Data (Populated)
        </label>
      </div>

      <main className="max-w-6xl mx-auto pt-8 px-4 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium mb-6 text-[#111111]/60 hover:text-[#111111] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </Link>
        
        <DashboardProfile 
          address={displayAddress} 
          totalInvested={isFounderMode ? 425.5 : 12.5} 
          projectsBacked={isFounderMode ? 12 : 1} 
        />
        
        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          {activeTab === 'My Investments' && (
            <InvestmentsGrid investments={isFounderMode ? mockInvestments : mockInvestments.slice(0, 1)} />
          )}
          
          {activeTab === 'My Campaigns' && (
            <FounderCampaignsGrid campaigns={isFounderMode ? mockCreatedCampaigns : fetchedCampaigns} />
          )}

          {activeTab === 'Token Portfolio' && (
            <div className="py-16 px-6 text-center border-2 border-[#111111]/10 border-dashed rounded-3xl bg-white/50 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#111111]/5 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              </div>
              <h3 className={`${martianMono.className} text-xl font-bold mb-2`}>Portfolio Tracker Coming Soon</h3>
              <p className="text-[#111111]/60 max-w-md">Detailed breakdown of all your locked tokens, vesting schedules, and claimed project tokens.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
