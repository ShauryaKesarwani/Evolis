// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TokenFactory.sol";

contract DeployToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        TokenFactory factory = TokenFactory(factoryAddress);
        
        // Example deployment configuration
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18, // 1 million tokens
            initialLiquidityPercent: 2000, // 20%
            unlockDuration: 30 days,
            epochDuration: 1 days,
            router: 0x5FbDB2315678afecb367f032d93F642f64180aa3 // Mock router for Anvil
        });
        
        // Deploy with 0.1 BNB for initial liquidity
        (address token, address controller) = factory.deployTokenV2{value: 0.1 ether}(config);
        
        console.log("Token deployed at:", token);
        console.log("Controller deployed at:", controller);
        
        vm.stopBroadcast();
    }
}
