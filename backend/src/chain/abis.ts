export const factoryAbi = [
  // Events
  'event TokenDeployed(address indexed token, address indexed controller, address indexed owner, string name, string symbol, uint256 totalSupply, uint256 initialLiquidity, uint256 lockedTokens, uint256 unlockDuration, uint256 epochDuration)',

  // Write
  'function deployTokenV2(tuple(string name, string symbol, uint256 totalSupply, uint256 initialLiquidityPercent, uint256 unlockDuration, uint256 epochDuration, address router) config) external payable returns (address tokenAddr, address controllerAddr)',

  // Read
  'function getDeployment(uint256 index) view returns (tuple(address token, address controller, address owner, uint256 timestamp, uint256 totalSupply, uint256 initialTokens, uint256 lockedTokens))',
  'function getTotalDeployments() view returns (uint256)',
  'function getUserDeployments(address user) view returns (address[])',
] as const

// Note: MilestoneEscrow ABI — kept as a placeholder for when the escrow contract is implemented.
// These functions do NOT exist in any deployed contract yet.
export const escrowAbi = [
  // Some teams implement verifyMilestone() with or without an index arg.
  'function verifyMilestone() external',
  'function verifyMilestone(uint256 milestoneIndex) external',
  'function releaseMilestoneFunds(uint256 milestoneIndex) external',

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

