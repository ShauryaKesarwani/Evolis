import React from 'react';

interface FundingProgressProps {
  amountRaised: number;
  fundingGoal: number;
  daysRemaining: number;
}

export default function FundingProgress({ amountRaised, fundingGoal, daysRemaining }: FundingProgressProps) {
  const progressPercent = Math.min(100, Math.round((amountRaised / fundingGoal) * 100));
  
  return (
    <div className="bg-white border-2 border-[#111111]/10 rounded-2xl p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-[#111111]/60 font-bold uppercase tracking-widest text-sm mb-1">Total Raised</h2>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl lg:text-5xl font-bold text-[#111111]">{amountRaised.toLocaleString()}</span>
            <span className="font-mono text-xl text-[#111111]/60 font-bold">BNB</span>
          </div>
        </div>
        <div className="sm:text-right">
          <span className="font-mono text-2xl font-bold block text-[#111111]">{progressPercent}%</span>
          <p className="text-[#111111]/60 text-sm font-medium mt-1">of {fundingGoal.toLocaleString()} BNB goal</p>
        </div>
      </div>

      {/* Progress Bar Container - Brutalist High Contrast Track */}
      <div className="h-6 w-full bg-[#111111] rounded-full overflow-hidden border-2 border-[#111111] relative">
        <div 
          className="absolute top-0 left-0 bottom-0 bg-[#b5e315] border-r-2 border-[#111111] transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="inline-flex gap-2 items-center text-[#111111]/80 font-bold bg-[#111111]/5 px-4 py-3 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Campaign Ended'}
      </div>
    </div>
  );
}
