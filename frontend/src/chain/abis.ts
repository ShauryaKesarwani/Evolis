import { parseAbi } from 'viem';

export const factoryAbi = parseAbi([
  'function deployTokenV2(tuple(string name, string symbol, uint256 totalSupply, uint256 initialLiquidityPercent, uint256 unlockDuration, uint256 epochDuration, address router) config) external payable returns (address tokenAddr, address controllerAddr)'
]);
