'use client';

import React, { useState } from 'react';
import CreateCampaignLayout from '@/components/create-campaign/CreateCampaignLayout';
import StepIndicator from '@/components/create-campaign/StepIndicator';
import StepProjectInfo from '@/components/create-campaign/StepProjectInfo';
import StepTokenConfig from '@/components/create-campaign/StepTokenConfig';
import StepFundingGoal from '@/components/create-campaign/StepFundingGoal';
import StepMilestones from '@/components/create-campaign/StepMilestones';
import StepReviewDeploy from '@/components/create-campaign/StepReviewDeploy';
import { CampaignData, initialCampaignData } from '@/components/create-campaign/types';

const STEP_NAMES = [
  'Project',
  'Token Configuration',
  'Funding Goal',
  'Milestones',
  'Review & Deploy'
];

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<CampaignData>(initialCampaignData);
  const [isWalletConnected, setIsWalletConnected] = useState(false); // Mock state for now

  const updateData = (fields: Partial<CampaignData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < STEP_NAMES.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeploy = () => {
    console.log('Deploying with data:', data);
    alert('Mock Deploy: Smart Contracts would be deployed here!');
  };

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
    alert('Mock Wallet Connection Successful');
  };

  return (
    <CreateCampaignLayout>
      <StepIndicator 
        currentStep={currentStep} 
        totalSteps={STEP_NAMES.length} 
        stepNames={STEP_NAMES} 
      />

      <div className="mt-12 min-h-[400px]">
        {currentStep === 0 && (
          <StepProjectInfo data={data} updateData={updateData} />
        )}
        {currentStep === 1 && (
          <StepTokenConfig data={data} updateData={updateData} />
        )}
        {currentStep === 2 && (
          <StepFundingGoal data={data} updateData={updateData} />
        )}
        {currentStep === 3 && (
          <StepMilestones data={data} updateData={updateData} />
        )}
        {currentStep === 4 && (
          <StepReviewDeploy 
            data={data} 
            isWalletConnected={isWalletConnected}
            onDeploy={handleDeploy}
            onConnectWallet={handleConnectWallet}
          />
        )}
      </div>

      {/* Navigation Footer (hidden on last step as it has its own deploy button) */}
      {currentStep < 4 && (
        <div className="mt-12 pt-8 border-t border-[#111111]/10 flex justify-between items-center gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentStep === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'text-[#111111] border-2 border-[#111111]/20 hover:border-[#111111] hover:bg-[#FCFAF6]'
            }`}
          >
            ← Back
          </button>
          
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-[#111111] text-[#FCFAF6] rounded-xl font-bold border-2 border-[#111111] hover:-translate-y-1 shadow-[4px_4px_0px_#b5e315] transition-all flex items-center gap-2"
          >
            Next Step →
          </button>
        </div>
      )}
      
      {currentStep === 4 && (
        <div className="mt-8 pt-8 border-t border-[#111111]/10">
          <button
            onClick={handleBack}
            className="text-[#111111]/60 font-bold hover:text-[#111111] transition-colors flex items-center gap-2"
          >
            ← Back to Edit
          </button>
        </div>
      )}
    </CreateCampaignLayout>
  );
}
