// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EvolisFactory.sol";

contract DeployFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        EvolisFactory factory = new EvolisFactory();
        
        console.log("EvolisFactory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
}
