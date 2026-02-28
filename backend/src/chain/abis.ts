export const factoryAbi = [
  // Events (EvolisFactory)
  'event PoolCreated(address indexed pool, address indexed projectToken, address indexed projectOwner, uint256 fundingGoal, uint256 deadline, uint256 milestoneDeadline)',

  // Write
  'function createPool(tuple(string lpName, string lpSymbol, address projectToken, address projectOwner, uint256 bondingSupply, uint256 bondingInitialPrice, uint256 bondingSlope, uint256 fundingGoal, uint256 deadline, uint256 milestoneDeadline) config) external returns (address pool)',
  'function setPoolController(address pool, address controller) external',

  // Read (EvolisFactory interface)
  'function poolCount() view returns (uint256)',
  'function getPool(uint256 index) view returns (address)',
  'function getPoolsByOwner(address owner) view returns (address[])',
  'function getPoolByToken(address token) view returns (address)',
  'function isPoolFromFactory(address pool) view returns (bool)',
  'function tokenToPool(address token) view returns (address)',
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

