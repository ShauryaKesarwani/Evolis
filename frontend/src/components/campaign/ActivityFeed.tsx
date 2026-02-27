import React from 'react';

interface Activity {
  id: number;
  type: 'purchase' | 'milestone';
  message: string;
  timestamp: string;
}

interface ActivityFeedProps {
  supporterCount: number;
  tokensDistributed: number;
  activities: Activity[];
}

export default function ActivityFeed({ supporterCount, tokensDistributed, activities }: ActivityFeedProps) {
  return (
    <div className="bg-white border-2 border-[#111111]/10 rounded-2xl p-6 lg:p-8 space-y-8">
      {/* Social Proof Stats */}
      <div className="grid grid-cols-2 gap-6 md:gap-8 pb-8 border-b-2 border-[#111111]/10">
        <div>
          <h4 className="text-xs font-bold text-[#111111]/60 uppercase tracking-widest mb-2">Supporters</h4>
          <p className="font-mono text-4xl md:text-5xl font-bold text-[#111111]">{supporterCount.toLocaleString()}</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#111111]/60 uppercase tracking-widest mb-2">Tokens Distributed</h4>
          <p className="font-mono text-4xl md:text-5xl font-bold text-[#111111]">{tokensDistributed.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h3 className="font-mono text-2xl font-bold text-[#111111] mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#FCFAF6] border border-[#111111]/5 transition-colors hover:bg-[#111111]/5">
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[#111111]/10 ${activity.type === 'purchase' ? 'bg-[#b5e315]/20' : 'bg-[#111111]/5'}`}>
                {activity.type === 'purchase' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                )}
              </div>
              <div>
                <p className="font-medium text-[#111111]/80 leading-snug">{activity.message}</p>
                <p className="text-sm text-[#111111]/40 mt-1 font-mono font-bold">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
