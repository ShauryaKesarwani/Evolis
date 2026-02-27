import React from 'react';

interface ProjectDescriptionProps {
  description: string;
  team: { name: string; role: string; linkedin?: string }[];
}

export default function ProjectDescription({ description, team }: ProjectDescriptionProps) {
  return (
    <div className="bg-white border-2 border-[#111111]/10 rounded-2xl p-6 lg:p-8 space-y-8">
      <div>
        <h3 className="font-mono text-2xl font-bold text-[#111111] mb-6">About the Project</h3>
        <div className="prose prose-lg text-[#111111]/80 max-w-none leading-relaxed font-medium">
          {description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
          ))}
        </div>
      </div>
      
      <div className="pt-8 border-t-2 border-[#111111]/10">
        <h3 className="font-mono text-xl font-bold text-[#111111] mb-6">Core Team</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.map((member, i) => (
            <div key={i} className="flex items-center gap-4 bg-[#FCFAF6] p-4 rounded-xl border-2 border-[#111111]/5">
              <div className="w-12 h-12 rounded-full bg-[#111111]/5 border border-[#111111]/10 flex items-center justify-center font-mono font-bold text-[#111111]/50 text-xl shrink-0">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-[#111111] text-lg">{member.name}</p>
                <p className="text-sm text-[#111111]/70 font-bold uppercase tracking-wider mt-0.5">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
