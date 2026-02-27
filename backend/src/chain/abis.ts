export const factoryAbi = [
  'event ProjectCreated(uint256 projectId, address token, address escrow)',
  'function getProject(uint256 id) view returns (tuple(address token,address escrow,address creator,uint256 fundingGoal,uint256 deadline,bool goalReached,bool finalized))',
] as const

export const escrowAbi = [
  // Some teams implement verifyMilestone() with or without an index arg.
  'function verifyMilestone() external',
  'function verifyMilestone(uint256 milestoneIndex) external',

  // Optional reads (useful for future syncing)
  'function token() view returns (address)',
  'function creator() view returns (address)',
  'function fundingGoal() view returns (uint256)',
  'function totalRaised() view returns (uint256)',
  'function deadline() view returns (uint256)',
  'function goalReached() view returns (bool)',

  // If milestones is public array, solidity generates a getter.
  // (string description,uint256 unlockAmount,bool verified,bool fundsReleased)
  'function milestones(uint256) view returns (string,uint256,bool,bool)',
  'function currentMilestone() view returns (uint256)',
] as const
