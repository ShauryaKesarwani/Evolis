// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EvolisFactory.sol";

contract DeployPool is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        address tokenAddress = vm.envAddress("TOKEN_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        
        EvolisFactory factory = EvolisFactory(factoryAddress);
        
        // Create pool configuration
        EvolisFactory.PoolConfig memory config = EvolisFactory.PoolConfig({
            lpName: "Evolis LP",
            lpSymbol: "EvoLP",
            projectToken: tokenAddress,
            projectOwner: deployer,
            bondingSupply: 400_000 * 10**18,         // 400k tokens
            bondingInitialPrice: 1_000_000_000_000_000, // 0.000001 BNB per token
            bondingSlope: 0,                          // Fixed price
            fundingGoal: 1 ether,                    // 1 BNB goal
            deadline: block.timestamp + 30 days,
            milestoneDeadline: block.timestamp + 60 days
        });
        
        // Create the pool
        address pool = factory.createPool(config);
        
        console.log("Pool created at:", pool);
        
        vm.stopBroadcast();
    }
}
