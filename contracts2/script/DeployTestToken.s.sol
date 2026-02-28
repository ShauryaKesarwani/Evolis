// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TestToken} from "../src/TestToken.sol";

contract DeployTestToken is Script {
    function run() external {
        vm.startBroadcast();
        
        TestToken token = new TestToken();
        console.log("TestToken deployed at:", address(token));
        
        vm.stopBroadcast();
    }
}
