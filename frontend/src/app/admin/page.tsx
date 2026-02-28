'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inter, Martian_Mono } from 'next/font/google';
import { useAccount, useDisconnect } from 'wagmi';

const inter = Inter({ subsets: ['latin'] });
const martianMono = Martian_Mono({ subsets: ['latin'] });

// --- Mock Data ---

type Milestone = {
  id: string;
  projectId: string;
  projectName: string;
  descriptionSnippet: string;
  fullDescription: string;
  unlockAmount: number;
  founderProofText: string;
  founderProofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
};

const mockMilestones: Milestone[] = [
  {
    id: 'm1',
    projectId: 'p1',
    projectName: 'DeFi Liquidity Hub',
    descriptionSnippet: 'Smart Contract Audit & Testnet Deployment',
    fullDescription: 'Completed comprehensive smart contract audit with Certik and successfully deployed the v1 protocol to the BNB testnet. All critical bugs fixed.',
    unlockAmount: 500,
    founderProofText: 'Certik Audit Report PDF and Testnet Contract Addresses available in the linked document.',
    founderProofUrl: 'https://example.com/audit-report.pdf',
    status: 'pending'
  },
  {
    id: 'm2',
    projectId: 'p2',
    projectName: 'GameFi NFT Marketplace',
    descriptionSnippet: 'Beta Launch and Initial User Acquisition',
    fullDescription: 'Launched beta version of the marketplace. Acquired 5,000 active users in the first week and achieved 1,000 daily active users.',
    unlockAmount: 250,
    founderProofText: 'Analytics dashboard screenshot and Google Analytics export provided.',
    founderProofUrl: 'https://example.com/analytics-proof.pdf',
    status: 'pending'
  },
  {
    id: 'm3',
    projectId: 'p3',
    projectName: 'Regen Agriculture Tracker',
    descriptionSnippet: 'IoT Sensor Integration',
    fullDescription: 'Successfully integrated 50 field sensors to track soil moisture and carbon sequestration data in real-time, syncing to the BNB Greenfield.',
    unlockAmount: 150,
    founderProofText: 'Video demonstration of sensor syncing and data dashboard access.',
    founderProofUrl: 'https://example.com/iot-demo.mp4',
    status: 'pending'
  }
];

// --- Components ---

function AdminHeader({ adminWallet, globalBalance }: { adminWallet: string, globalBalance: number }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-[#111111]/10 pb-6">
      <div>
        <h1 className={`${martianMono.className} text-3xl md:text-5xl font-bold tracking-tight text-[#111111] uppercase mb-2`}>
          Platform Admin
        </h1>
        <p className={`${inter.className} text-xl text-[#111111]/70`}>
          Milestone Verification
        </p>
      </div>
      <div className="mt-4 md:mt-0 text-left md:text-right flex flex-col md:items-end gap-2">
        <div className="bg-[#111111] text-[#FCFAF6] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#b5e315]"></div>
          Admin: {adminWallet}
        </div>
        <div className="text-[#111111]/60 text-sm">
          Platform Escrow: <span className="font-bold text-[#111111]">{globalBalance.toLocaleString()} BNB</span>
        </div>
      </div>
    </div>
  );
}

function MilestoneReviewList({ 
  milestones, 
  selectedId, 
  onSelect 
}: { 
  milestones: Milestone[], 
  selectedId: string | null, 
  onSelect: (id: string) => void 
}) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[800px] pr-2">
      <h2 className={`${martianMono.className} text-xl font-bold mb-2`}>Pending Reviews ({milestones.filter(m => m.status === 'pending').length})</h2>
      {milestones.length === 0 && (
        <div className="p-6 border border-[#111111]/10 rounded-xl text-center text-[#111111]/50">
          No pending milestones.
        </div>
      )}
      {milestones.map((m) => {
        const isSelected = m.id === selectedId;
        return (
          <div 
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`cursor-pointer transition-all duration-200 border rounded-xl p-5 ${
              isSelected 
                ? 'border-[#111111] bg-white shadow-[4px_4px_0px_#111111]' 
                : 'border-[#111111]/10 bg-white/50 hover:border-[#111111]/40'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-[#111111] truncate pr-2">{m.projectName}</h3>
              {m.status === 'pending' ? (
                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-[#111111]/5 text-[#111111] rounded whitespace-nowrap">Awaiting Review</span>
              ) : m.status === 'approved' ? (
                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-[#b5e315]/20 text-[#b5e315] rounded whitespace-nowrap">Approved</span>
              ) : (
                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-red-100 text-red-600 rounded whitespace-nowrap">Rejected</span>
              )}
            </div>
            <p className="text-sm text-[#111111]/70 line-clamp-2">{m.descriptionSnippet}</p>
          </div>
        );
      })}
    </div>
  );
}

function VerificationControlStrip({ 
  onApprove, 
  onReject 
}: { 
  onApprove: () => void, 
  onReject: (reason: string) => void 
}) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (isRejecting) {
    return (
      <div className="mt-8 pt-6 border-t border-[#111111]/10 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
        <label className="font-medium text-sm">Reason for Rejection</label>
        <textarea 
          placeholder="Explain why this milestone is rejected..."
          className="w-full text-sm p-3 border border-[#111111]/20 rounded-xl focus:outline-none focus:border-[#111111] resize-none h-24 bg-[#FCFAF6]"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
        <div className="flex gap-4">
          <button 
            onClick={() => {
              onReject(rejectReason);
              setIsRejecting(false);
              setRejectReason('');
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
            disabled={rejectReason.trim().length < 5}
          >
            Confirm Rejection
          </button>
          <button 
            onClick={() => {
              setIsRejecting(false);
              setRejectReason('');
            }}
            className="px-6 py-3 border border-[#111111]/20 rounded-xl hover:bg-[#111111]/5 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-[#111111]/10 flex flex-col sm:flex-row gap-4">
      <button
        onClick={onApprove}
        className="flex-1 bg-[#111111] hover:bg-[#222222] text-white font-bold py-4 px-6 rounded-xl shadow-[4px_4px_0px_#b5e315] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        Verify Milestone
      </button>
      <button
        onClick={() => {
          // Release logic is usually separate
          alert("To release funds, please verify the milestone first, then use the Release trigger.");
        }}
        className="flex-1 bg-[#b5e315] hover:bg-[#a3cc12] text-[#111111] font-bold py-4 px-6 rounded-xl shadow-[4px_4px_0px_#111111] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        Release Funds
      </button>
      <button
        onClick={() => setIsRejecting(true)}
        className="px-8 py-4 border border-[#111111]/20 text-[#111111]/70 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl font-medium transition-colors"
      >
        Reject
      </button>
    </div>
  );
}

function AdminMilestoneDetail({ 
  milestone,
  onApprove,
  onReject
}: { 
  milestone: Milestone,
  onApprove: (id: string) => void,
  onReject: (id: string, reason: string) => void
}) {
  return (
    <div className="bg-white border border-[#111111]/10 rounded-2xl p-6 md:p-10 flex flex-col h-full relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-[#111111] rounded-t-2xl"></div>
      
      <div className="mb-8 mt-2">
        <h2 className="text-sm font-bold text-[#111111]/50 uppercase tracking-widest mb-1">Project</h2>
        <h3 className={`${martianMono.className} text-2xl md:text-3xl font-bold`}>{milestone.projectName}</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 border border-[#111111]/10 rounded-xl p-5 bg-[#FCFAF6]">
          <h4 className="text-xs font-bold text-[#111111]/50 uppercase mb-2">Stage Description</h4>
          <p className="text-[#111111] font-medium mb-1">{milestone.descriptionSnippet}</p>
          <p className="text-sm text-[#111111]/70 leading-relaxed">{milestone.fullDescription}</p>
        </div>
        <div className="border border-[#111111]/10 rounded-xl p-5 bg-[#111111] text-[#FCFAF6] flex flex-col justify-center">
          <h4 className="text-xs font-bold text-white/50 uppercase mb-2">Unlock Amount</h4>
          <div className="text-3xl font-bold text-[#b5e315] flex items-baseline gap-1">
            {milestone.unlockAmount} <span className="text-lg">BNB</span>
          </div>
        </div>
      </div>

      <div className="border border-[#111111]/10 rounded-xl p-5 bg-white flex-1 mb-4">
        <h4 className="text-xs font-bold text-[#111111]/50 uppercase mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Founder's Submitted Proof
        </h4>
        <p className="text-sm text-[#111111]/80 mb-4 bg-[#FCFAF6] p-4 rounded-lg border border-[#111111]/5 italic">
          "{milestone.founderProofText}"
        </p>
        <Link href={milestone.founderProofUrl} target="_blank" className="inline-flex items-center gap-2 text-sm font-medium text-[#111111] hover:text-[#b5e315] transition-colors underline decoration-[#111111]/20 underline-offset-4 hover:decoration-[#b5e315]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          View External Proof Document
        </Link>
      </div>

      {milestone.status === 'pending' ? (
        <VerificationControlStrip 
          onApprove={() => onApprove(milestone.id)} 
          onReject={(reason) => onReject(milestone.id, reason)} 
        />
      ) : (
        <div className={`mt-8 pt-6 border-t border-[#111111]/10 text-center p-4 rounded-xl ${milestone.status === 'approved' ? 'bg-[#b5e315]/10 text-[#5a7008]' : 'bg-red-50 text-red-600'}`}>
          <p className="font-bold">This milestone has been {milestone.status}.</p>
        </div>
      )}
    </div>
  );
}

// --- Main Page ---

export default function AdminPage() {
  const [isAdminChecking, setIsAdminChecking] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);
  const [selectedId, setSelectedId] = useState<string | null>(mockMilestones[0].id);
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  
  // NOTE: This usually lives in .env, checking against it. 
  // For safety and UI demo we'll just check if they are connected as a demo "admin" 
  // or use a placeholder format. (e.g. 0xAdmin... or environment variables) 
  const EXPECTED_ADMIN = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0x98154Db8A53BB5B79BfcA75fAEeAC988B3b11891".toLowerCase();

  const isAuthorized = mounted && isConnected && address?.toLowerCase() === EXPECTED_ADMIN.toLowerCase();

  useEffect(() => {
    setMounted(true);
    // Simulate checking admin access
    const timer = setTimeout(() => {
      setIsAdminChecking(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
  };

  const handleReject = (id: string, reason: string) => {
    console.log(`Rejected ${id} for reason: ${reason}`);
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
  };

  if (isAdminChecking) {
    return (
      <div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center font-mono text-[#111111]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#111111]/20 border-t-[#b5e315] rounded-full animate-spin"></div>
          <p>verifying platform admin access...</p>
        </div>
      </div>
    );
  }

  const selectedMilestone = milestones.find(m => m.id === selectedId);

  if (!isAuthorized && !isAdminChecking && mounted) {
    return (
      <div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center font-mono text-[#111111]">
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-8 border-2 border-red-200 bg-red-50 rounded-2xl">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <h2 className="text-xl font-bold text-red-700">Access Denied</h2>
          <p className="text-red-600/80 mb-4">Your connected wallet ({address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}) is not authorized to access the platform admin panel.</p>
          <button 
            onClick={() => disconnect()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
          >
            Disconnect Wallet
          </button>
          <Link href="/" className="underline text-sm text-red-600/60 hover:text-red-800 mt-2">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FCFAF6] text-[#111111] ${inter.className}`}>
      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium mb-8 text-[#111111]/60 hover:text-[#111111] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Home
        </Link>
        <AdminHeader adminWallet={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Unknown"} globalBalance={24500} />
        
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: List */}
          <div className="lg:col-span-1">
            <MilestoneReviewList 
              milestones={milestones} 
              selectedId={selectedId} 
              onSelect={setSelectedId} 
            />
          </div>
          
          {/* Right Column: Detail */}
          <div className="lg:col-span-2">
            {selectedMilestone ? (
              <AdminMilestoneDetail 
                milestone={selectedMilestone}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ) : (
              <div className="h-full min-h-[400px] border border-[#111111]/10 border-dashed rounded-2xl flex items-center justify-center text-[#111111]/40 bg-white/50">
                Select a milestone to review details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
