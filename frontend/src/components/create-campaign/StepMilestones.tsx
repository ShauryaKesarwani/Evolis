import React from 'react';
import { CampaignData, Milestone } from './types';

interface StepMilestonesProps {
  data: CampaignData;
  updateData: (fields: Partial<CampaignData>) => void;
}

export default function StepMilestones({ data, updateData }: StepMilestonesProps) {
  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      description: '',
      unlockAmount: 0,
    };
    updateData({ milestones: [...data.milestones, newMilestone] });
  };

  const handleUpdateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const newMilestones = [...data.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    updateData({ milestones: newMilestones });
  };

  const handleRemoveMilestone = (index: number) => {
    if (data.milestones.length <= 1) return; // Require at least one milestone
    const newMilestones = data.milestones.filter((_, i) => i !== index);
    updateData({ milestones: newMilestones });
  };

  const totalUnlockAmount = data.milestones.reduce((sum, m) => sum + (Number(m.unlockAmount) || 0), 0);
  const isValidTally = totalUnlockAmount === data.fundingGoal;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-martian font-bold mb-2">Milestones</h2>
        <p className="text-[#111111]/70 mb-6">
          Define the phases of your project. Funds are unlocked progressively as milestones are completed. Total unlocks must equal your funding goal.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-[#FCFAF6] border border-[#111111]/10 rounded-2xl mb-6">
        <div>
          <span className="text-sm font-bold block mb-1">Funding Goal</span>
          <span className="text-xl font-martian font-bold">{data.fundingGoal || 0} BNB</span>
        </div>
        <div className="hidden md:block text-[#111111]/30 text-2xl">=</div>
        <div className="mt-4 md:mt-0">
          <span className="text-sm font-bold block mb-1">Milestones Total</span>
          <span className={`text-xl font-martian font-bold ${isValidTally ? 'text-green-600' : 'text-red-500'}`}>
            {totalUnlockAmount} BNB
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {data.milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative bg-white rounded-2xl border border-[#111111]/10 p-6 shadow-sm transition-all hover:border-[#111111]/30">
            <div className="absolute top-4 right-4 max-w-[200px]">
              {data.milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(index)}
                  className="text-red-500 hover:text-red-700 bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  aria-label="Remove milestone"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <h4 className="font-bold text-lg mb-4">Phase {index + 1}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Description *</label>
                <input
                  type="text"
                  placeholder="e.g., Mainnet Launch and Audit"
                  className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                  value={milestone.description}
                  onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Unlock (BNB) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 100"
                  className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                  value={milestone.unlockAmount || ''}
                  onChange={(e) => handleUpdateMilestone(index, 'unlockAmount', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddMilestone}
        className="w-full py-4 border-2 border-dashed border-[#111111]/20 rounded-2xl text-[#111111]/60 font-bold hover:border-[#111111] hover:text-[#111111] hover:bg-[#FCFAF6] transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Milestone Phase
      </button>
    </div>
  );
}
