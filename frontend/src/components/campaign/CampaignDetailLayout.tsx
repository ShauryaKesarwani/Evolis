import React, { ReactNode } from 'react';

interface CampaignDetailLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function CampaignDetailLayout({ children, sidebar }: CampaignDetailLayoutProps) {
  return (
    <div className="bg-[#FCFAF6] min-h-screen text-[#111111] font-sans">
      <div className="max-w-6xl mx-auto pt-36 pb-12 px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content Column */}
          <div className="w-full lg:flex-1 space-y-8 overflow-hidden">
            {children}
          </div>
          
          {/* Sticky Sidebar Column */}
          <div className="w-full lg:w-[400px] lg:sticky lg:top-36 shrink-0">
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
}
