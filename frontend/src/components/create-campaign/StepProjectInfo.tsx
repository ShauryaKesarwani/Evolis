import React from 'react';
import { CampaignData } from './types';

interface StepProjectInfoProps {
  data: CampaignData;
  updateData: (fields: Partial<CampaignData>) => void;
}

export default function StepProjectInfo({ data, updateData }: StepProjectInfoProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-martian font-bold mb-2">Project Information</h2>
        <p className="text-[#111111]/70 mb-6">Tell us about your project. This will be visible on your public campaign page.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Project Name *</label>
          <input
            type="text"
            placeholder="e.g., BlockChain Innovators"
            className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Tagline / Description *</label>
          <textarea
            rows={4}
            placeholder="Describe your project in a few sentences..."
            className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors resize-none"
            value={data.tagline}
            onChange={(e) => updateData({ tagline: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Logo URL *</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
              value={data.logoUrl}
              onChange={(e) => updateData({ logoUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Website URL *</label>
            <input
              type="url"
              placeholder="https://example.com"
              className="w-full bg-[#FCFAF6] border-2 border-[#111111]/10 rounded-xl px-4 py-3 placeholder-[#111111]/30 focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
              value={data.websiteUrl}
              onChange={(e) => updateData({ websiteUrl: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
