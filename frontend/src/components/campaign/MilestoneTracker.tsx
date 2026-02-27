import React from 'react';

export type MilestoneStatus = 'Pending' | 'Submitted' | 'Verified' | 'Released';

export interface Milestone {
  id: number;
  description: string;
  unlockAmountBNB: number;
  status: MilestoneStatus;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
}

export default function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  const getStatusColor = (status: MilestoneStatus) => {
    switch(status) {
      case 'Released':
      case 'Verified': return 'bg-[#b5e315] border-[#111111] text-[#111111]';
      case 'Submitted': return 'bg-[#FCFAF6] border-[#111111] border-2 text-[#111111]';
      case 'Pending': return 'bg-[#FCFAF6] border-[#111111]/30 border-2 text-[#111111]/50';
      default: return 'bg-[#FCFAF6] border-[#111111]/30';
    }
  };

  const getStatusBadge = (status: MilestoneStatus) => {
    switch(status) {
      case 'Released': return <span className="bg-[#b5e315] text-[#111111] border-2 border-[#111111] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Funds Released</span>;
      case 'Verified': return <span className="bg-[#b5e315]/20 text-[#111111] border-2 border-[#b5e315] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified</span>;
      case 'Submitted': return <span className="bg-[#111111] text-[#FCFAF6] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Under Review</span>;
      case 'Pending': return <span className="bg-[#111111]/5 text-[#111111]/50 border border-[#111111]/10 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Pending</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white border-2 border-[#111111]/10 rounded-2xl p-6 lg:p-8">
      <h3 className="font-mono text-2xl font-bold text-[#111111] mb-8">Funding Milestones</h3>
      
      <div className="relative border-l-2 border-[#111111]/10 ml-4 space-y-12 pb-4">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative pl-8 md:pl-10">
            {/* Timeline Node */}
            <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold shadow-sm ${getStatusColor(milestone.status)}`}>
              {index + 1}
            </div>
            
            <div className="space-y-4 -mt-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                <h4 className="font-mono text-xl font-bold text-[#111111]">Unlock: {milestone.unlockAmountBNB} BNB</h4>
                <div>{getStatusBadge(milestone.status)}</div>
              </div>
              <p className="text-[#111111]/70 leading-relaxed font-medium text-base">
                {milestone.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
