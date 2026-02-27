import React from 'react';
import Link from 'next/link';

interface FounderActionStripProps {
  isOwner: boolean;
  campaignId: string;
}

export default function FounderActionStrip({ isOwner, campaignId }: FounderActionStripProps) {
  if (!isOwner) return null;

  return (
    <div className="bg-[#111111] text-[#FCFAF6] py-3 px-4 border-b border-[#FCFAF6]/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#b5e315] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <p className="font-mono text-sm font-bold tracking-widest uppercase">Founder Admin Mode Active</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/campaign/${campaignId}/submit-milestone`} className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-[#b5e315] text-[#111111] font-bold text-sm rounded-lg hover:bg-[#a3cc13] transition-colors whitespace-nowrap">
            Submit Milestone
          </Link>
          <Link href="/admin" className="flex-1 sm:flex-none text-center px-5 py-2.5 border border-[#FCFAF6]/30 text-[#FCFAF6] font-bold text-sm rounded-lg hover:bg-[#FCFAF6]/10 transition-colors whitespace-nowrap">
            Verifications
          </Link>
        </div>
      </div>
    </div>
  );
}
