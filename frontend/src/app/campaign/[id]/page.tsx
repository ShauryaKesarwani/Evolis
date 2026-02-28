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
  const campaignId = id || "123";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  let projectData: any = null;
  let milestonesData: any[] = [];
  let contributorsData: any[] = [];

  try {
    const [projRes, mileRes, contRes] = await Promise.all([
      fetch(`${apiUrl}/project/${campaignId}`, { next: { revalidate: 0 } }),
      fetch(`${apiUrl}/project/${campaignId}/milestones`, { next: { revalidate: 0 } }),
      fetch(`${apiUrl}/project/${campaignId}/contributors`, { next: { revalidate: 0 } })
    ]);
    
    if (projRes.ok) projectData = (await projRes.json()).project;
    if (mileRes.ok) milestonesData = (await mileRes.json()).milestones || [];
    if (contRes.ok) contributorsData = (await contRes.json()).contributors || [];
  } catch (e) {
    console.error("Failed to fetch project details", e);
  }

  const isOwner = false; // We'll let TokenPurchasePanel or a client component handle address-based checks if needed, but for FounderActionStrip we pass creatorAddress
  const creatorAddress = projectData?.creator || "0x98154Db8A53BB5B79BfcA75fAEeAC988B3b11891";

  const raisedNum = projectData ? Number(projectData.total_raised || 0) / 1e18 : 0;
  const targetNum = projectData ? Number(projectData.funding_goal || 0) / 1e18 : 5000;
  const daysRemaining = projectData?.deadline 
    ? Math.max(0, Math.ceil((projectData.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
    : 14;

  const campaign = {
    name: projectData ? `Project #${projectData.id}` : "zkBNB Identity Protocol",
    tagline: "A decentralized milestone-based funding project built on BNB Chain.",
    status: (projectData?.status || 'Active') as any,
    amountRaised: raisedNum,
    fundingGoal: targetNum,
    daysRemaining,
    description: "The zkBNB Identity Protocol is the foundational privacy layer for the BNB ecosystem. By utilizing advanced zero-knowledge rollups, we allow users to prove their identity, compliance status, and on-chain history without revealing their actual data.\n\nIncubated during the Binance Labs Season 7 Incubation Program, our technology is already being integrated into major BNB Chain DeFi protocols.\n\nFunds from this milestone campaign will be used to finalize the mainnet smart contracts, complete our tier-1 security audits, and subsidize gas for the first 100,000 user identity mints.",
    team: [
      { name: "Creator", role: creatorAddress }
    ],
    tokensDistributed: raisedNum * 100,
    supporterCount: contributorsData.length,
  };

  const token = {
    name: projectData?.token_address ? `Token ${projectData.token_address.slice(0, 6)}` : "ZKID",
    symbol: "TKN",
    priceBNB: 0.005,
    totalSupply: 1000000000,
    allocations: [
      { label: "Public Sale", percentage: 40, color: "#b5e315" },
      { label: "Community Treasury", percentage: 35, color: "#111111" },
      { label: "Core Team", percentage: 25, color: "#FCFAF6" }
    ],
    userBalanceBNB: 0
  };

  const mappedMilestones: Milestone[] = milestonesData.map((m: any) => {
    let status = 'Pending';
    if (m.released === 1) status = 'Released';
    else if (m.verified === 1) status = 'Verified';
    else if (m.description.includes('Submitted')) status = 'Submitted';

    return {
      id: m.id,
      description: m.description,
      unlockAmountBNB: Number(m.unlock_amount) / 1e18,
      status: status as any
    };
  });

  const displayMilestones = mappedMilestones.length > 0 ? mappedMilestones : [
    { id: 1, description: "Initial Deployment", unlockAmountBNB: targetNum * 0.2, status: 'Pending' as const }
  ];

  const activities = contributorsData.map((c: any, index: number) => ({
    id: index,
    type: 'purchase' as const,
    message: `${c.contributor.slice(0, 6)}...${c.contributor.slice(-4)} contributed`,
    timestamp: "Recently"
  }));

  return (
    <>
      <FounderActionStrip campaignId={campaignId} creatorAddress={creatorAddress} />
      
      <CampaignDetailLayout
        sidebar={
          <TokenPurchasePanel 
            tokenSymbol={token.symbol}
            tokenPriceBNB={token.priceBNB}
          />
        }
      >
        <CampaignHeader 
          name={campaign.name}
          tagline={campaign.tagline}
          status={campaign.status}
        />
        
        <FundingProgress 
          amountRaised={campaign.amountRaised}
          fundingGoal={campaign.fundingGoal}
          daysRemaining={campaign.daysRemaining}
        />
        
        <TokenInfoPanel 
          name={token.name}
          symbol={token.symbol}
          priceBNB={token.priceBNB}
          totalSupply={token.totalSupply}
          allocations={token.allocations}
        />
        
        <MilestoneTracker milestones={displayMilestones} />
        
        <ProjectDescription 
          description={campaign.description}
          team={campaign.team}
        />
        
        <ActivityFeed 
          supporterCount={campaign.supporterCount}
          tokensDistributed={campaign.tokensDistributed}
          activities={activities}
        />
      </CampaignDetailLayout>
    </>
  );
}
