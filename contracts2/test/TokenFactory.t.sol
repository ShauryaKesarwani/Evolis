// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TokenFactory} from "../src/TokenFactory.sol";
import {Token} from "../src/Token.sol";
import {LiquidityController} from "../src/LiquidityController.sol";

contract TokenFactoryTest is Test {
    TokenFactory public factory;
    address public user = address(0x1);
    
    function setUp() public {
        factory = new TokenFactory();
        vm.deal(user, 100 ether);
    }
    
    function testDeployToken() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000, // 20%
            unlockDuration: 30 days,
            epochDuration: 1 days,
            router: address(0x123) // Mock for testing
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        
        assertFalse(tokenAddr == address(0));
        assertFalse(controllerAddr == address(0));
        
        // Verify token
        Token token = Token(tokenAddr);
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        
        // Verify controller
        LiquidityController controller = LiquidityController(controllerAddr);
        assertEq(controller.token(), tokenAddr);
        assertEq(controller.owner(), user);
        assertEq(uint256(controller.totalEpochs()), uint256(30));
        // Check unlock per epoch is set and reasonable
        assertTrue(controller.unlockPerEpoch() > 0);
        assertTrue(controller.unlockPerEpoch() < 1_000_000 * 10**18);
        
        vm.stopPrank();
    }
    
    function testInvalidConfiguration() public {
        vm.startPrank(user);
        
        // Invalid initial liquidity percent (> 100%)
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 10001,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            router: address(0x123)
        });
        
        vm.expectRevert("Invalid liquidity %");
        factory.deployTokenV2{value: 0.1 ether}(config);
        
        vm.stopPrank();
    }
    
    function testGetUserDeployments() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            router: address(0x123)
        });
        
        (address tokenAddr1,) = factory.deployTokenV2{value: 0.1 ether}(config);
        (address tokenAddr2,) = factory.deployTokenV2{value: 0.1 ether}(config);
        
        address[] memory deployments = factory.getUserDeployments(user);
        assertEq(deployments.length, 2);
        assertEq(deployments[0], tokenAddr1);
        assertEq(deployments[1], tokenAddr2);
        
        vm.stopPrank();
    }
}
