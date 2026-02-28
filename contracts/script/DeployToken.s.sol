// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/LiquidityController.sol";

contract DeployToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        
        // Deploy Token first (mint to deployer temporarily)
        Token token = new Token(
            "Evolis Test Token",
            "EVOL",
            1_000_000 * 10**18,          // 1 million tokens
            deployer                      // mint to deployer
        );
        
        console.log("Token deployed at:", address(token));
        
        // Deploy LiquidityController
        LiquidityController controller = new LiquidityController(
            address(token),               // token address
            deployer,                     // owner
            600_000 * 10**18,            // lockedTokens (60% for progressive unlock)
            30 days,                      // unlockDuration
            1 days,                       // epochDuration  
            0x0B306BF915C4d645ff596e518fAf3F9669b97016  // PancakeRouter on BSC testnet
        );
        
        console.log("Controller deployed at:", address(controller));
        
        // Transfer all tokens to controller
        token.transfer(address(controller), 1_000_000 * 10**18);
        
        console.log("Tokens transferred to controller");
        
        vm.stopBroadcast();
    }
}
