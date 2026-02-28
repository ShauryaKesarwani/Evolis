export interface Milestone {
  id: string;
  description: string;
  unlockAmount: number;
}

export interface CampaignData {
  // Step 1
  name: string;
  tagline: string;
  logoUrl: string;
  websiteUrl: string;

  // Step 2
  tokenName: string;
  symbol: string;
  totalSupply: number;
  publicSalePercentage: number;
  teamPercentage: number;
  treasuryPercentage: number;

  // Step 3
  fundingGoal: number;
  deadlineDays: number;

  // Step 4
  unlockDurationDays: number;
  epochDurationDays: number;
}

export const initialCampaignData: CampaignData = {
  name: '',
  tagline: '',
  logoUrl: '',
  websiteUrl: '',
  tokenName: '',
  symbol: '',
  totalSupply: 0,
  publicSalePercentage: 50,
  teamPercentage: 20,
  treasuryPercentage: 30,
  fundingGoal: 0,
  deadlineDays: 30,
  unlockDurationDays: 30,
  epochDurationDays: 1,
};
