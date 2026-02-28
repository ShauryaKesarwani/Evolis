import React from 'react';
import { CampaignData } from './types';

interface StepReviewDeployProps {
  data: CampaignData;
  isWalletConnected: boolean;
  onDeploy: () => void;
  onConnectWallet: () => void;
}

export default function StepReviewDeploy({ data, isWalletConnected, onDeploy, onConnectWallet }: StepReviewDeployProps) {
  const isDataValid = 
    data.name && data.symbol && data.totalSupply > 0 && 
    data.fundingGoal > 0 && data.unlockDurationDays > 0 && data.epochDurationDays > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-martian font-bold mb-2">Review & Deploy</h2>
        <p className="text-[#111111]/70 mb-6">Verify your campaign details before deploying the smart contracts to the BNB Chain.</p>
      </div>

      <div className="bg-[#FCFAF6] border border-[#111111]/10 rounded-2xl p-6 md:p-8 space-y-8 hover:border-[#b5e315] hover:shadow-[4px_4px_0px_#b5e315] transition-all duration-300">
        
        {/* Project Section */}
        <section>
          <h3 className="text-sm font-bold text-[#111111]/50 uppercase tracking-wider mb-4 border-b border-[#111111]/10 pb-2">Project Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <span className="block text-sm text-[#111111]/60 mb-1">Name</span>
              <span className="font-bold">{data.name || '-'}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-sm text-[#111111]/60 mb-1">Website</span>
              <span className="font-bold truncate">{data.websiteUrl || '-'}</span>
            </div>
            <div className="col-span-4 mt-2">
              <span className="block text-sm text-[#111111]/60 mb-1">Tagline</span>
              <span className="font-medium text-[#111111]/80">{data.tagline || '-'}</span>
            </div>
          </div>
        </section>

        {/* Token Section */}
        <section>
          <h3 className="text-sm font-bold text-[#111111]/50 uppercase tracking-wider mb-4 border-b border-[#111111]/10 pb-2">Tokenomics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="block text-sm text-[#111111]/60 mb-1">Token</span>
              <span className="font-bold">{data.tokenName || '-'}</span>
            </div>
            <div>
              <span className="block text-sm text-[#111111]/60 mb-1">Symbol</span>
              <span className="font-bold border border-[#111111]/20 rounded px-2 py-0.5 bg-white">{data.symbol || '-'}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-sm text-[#111111]/60 mb-1">Total Supply</span>
              <span className="font-bold">{data.totalSupply?.toLocaleString() || '-'}</span>
            </div>
          </div>
        </section>

        {/* Funding Section */}
        <section>
          <h3 className="text-sm font-bold text-[#111111]/50 uppercase tracking-wider mb-4 border-b border-[#111111]/10 pb-2">Funding Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <span className="block text-sm text-[#111111]/60 mb-1">Funding Goal</span>
              <span className="font-martian font-bold text-xl text-[#b5e315] drop-shadow-[1px_1px_0px_#111111]">{data.fundingGoal || 0} BNB</span>
            </div>
            <div className="col-span-2">
              <span className="block text-sm text-[#111111]/60 mb-1">Campaign Duration</span>
              <span className="font-bold">{data.deadlineDays || 0} Days</span>
            </div>
          </div>
        </section>

        {/* Liquidity Schedule Section */}
        <section>
          <h3 className="text-sm font-bold text-[#111111]/50 uppercase tracking-wider mb-4 border-b border-[#111111]/10 pb-2">Liquidity Unlock Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-[#111111]/60 mb-1">Total Unlock Time</span>
              <span className="font-bold">{data.unlockDurationDays || 0} Days</span>
            </div>
            <div>
               <span className="block text-sm text-[#111111]/60 mb-1">Epoch Frequency</span>
               <span className="font-bold">Every {data.epochDurationDays || 0} Days</span>
            </div>
          </div>
        </section>
      </div>

      {!isDataValid && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          Please go back and ensure all required fields are filled out.
        </div>
      )}

      <div className="pt-6">
        {isWalletConnected ? (
          <button
            type="button"
            disabled={!isDataValid}
            onClick={onDeploy}
            className={`w-full py-5 rounded-2xl font-martian font-bold text-lg md:text-xl transition-all ${
              isDataValid 
                ? 'bg-[#b5e315] text-[#111111] border-2 border-[#111111] hover:-translate-y-1 shadow-[4px_4px_0px_#111111]' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Deploy Smart Contracts
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnectWallet}
            className="w-full py-5 rounded-2xl font-martian font-bold text-lg md:text-xl bg-[#111111] text-white border-2 border-[#111111] hover:-translate-y-1 shadow-[4px_4px_0px_#b5e315] transition-all"
          >
            Connect Wallet to Deploy
          </button>
        )}
      </div>
    </div>
  );
}
