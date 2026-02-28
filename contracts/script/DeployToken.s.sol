// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TokenFactory.sol";
import "../src/EvolisFactory.sol";

contract DeployToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        address evolisFactoryAddress = vm.envAddress("EVOLIS_FACTORY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        TokenFactory factory = TokenFactory(factoryAddress);
        
        // Example deployment configuration (legacy support)
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "ShSHAaHa",
            symbol: "SSAH",
            totalSupply: 1_000_000 * 10**18, // 1 million tokens
            initialLiquidityPercent: 2000, // 20%
            unlockDuration: 30 days,
            epochDuration: 1 days,
            evolisFactory: evolisFactoryAddress // Use EVOLIS_FACTORY from env
        });
        
        // Deploy with 0.1 BNB for initial liquidity (legacy method)
        (address token, address controller) = factory.deployTokenV2{value: 0.1 ether}(config);
        
        console.log("Token deployed at:", token);
        console.log("Controller deployed at:", controller);
        
        vm.stopBroadcast();
    }
}
