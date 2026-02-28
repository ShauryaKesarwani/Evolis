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
import LiquidityDashboard from '@/components/plu/LiquidityDashboard';

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
  
  let daysRemaining = 14;
  if (projectData?.deadline) {
    const deadlineNum = Number(projectData.deadline);
    if (deadlineNum > 4102444800) { // Year 2100 limit, prevents extreme numbers
      daysRemaining = 14;
    } else {
      daysRemaining = Math.max(0, Math.ceil((deadlineNum * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));
    }
  }

  const campaign = {
    name: projectData?.name || `Project #${projectData?.id ?? campaignId}`,
    tagline: projectData?.tagline || "A decentralized milestone-based funding project built on BNB Chain.",
    status: (projectData?.status || 'Active') as any,
    amountRaised: raisedNum,
    fundingGoal: targetNum,
    daysRemaining,
    description: projectData?.tagline
      ? `${projectData.tagline}\n\nThis project is built on BNB Chain with milestone-based funding and progressive liquidity unlocks. Funds are released as verified milestones are completed, ensuring accountability and transparency for all contributors.`
      : "A decentralized milestone-based funding project built on BNB Chain. Funds are released as verified milestones are completed, ensuring accountability and transparency for all contributors.",
    team: [
      { name: "Creator", role: creatorAddress }
    ],
    tokensDistributed: raisedNum * 100,
    supporterCount: contributorsData.length,
  };

  const token = {
    name: projectData?.name || (projectData?.token_address ? `Token ${projectData.token_address.slice(0, 6)}` : "Token"),
    symbol: projectData?.symbol || "TKN",
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
        
        {projectData?.controller_address ? (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-martian text-2xl font-bold mb-6 uppercase tracking-tight">Liquidity Dashboard</h2>
            <LiquidityDashboard controllerAddress={projectData.controller_address} />
          </div>
        ) : (
          <MilestoneTracker milestones={displayMilestones} />
        )}
        
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
