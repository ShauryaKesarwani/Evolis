import { parseAbi } from 'viem';

export const TOKEN_FACTORY_ABI = parseAbi([
  'struct Config { string name; string symbol; uint256 totalSupply; uint256 initialLiquidityPercent; uint256 unlockDuration; uint256 epochDuration; address router; }',
  'function deployTokenV2(Config config) external payable returns (address tokenAddr, address controllerAddr)',
  'function getUserDeployments(address user) external view returns (address[])',
  'function deploymentInfo(address token) external view returns (address owner, address controller, address router, uint256 timestamp, uint256 totalSupply, uint256 initialTokens, uint256 lockedTokens)',
  'event TokenDeployed(address indexed token, address indexed controller, address indexed owner, string name, string symbol, uint256 totalSupply, uint256 initialLiquidity, uint256 lockedTokens, uint256 unlockDuration, uint256 epochDuration)'
]);

export const LIQUIDITY_CONTROLLER_ABI = parseAbi([
  'function getUnlockProgress() external view returns (uint256 epochsUnlocked, uint256 totalEpochs, uint256 tokensUnlocked, uint256 tokensRemaining)',
  'function getTokenBalance() external view returns (uint256)',
  'function getUnlockableEpochs() external view returns (uint256)',
  'function getTimeUntilNextEpoch() external view returns (uint256)',
  'function unlockEpoch() external payable',
  'function manualAddLiquidity(uint256 tokenAmount) external payable',
  'event LiquidityUnlocked(uint256 epoch, uint256 tokenAmount, uint256 bnbAmount, uint256 liquidity)'
]);

export const ERC20_ABI = parseAbi([
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)'
]);
