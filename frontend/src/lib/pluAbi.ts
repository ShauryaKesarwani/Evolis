import { parseAbi } from 'viem';

export const TOKEN_FACTORY_ABI = parseAbi([
  'struct Config { string name; string symbol; uint256 totalSupply; uint256 initialLiquidityPercent; uint256 unlockDuration; uint256 epochDuration; address evolisFactory; }',
  'struct DeploymentConfig { string name; string symbol; uint256 totalSupply; uint256 initialLiquidityPercent; uint256 unlockDuration; uint256 epochDuration; address evolisFactory; }',
  'struct EvolisDeploymentConfig { string tokenName; string tokenSymbol; uint256 totalSupply; uint256 bondingSupply; uint256 bondingInitialPrice; uint256 bondingSlope; uint256 fundingGoal; uint256 fundraiseDeadline; uint256 milestoneDeadline; uint256 unlockDuration; uint256 epochDuration; string lpName; string lpSymbol; }',
  'struct Deployment { address token; address controller; address pool; address owner; uint256 timestamp; uint256 totalSupply; uint256 bondingSupply; uint256 lockedTokens; }',
  'function deployTokenV2(DeploymentConfig config) external payable returns (address tokenAddr, address controllerAddr, address pairAddr)',
  'function deployEvolisSystem(EvolisDeploymentConfig config) external returns (address tokenAddr, address poolAddr, address controllerAddr)',
  'function deployToken(DeploymentConfig config) external returns (address tokenAddr, address controllerAddr, address pairAddr)',
  'function getUserDeployments(address user) external view returns (address[] memory)',
  'function getTotalDeployments() external view returns (uint256)',
  'function deploymentInfo(address token) external view returns (Deployment memory)',
  'event TokenDeployed(address indexed token, address indexed controller, address indexed owner, uint256 totalSupply)',
  'event EvolisSystemDeployed(address indexed token, address indexed pool, address indexed controller, address owner, uint256 fundingGoal, uint256 deadline)'
]);

export const LIQUIDITY_CONTROLLER_ABI = parseAbi([
  'constructor(address token, address owner, uint256 lockedTokens, uint256 unlockDuration, uint256 epochDuration, address router)',
  'function initialize(uint256 initialTokenAmount) external payable',
  'function unlockEpoch() external payable returns (uint256 tokensUnlocked)',
  'function setPair(address _pair) external',
  'function withdrawTokens(uint256 amount) external',
  'function depositInitialLiquidity(uint256 tokenAmount) external payable',
  'function manualAddLiquidity(uint256 tokenAmount) external payable',
  'function getUnlockableEpochs() external view returns (uint256)',
  'function getUnlockProgress() external view returns (uint256 epochsUnlocked, uint256 totalEpochs, uint256 tokensUnlocked, uint256 tokensRemaining)',
  'function getTimeUntilNextEpoch() external view returns (uint256)',
  'function getTokenBalance() external view returns (uint256)',
  'function epochsUnlocked() external view returns (uint256)',
  'function totalEpochs() external view returns (uint256)',
  'function unlockPerEpoch() external view returns (uint256)',
  'function lockedTokens() external view returns (uint256)',
  'function startTime() external view returns (uint256)',
  'function lastUnlockTime() external view returns (uint256)',
  'event LiquidityUnlocked(uint256 indexed epoch, uint256 tokenAmount, uint256 bnbAmount, uint256 liquidity)'
]);

export const ERC20_ABI = parseAbi([
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
]);

// EvolisPool ABI - Bonding curve fundraising
export const EVOLIS_POOL_ABI = parseAbi([
  'function buyBondingCurve(uint256 minTokensOut) external payable',
  'function refund() external',
  'function submitMilestone() external',
  'function claimMilestoneRefund() external',
  'function claimEvoLp() external',
  'function triggerEpochUnlock() external',
  'function previewBuy(uint256 bnbIn) external view returns (uint256 tokensOut, uint256 netBnb)',
  'function getCurrentPrice() external view returns (uint256)',
  'function getEscrowStatus() external view returns (uint256 totalRaised, uint256 fundingGoal, bool goalReached, bool milestoneSubmitted, uint256 deadline, uint256 milestoneDeadline)',
  'function isCircuitBreakerActive() external view returns (bool active, uint256 resumeAt)',
  'function bondingSupply() external view returns (uint256)',
  'function bondingSold() external view returns (uint256)',
  'function totalRaised() external view returns (uint256)',
  'function fundingGoal() external view returns (uint256)',
  'function bondingInitialPrice() external view returns (uint256)',
  'function bondingSlope() external view returns (uint256)',
  'function deadline() external view returns (uint256)',
  'function milestoneDeadline() external view returns (uint256)',
  'function goalReached() external view returns (bool)',
  'function milestoneSubmitted() external view returns (bool)',
  'event BondingPurchase(address indexed buyer, uint256 bnbIn, uint256 tokensOut, uint256 netFees)',
  'event FundingGoalReached(uint256 totalRaised, uint256 timestamp)',
  'event MilestoneSubmitted(uint256 timestamp)',
  'event EvoLPClaimed(address indexed user, uint256 lpAmount)'
]);

// EvolisFactory ABI - Pool creation
export const EVOLIS_FACTORY_ABI = parseAbi([
  'struct PoolConfig { string lpName; string lpSymbol; address projectToken; address projectOwner; uint256 bondingSupply; uint256 bondingInitialPrice; uint256 bondingSlope; uint256 fundingGoal; uint256 deadline; uint256 milestoneDeadline; }',
  'function createPool(PoolConfig config) external returns (address pool)',
  'function setPoolController(address pool, address controller) external',
  'function getPoolsByOwner(address owner) external view returns (address[] memory)',
  'function getPoolByToken(address token) external view returns (address)',
  'function poolCount() external view returns (uint256)',
  'function getPool(uint256 index) external view returns (address)',
  'event PoolCreated(address indexed pool, address indexed projectToken, address indexed owner, uint256 fundingGoal)'
]);
