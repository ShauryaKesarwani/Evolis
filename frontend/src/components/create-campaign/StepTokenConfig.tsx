import React from 'react';
import { CampaignData } from './types';

interface StepTokenConfigProps {
  data: CampaignData;
  updateData: (fields: Partial<CampaignData>) => void;
}

export default function StepTokenConfig({ data, updateData }: StepTokenConfigProps) {
  // Simple check to ensure percentages add up to 100
  const totalPercentage = data.publicSalePercentage + data.teamPercentage + data.treasuryPercentage;
  const isPercentageValid = totalPercentage === 100;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-martian font-bold mb-2">Token Configuration</h2>
        <p className="text-[#111111]/70 mb-6">Define your project's native utility token and its initial distribution.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Token Name *</label>
            <input
              type="text"
              placeholder="e.g., Evo Token"
              className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
              value={data.tokenName}
              onChange={(e) => updateData({ tokenName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Token Symbol *</label>
            <input
              type="text"
              placeholder="e.g., EVO"
              className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors uppercase"
              value={data.symbol}
              onChange={(e) => updateData({ symbol: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Total Supply *</label>
          <input
            type="number"
            min="0"
            placeholder="e.g., 1000000"
            className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
            value={data.totalSupply || ''}
            onChange={(e) => updateData({ totalSupply: Number(e.target.value) })}
          />
        </div>

        <div className="pt-4 border-t border-[#111111]/10">
          <h3 className="text-lg font-bold mb-4">Token Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Public Sale (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                value={data.publicSalePercentage || ''}
                onChange={(e) => updateData({ publicSalePercentage: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Team (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                value={data.teamPercentage || ''}
                onChange={(e) => updateData({ teamPercentage: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Treasury (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                value={data.treasuryPercentage || ''}
                onChange={(e) => updateData({ treasuryPercentage: Number(e.target.value) })}
              />
            </div>
          </div>
          
          {!isPercentageValid && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              Total distribution must equal 100%. Current total: {totalPercentage}%
            </p>
          )}

          {/* Visual Bar */}
          <div className="w-full h-4 rounded-full flex overflow-hidden mt-4 bg-[#111111]/10">
            <div 
              className="bg-[#b5e315] transition-all duration-300"
              style={{ width: `${data.publicSalePercentage}%` }}
              title={`Public Sale: ${data.publicSalePercentage}%`}
            />
            <div 
              className="bg-[#111111] transition-all duration-300"
              style={{ width: `${data.teamPercentage}%` }}
              title={`Team: ${data.teamPercentage}%`}
            />
            <div 
              className="bg-[#111111]/40 transition-all duration-300"
              style={{ width: `${data.treasuryPercentage}%` }}
              title={`Treasury: ${data.treasuryPercentage}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
