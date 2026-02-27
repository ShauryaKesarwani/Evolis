import React from 'react';

interface CampaignHeaderProps {
  name: string;
  tagline: string;
  logoUrl?: string;
  status: 'Active' | 'Goal Reached' | 'Refunds Enabled';
}

export default function CampaignHeader({ name, tagline, logoUrl, status }: CampaignHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-[#111111]/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Logo Placeholder */}
        <div className="w-24 h-24 rounded-2xl bg-[#111111]/5 border border-[#111111]/10 flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={`${name} logo`} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-4xl text-[#111111]/30 font-bold">{name.charAt(0)}</span>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-mono text-3xl md:text-5xl font-bold tracking-tight text-[#111111]">{name}</h1>
            <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-full border-2 border-[#111111] ${
              status === 'Active' ? 'bg-[#b5e315] text-[#111111]' : 
              status === 'Goal Reached' ? 'bg-[#111111] text-[#FCFAF6]' : 
              'bg-red-500 text-white'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-lg md:text-xl text-[#111111]/70 leading-relaxed max-w-2xl font-medium">{tagline}</p>
        </div>
      </div>

      <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#111111] font-bold hover:bg-[#111111]/5 transition-colors shrink-0 w-full md:w-auto">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Share
      </button>
    </div>
  );
}
