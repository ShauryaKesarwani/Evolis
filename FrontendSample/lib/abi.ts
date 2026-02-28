import { parseAbi } from 'viem';

export const TOKEN_FACTORY_ABI = parseAbi([
  'struct Config { string name; string symbol; uint256 totalSupply; uint256 initialLiquidityPercent; uint256 unlockDuration; uint256 epochDuration; address router; }',
  'function deployTokenV2(Config config) external payable returns (address tokenAddr, address controllerAddr)',
  'event TokenDeployed(address indexed token, address indexed controller, address indexed owner, string name, string symbol, uint256 totalSupply, uint256 initialLiquidity, uint256 lockedTokens, uint256 unlockDuration, uint256 epochDuration)'
]);
