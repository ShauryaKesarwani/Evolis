import React from 'react';
import CampaignDetailLayout from '@/components/campaign/CampaignDetailLayout';
import CampaignHeader from '@/components/campaign/CampaignHeader';
import FundingProgress from '@/components/campaign/FundingProgress';
import TokenInfoPanel from '@/components/campaign/TokenInfoPanel';
import TokenPurchasePanel from '@/components/campaign/TokenPurchasePanel';
import MilestoneTracker, { Milestone } from '@/components/campaign/MilestoneTracker';
import ProjectDescription from '@/components/campaign/ProjectDescription';
import ActivityFeed from '@/components/campaign/ActivityFeed';
import FounderActionStrip from '@/components/campaign/FounderActionStrip';

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Mock State Data
  const isOwner = true; // Toggle to false to see supporter view
  const campaignId = id || "123";

  const mockCampaign = {
    name: "zkBNB Identity Protocol",
    tagline: "Privacy-preserving KYC and verifiable credentials secured by zero-knowledge proofs on the BNB Chain. Backed by Binance Labs.",
    status: 'Active' as const,
    amountRaised: 3850,
    fundingGoal: 5000,
    daysRemaining: 14,
    description: "The zkBNB Identity Protocol is the foundational privacy layer for the BNB ecosystem. By utilizing advanced zero-knowledge rollups, we allow users to prove their identity, compliance status, and on-chain history without revealing their actual data.\n\nIncubated during the Binance Labs Season 7 Incubation Program, our technology is already being integrated into major BNB Chain DeFi protocols.\n\nFunds from this milestone campaign will be used to finalize the mainnet smart contracts, complete our tier-1 security audits, and subsidize gas for the first 100,000 user identity mints.",
    team: [
      { name: "Alexei Petrov", role: "Founder (Ex-Binance Security)" },
      { name: "Dr. Maya Lin", role: "Cryptography Lead" }
    ],
    tokensDistributed: 770000,
    supporterCount: 894,
  };

  const mockToken = {
    name: "ZK Identity Token",
    symbol: "ZKID",
    priceBNB: 0.005,
    totalSupply: 1000000000,
    allocations: [
      { label: "Public Sale", percentage: 40, color: "#b5e315" },
      { label: "Community Treasury", percentage: 35, color: "#111111" },
      { label: "Core Team", percentage: 25, color: "#FCFAF6" }
    ],
    userBalanceBNB: 12.5 // Mock user balance
  };

  const mockMilestones: Milestone[] = [
    {
      id: 1,
      description: "Testnet deployment on BNB Smart Chain and initial integration with PancakeSwap for compliance checking.",
      unlockAmountBNB: 1000,
      status: 'Released'
    },
    {
      id: 2,
      description: "Successful completion of comprehensive security audits by CertiK and Zellic.",
      unlockAmountBNB: 1500,
      status: 'Verified'
    },
    {
      id: 3,
      description: "Mainnet Beta Launch. Enable live zero-knowledge profile generation for whitelisted addresses.",
      unlockAmountBNB: 1250,
      status: 'Submitted'
    },
    {
      id: 4,
      description: "Public Mainnet Launch. Scale verifier nodes and initiate gas-subsidy program for retail users.",
      unlockAmountBNB: 1250,
      status: 'Pending'
    }
  ];

  const mockActivities = [
    { id: 1, type: 'purchase' as const, message: "wallet...1bA9 purchased 50,000 ZKID", timestamp: "10 mins ago" },
    { id: 2, type: 'milestone' as const, message: "Milestone 2 Verified by Admin", timestamp: "2 hours ago" },
    { id: 3, type: 'purchase' as const, message: "wallet...8cC2 purchased 125,000 ZKID", timestamp: "5 hours ago" },
    { id: 4, type: 'purchase' as const, message: "wallet...3xY7 purchased 10,000 ZKID", timestamp: "1 day ago" }
  ];

  return (
    <>
      <FounderActionStrip campaignId={campaignId} creatorAddress="0x98154Db8A53BB5B79BfcA75fAEeAC988B3b11891" />
      
      <CampaignDetailLayout
        sidebar={
          <TokenPurchasePanel 
            tokenSymbol={mockToken.symbol}
            tokenPriceBNB={mockToken.priceBNB}
          />
        }
      >
        <CampaignHeader 
          name={mockCampaign.name}
          tagline={mockCampaign.tagline}
          status={mockCampaign.status}
        />
        
        <FundingProgress 
          amountRaised={mockCampaign.amountRaised}
          fundingGoal={mockCampaign.fundingGoal}
          daysRemaining={mockCampaign.daysRemaining}
        />
        
        <TokenInfoPanel 
          name={mockToken.name}
          symbol={mockToken.symbol}
          priceBNB={mockToken.priceBNB}
          totalSupply={mockToken.totalSupply}
          allocations={mockToken.allocations}
        />
        
        <MilestoneTracker milestones={mockMilestones} />
        
        <ProjectDescription 
          description={mockCampaign.description}
          team={mockCampaign.team}
        />
        
        <ActivityFeed 
          supporterCount={mockCampaign.supporterCount}
          tokensDistributed={mockCampaign.tokensDistributed}
          activities={mockActivities}
        />
      </CampaignDetailLayout>
    </>
  );
}
