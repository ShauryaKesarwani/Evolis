import { parseAbi } from 'viem';

export const factoryAbi = parseAbi([
  'struct Config { string name; string symbol; uint256 totalSupply; uint256 initialLiquidityPercent; uint256 unlockDuration; uint256 epochDuration; address router; }',
  'function deployTokenV2(Config config) external payable returns (address tokenAddr, address controllerAddr)'
]);
