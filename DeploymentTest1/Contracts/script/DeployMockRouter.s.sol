// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import "../src/MockPancakeRouter.sol";

contract DeployMockRouter is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MockPancakeRouter router = new MockPancakeRouter();
        
        console.log("MockPancakeRouter deployed at:", address(router));
        console.log("Update PANCAKE_ROUTER in LiquidityController.sol to:", address(router));
        
        vm.stopBroadcast();
    }
}
