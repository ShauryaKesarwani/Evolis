import React from 'react';

export default function CreateCampaignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FCFAF6] py-24 px-4 font-inter text-[#111111]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-martian font-bold tracking-tight mb-4">
            Launch a Campaign
          </h1>
          <p className="text-lg text-[#111111]/70 max-w-2xl mx-auto">
            Configure and deploy your milestone-gated tokenized crowdfunding project on the BNB Chain.
          </p>
        </header>

        <main className="bg-white rounded-3xl border border-[#111111]/10 shadow-sm p-8 md:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
