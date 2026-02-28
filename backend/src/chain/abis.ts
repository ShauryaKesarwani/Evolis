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

// EvolisPool ABI - The pool contract IS also the escrow
export const poolAbi = [
  // Read functions
  'function projectToken() view returns (address)',
  'function projectOwner() view returns (address)',
  'function controller() view returns (address)',
  'function fundingGoal() view returns (uint256)',
  'function deadline() view returns (uint256)',
  'function milestoneDeadline() view returns (uint256)',
  'function totalRaised() view returns (uint256)',
  'function goalReached() view returns (bool)',
  'function milestoneAchieved() view returns (bool)',
  'function contributions(address) view returns (uint256)',
  'function bondingSupply() view returns (uint256)',
  'function tokensSoldInCurve() view returns (uint256)',
  
  // Write functions
  'function buyBondingCurve(uint256 minTokensOut) payable external',
  'function refund() external',
  'function submitMilestone() external',
  'function claimMilestoneRefund() external',
  'function claimEvoLp() external',
  'function triggerEpochUnlock() external',
] as const

// Legacy: escrowAbi kept for backward compatibility (EvolisPool acts as escrow)
export const escrowAbi = [
  // EvolisPool milestone functions
  'function submitMilestone() external',
  'function claimMilestoneRefund() external',

  // Optional reads (match EvolisPool interface)
  'function projectToken() view returns (address)',
  'function projectOwner() view returns (address)',
  'function fundingGoal() view returns (uint256)',
  'function totalRaised() view returns (uint256)',
  'function deadline() view returns (uint256)',
  'function goalReached() view returns (bool)',
  'function milestoneAchieved() view returns (bool)',
  'function milestoneDeadline() view returns (uint256)',
] as const

