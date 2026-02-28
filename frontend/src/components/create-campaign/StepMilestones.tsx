import React from 'react';
import { CampaignData } from './types';

interface StepMilestonesProps {
  data: CampaignData;
  updateData: (fields: Partial<CampaignData>) => void;
}

export default function StepMilestones({ data, updateData }: StepMilestonesProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-martian font-bold mb-2">Liquidity Unlock Schedule</h2>
        <p className="text-[#111111]/70 mb-6">
          Define the parameters for your Progressive Liquidity Unlock (PLU). Funds will be unlocked linearly and paired with your token sequentially to reduce chart volatility.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-[#111111]/10 p-6 shadow-sm hover:border-[#b5e315] hover:shadow-[4px_4px_0px_#b5e315] transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Total Unlock Duration (days) *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g., 30"
                className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                value={data.unlockDurationDays || ''}
                onChange={(e) => updateData({ unlockDurationDays: Number(e.target.value) })}
              />
              <p className="text-xs text-[#111111]/50 mt-2">The total timeframe over which liquidity is fully injected.</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Epoch Duration (days) *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g., 1"
                className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                value={data.epochDurationDays || ''}
                onChange={(e) => updateData({ epochDurationDays: Number(e.target.value) })}
              />
              <p className="text-xs text-[#111111]/50 mt-2">Time between each progressive liquidity unlock.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#FCFAF6] border border-[#111111]/10 p-5 rounded-xl mt-6">
          <p className="text-sm text-[#111111]/70">
            <strong>Simulation:</strong> With these settings, there will be a total of <span className="font-bold text-[#111111] bg-[#b5e315]/30 px-1 rounded">{Math.floor(data.unlockDurationDays / (data.epochDurationDays || 1))} unlocks</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
