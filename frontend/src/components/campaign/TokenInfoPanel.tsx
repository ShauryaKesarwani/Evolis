import React from 'react';

interface TokenInfoProps {
  name: string;
  symbol: string;
  priceBNB: number;
  totalSupply: number;
  allocations: {
    label: string;
    percentage: number;
    color: string;
  }[];
}

export default function TokenInfoPanel({ name, symbol, priceBNB, totalSupply, allocations }: TokenInfoProps) {
  return (
    <div className="bg-white border-2 border-[#111111]/10 rounded-2xl p-6 lg:p-8 space-y-6 group hover:border-[#b5e315] hover:shadow-[4px_4px_0px_#b5e315] transition-all duration-300">
      <h3 className="font-mono text-2xl font-bold text-[#111111]">Tokenomics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FCFAF6] rounded-xl border border-[#111111]/5">
          <p className="text-xs text-[#111111]/60 font-bold uppercase tracking-wider mb-1">Name</p>
          <p className="font-mono font-bold text-base md:text-lg text-[#111111]">{name}</p>
        </div>
        <div className="p-4 bg-[#FCFAF6] rounded-xl border border-[#111111]/5">
          <p className="text-xs text-[#111111]/60 font-bold uppercase tracking-wider mb-1">Symbol</p>
          <p className="font-mono font-bold text-base md:text-lg text-[#111111]">{symbol}</p>
        </div>
        <div className="p-4 bg-[#FCFAF6] rounded-xl border border-[#111111]/5">
          <p className="text-xs text-[#111111]/60 font-bold uppercase tracking-wider mb-1">Price</p>
          <p className="font-mono font-bold text-base md:text-lg text-[#111111]">{priceBNB} BNB</p>
        </div>
        <div className="p-4 bg-[#FCFAF6] rounded-xl border border-[#111111]/5">
          <p className="text-xs text-[#111111]/60 font-bold uppercase tracking-wider mb-1">Total Supply</p>
          <p className="font-mono font-bold text-base md:text-lg text-[#111111]">{totalSupply.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-[#111111]/10">
        <p className="text-sm text-[#111111] font-bold uppercase tracking-widest">Allocation Distribution</p>
        
        {/* Visual Allocation Bar */}
        <div className="h-4 w-full rounded-full overflow-hidden flex border-2 border-[#111111]">
          {allocations.map((alloc, idx) => (
            <div 
              key={idx} 
              style={{ width: `${alloc.percentage}%`, backgroundColor: alloc.color }}
              className="h-full border-r-2 last:border-r-0 border-[#111111]"
              title={`${alloc.label}: ${alloc.percentage}%`}
            />
          ))}
        </div>

        {/* Allocation Legend */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
          {allocations.map((alloc, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-[#111111]" style={{ backgroundColor: alloc.color }} />
              <span className="text-sm font-medium text-[#111111]/80">{alloc.label} <span className="font-bold text-[#111111]">({alloc.percentage}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
