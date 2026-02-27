import React from 'react';
import { CampaignData } from './types';

interface StepFundingGoalProps {
  data: CampaignData;
  updateData: (fields: Partial<CampaignData>) => void;
}

export default function StepFundingGoal({ data, updateData }: StepFundingGoalProps) {
  // Calculate implied token price: Funding Goal / (Total Supply * Public Sale %)
  const publicSaleTokens = data.totalSupply * (data.publicSalePercentage / 100);
  const impliedPrice = publicSaleTokens > 0 && data.fundingGoal > 0
    ? (data.fundingGoal / publicSaleTokens).toFixed(6)
    : '0.000000';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-martian font-bold mb-2">Funding Goal</h2>
        <p className="text-[#111111]/70 mb-6">Set your fundraising target and campaign duration.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Funding Goal (BNB) *</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 500"
              className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-4 md:text-2xl font-bold placeholder-[#111111]/30 focus:outline-none focus:border-[#b5e315] focus:bg-white transition-colors"
              value={data.fundingGoal || ''}
              onChange={(e) => updateData({ fundingGoal: Number(e.target.value) })}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <span className="font-bold text-[#111111]/50 md:text-xl">BNB</span>
              <div className="w-8 h-8 bg-[#F3BA2F] rounded-full flex items-center justify-center">
                {/* Simple BNB logo interpretation */}
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L6 8l2.5 2.5L12 7l3.5 3.5L18 8l-6-6zm0 20l6-6-2.5-2.5L12 17l-3.5-3.5L6 16l6 6zm-7-7l-3-3 3-3 2.5 2.5L5 12l2.5 2.5L5 12zm14 0l3-3-3-3-2.5 2.5L19 12l-2.5 2.5L19 12zM12 9l-3 3 3 3 3-3-3-3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Sale Duration (Days) *</label>
          <input
            type="number"
            min="1"
            max="365"
            placeholder="e.g., 30"
            className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
            value={data.deadlineDays || ''}
            onChange={(e) => updateData({ deadlineDays: Number(e.target.value) })}
          />
        </div>

        <div className="mt-8 p-6 bg-[#FCFAF6] border border-[#111111]/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#111111]">Implied Token Price</h4>
            <p className="text-sm text-[#111111]/60 mt-1">
              Based on {data.publicSalePercentage}% public allocation ({publicSaleTokens.toLocaleString()} {data.symbol || 'Tokens'})
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-martian font-bold text-[#b5e315] drop-shadow-[1px_1px_0px_#111111]">
              {impliedPrice}
            </span>
            <span className="font-bold ml-2">BNB / {data.symbol || 'Token'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
