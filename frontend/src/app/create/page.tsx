'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { parseEther } from 'viem';
import { factoryAbi } from '@/chain/abis';
import CreateCampaignLayout from '@/components/create-campaign/CreateCampaignLayout';
import StepIndicator from '@/components/create-campaign/StepIndicator';
import StepProjectInfo from '@/components/create-campaign/StepProjectInfo';
import StepTokenConfig from '@/components/create-campaign/StepTokenConfig';
import StepFundingGoal from '@/components/create-campaign/StepFundingGoal';
import StepMilestones from '@/components/create-campaign/StepMilestones';
import StepReviewDeploy from '@/components/create-campaign/StepReviewDeploy';
import { CampaignData, initialCampaignData } from '@/components/create-campaign/types';

const TEST_DATA_OPTIONS: CampaignData[] = [
  {
    name: 'Echo Test Project',
    tagline: 'A revolutionized way to test decentralized applications quickly and automatically.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=ECHO',
    websiteUrl: 'https://echo-testing.dev',
    tokenName: 'Echo Test Token',
    symbol: 'ECHO',
    totalSupply: 1000000000,
    publicSalePercentage: 50,
    teamPercentage: 20,
    treasuryPercentage: 30,
    fundingGoal: 1000,
    deadlineDays: 45,
    unlockDurationDays: 30,
    epochDurationDays: 1,
  },
  {
    name: 'Nebula Gaming',
    tagline: 'The next generation Web3 gaming platform with sustainable tokenomics.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=NBG',
    websiteUrl: 'https://nebula-gaming.io',
    tokenName: 'Nebula Gold',
    symbol: 'NBG',
    totalSupply: 10000000000,
    publicSalePercentage: 40,
    teamPercentage: 25,
    treasuryPercentage: 35,
    fundingGoal: 2500,
    deadlineDays: 60,
    unlockDurationDays: 90,
    epochDurationDays: 7,
  },
  {
    name: 'GreenEarth Defi',
    tagline: 'Regenerative finance protocol empowering carbon offset projects worldwide.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=GED',
    websiteUrl: 'https://greenearth.finance',
    tokenName: 'Earth Token',
    symbol: 'EARTH',
    totalSupply: 100000000,
    publicSalePercentage: 30,
    teamPercentage: 15,
    treasuryPercentage: 55,
    fundingGoal: 5000,
    deadlineDays: 30,
    unlockDurationDays: 180,
    epochDurationDays: 14,
  },
  {
    name: 'Quantum Oracle',
    tagline: 'Lightning-fast decentralized data feeds for the BNB chain ecosystem.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=QO',
    websiteUrl: 'https://quantum-oracle.network',
    tokenName: 'Quantum Node',
    symbol: 'QN',
    totalSupply: 1000000000,
    publicSalePercentage: 60,
    teamPercentage: 20,
    treasuryPercentage: 20,
    fundingGoal: 1500,
    deadlineDays: 14,
    unlockDurationDays: 60,
    epochDurationDays: 3,
  },
  {
    name: 'Liquid Staked Yield',
    tagline: 'Maximize your staking returns with our automated yield compounding protocol.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=LSY',
    websiteUrl: 'https://lsy.finance',
    tokenName: 'Yield Token',
    symbol: 'YLD',
    totalSupply: 1000000000,
    publicSalePercentage: 45,
    teamPercentage: 15,
    treasuryPercentage: 40,
    fundingGoal: 2000,
    deadlineDays: 21,
    unlockDurationDays: 120,
    epochDurationDays: 7,
  },
  {
    name: 'ArtBlock NFT Marketplace',
    tagline: 'The premier destination for generative art and digital collectibles on BNB.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=ART',
    websiteUrl: 'https://artblock.market',
    tokenName: 'ArtBlock Coin',
    symbol: 'ARTB',
    totalSupply: 3000000000,
    publicSalePercentage: 35,
    teamPercentage: 20,
    treasuryPercentage: 45,
    fundingGoal: 500,
    deadlineDays: 30,
    unlockDurationDays: 365,
    epochDurationDays: 30,
  },
  {
    name: 'DeSci Innovation Lab',
    tagline: 'Funding breakthrough scientific research through decentralized communities.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=LAB',
    websiteUrl: 'https://desci-lab.org',
    tokenName: 'Science Token',
    symbol: 'SCI',
    totalSupply: 21000000,
    publicSalePercentage: 70,
    teamPercentage: 10,
    treasuryPercentage: 20,
    fundingGoal: 10000,
    deadlineDays: 90,
    unlockDurationDays: 730,
    epochDurationDays: 90,
  },
  {
    name: 'Metaverse Real Estate',
    tagline: 'Fractional ownership of premium virtual land across multiple metaverses.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=MRE',
    websiteUrl: 'https://meta-estate.io',
    tokenName: 'Meta Land',
    symbol: 'LAND',
    totalSupply: 100000,
    publicSalePercentage: 55,
    teamPercentage: 25,
    treasuryPercentage: 20,
    fundingGoal: 4000,
    deadlineDays: 60,
    unlockDurationDays: 180,
    epochDurationDays: 14,
  },
  {
    name: 'Crypto Education Hub',
    tagline: 'Learn Web3 development and earn tokens while you build your portfolio.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=EDU',
    websiteUrl: 'https://crypto-edu.academy',
    tokenName: 'Learn Token',
    symbol: 'LRN',
    totalSupply: 1000000000,
    publicSalePercentage: 25,
    teamPercentage: 15,
    treasuryPercentage: 60,
    fundingGoal: 800,
    deadlineDays: 30,
    unlockDurationDays: 30,
    epochDurationDays: 1,
  },
  {
    name: 'Decentralized Social',
    tagline: 'A censorship-resistant social network where users own their data and audience.',
    logoUrl: 'https://placehold.co/400x400/111111/FCFAF6/png?text=DSOC',
    websiteUrl: 'https://dsocial.network',
    tokenName: 'Social Graph Token',
    symbol: 'SGT',
    totalSupply: 100000000000,
    publicSalePercentage: 50,
    teamPercentage: 20,
    treasuryPercentage: 30,
    fundingGoal: 3000,
    deadlineDays: 45,
    unlockDurationDays: 90,
    epochDurationDays: 7,
  }
];

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
  const { isConnected, chainId, address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  const navRouter = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWalletConnected = mounted && isConnected;

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

  const { writeContractAsync } = useWriteContract();

  const handleDeploy = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_FACTORY_ADDRESS) {
        alert("Factory address not configured.");
        return;
      }
      
      const totalSupplyWei = BigInt(data.totalSupply) * (BigInt(10) ** BigInt(18));
      const initialLiquidityPercent = BigInt(data.publicSalePercentage || 50); 
      const unlockDuration = BigInt(data.unlockDurationDays || 30) * BigInt(24 * 60 * 60);
      const epochDuration = BigInt(data.epochDurationDays || 1) * BigInt(24 * 60 * 60);
      // Fallback router if pluConfig fails to load
      const router = process.env.NEXT_PUBLIC_PANCAKE_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E';

      // Switch chain before deploying if needed
      if (chainId !== bscTestnet.id) {
        if (!switchChainAsync) {
          alert("Your wallet doesn't support switching chains automatically. Please switch to BNB Smart Chain Testnet manually.");
          return;
        }
        try {
          await switchChainAsync({ chainId: bscTestnet.id });
          // Wait a moment for Wagmi's internal provider to reflect the new chain
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error: any) {
          console.error('Failed to switch chain:', error);
          alert('You must switch your wallet to BNB Smart Chain Testnet to deploy.');
          return;
        }
      }

      const txHash = await writeContractAsync({
        abi: factoryAbi,
        address: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
        functionName: 'deployTokenV2',
        chainId: bscTestnet.id,
        args: [{
          name: data.tokenName,
          symbol: data.symbol,
          totalSupply: totalSupplyWei,
          initialLiquidityPercent,
          unlockDuration,
          epochDuration,
          router: router as `0x${string}`
        }],
        // Bug Fix: We shouldn't charge the creator their own funding goal!
        // The contract currently expects some msg.value to seed the initial PancakeSwap pool.
        // For testing, we send a nominal amount (0.001 BNB) instead of the whole funding goal.
        value: parseEther('0.001')
      });
      
      console.log('Deployed Tx:', txHash);
      alert(`Campaign deployed successfully! Transaction Hash: ${txHash}`);
      
      // Save campaign metadata to backend
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        await fetch(`${apiUrl}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name || data.tokenName,
            creator: address || '',
            tagline: data.tagline,
            logoUrl: data.logoUrl,
            websiteUrl: data.websiteUrl,
            symbol: data.symbol,
            category: 'DeFi',
            fundingGoal: data.fundingGoal,
          }),
        });
      } catch (e) {
        console.warn('Failed to save campaign metadata:', e);
      }
      
      // Delay slightly so the backend indexer can pick up the deployment
      setTimeout(() => {
        navRouter.push('/');
      }, 4000);
      
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('Deployment failed. See console for details.');
    }
  };

  const handleConnectWallet = () => {
    // This is handled by the global connect wallet modal via Navbar, 
    // or we can prompt them to click the navbar button
    alert('Please click "Connect Wallet" in the Navigation Bar to sign transactions or connect your wallet.');
  };

  const handleFillTestData = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number(e.target.value);
    if (index >= 0 && index < TEST_DATA_OPTIONS.length) {
      setData(TEST_DATA_OPTIONS[index]);
    }
  };

  return (
    <CreateCampaignLayout>
      <div className="flex justify-end mb-4">
        <select
          onChange={handleFillTestData}
          title="Select Demo Data"
          className="text-xs font-bold px-3 py-1.5 bg-[#111111]/5 hover:bg-[#111111]/10 text-[#111111]/60 focus:text-[#111111] hover:text-[#111111] rounded uppercase tracking-wider transition-colors outline-none cursor-pointer border-none appearance-none pr-8 relative"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.7rem top 50%',
            backgroundSize: '0.65rem auto',
          }}
        >
          <option value="-1">Fast-Fill Demo Data...</option>
          {TEST_DATA_OPTIONS.map((option, idx) => (
            <option key={idx} value={idx}>
              {idx + 1}. {option.name}
            </option>
          ))}
        </select>
      </div>
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
