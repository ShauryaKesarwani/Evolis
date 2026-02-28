import { parseAbi } from 'viem';

// EvolisFactory ABI - creates pools for existing tokens
export const factoryAbi = parseAbi([
  'struct PoolConfig { string lpName; string lpSymbol; address projectToken; address projectOwner; uint256 bondingSupply; uint256 bondingInitialPrice; uint256 bondingSlope; uint256 fundingGoal; uint256 deadline; uint256 milestoneDeadline; }',
  'function createPool(PoolConfig config) external returns (address pool)',
  'function setPoolController(address pool, address controller) external'
]);

// Token contract ABI - for deploying new tokens
export const tokenAbi = parseAbi([
  'constructor(string name, string symbol, uint256 totalSupply, address recipient)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)'
]);

// LiquidityController ABI - for managing token unlocks
export const controllerAbi = parseAbi([
  'constructor(address token, address owner, uint256 lockedTokens, uint256 unlockDuration, uint256 epochDuration, address router)'
]);
