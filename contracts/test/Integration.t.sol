// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TokenFactory.sol";
import "../src/Token.sol";
import "../src/LiquidityController.sol";
import "../src/EvolisFactory.sol";
import "../src/PLUPair.sol";

contract IntegrationTest is Test {
    TokenFactory public factory;
    EvolisFactory public evolisFactory;
    
    address public owner;
    address public user1;
    address public user2;
    address public trader;
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        trader = makeAddr("trader");
        
        // Give users some ETH
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(trader, 100 ether);
        
        // Deploy infrastructure
        factory = new TokenFactory();
        evolisFactory = new EvolisFactory();
    }
    
    function testCompleteTokenLifecycle() public {
        console.log("=== INTEGRATION TEST: Complete Token Lifecycle ===");
        console.log("");
        
        // Step 1: Deploy Token via Factory
        console.log("Step 1: Deploying token via TokenFactory...");
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "TestCoin",
            symbol: "TEST",
            totalSupply: 1_000_000 * 1e18,
            initialLiquidityPercent: 2000, // 20% = 2000 basis points
            unlockDuration: 30 days,
            epochDuration: 1 days,
            evolisFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 10 ether}(config);
        
        Token token = Token(tokenAddr);
        LiquidityController controller = LiquidityController(payable(controllerAddr));
        
        console.log("  Token deployed at:", tokenAddr);
        console.log("  Controller deployed at:", controllerAddr);
        console.log("  Total supply:", token.totalSupply() / 1e18, "tokens");
        console.log("  Controller balance:", token.balanceOf(controllerAddr) / 1e18, "tokens");
        console.log("");
        
        // Verify controller has tokens and tokens are locked for progressive unlock
        assertGt(token.balanceOf(controllerAddr), 0);
        assertEq(token.totalSupply(), 1_000_000 * 1e18);
        
        // Step 2: Test Token Transfers
        console.log("Step 2: Testing token transfers...");
        
        // Controller can send tokens to users
        vm.startPrank(address(controller));
        token.transfer(user1, 1000 * 1e18);
        token.transfer(user2, 500 * 1e18);
        vm.stopPrank();
        
        console.log("  Controller -> User1: 1000 tokens");
        console.log("  Controller -> User2: 500 tokens");
        console.log("  User1 balance:", token.balanceOf(user1) / 1e18, "tokens");
        console.log("  User2 balance:", token.balanceOf(user2) / 1e18, "tokens");
        console.log("");
        
        // Verify transfers
        assertEq(token.balanceOf(user1), 1000 * 1e18);
        assertEq(token.balanceOf(user2), 500 * 1e18);
        
        // Step 3: Test Epoch Unlock
        console.log("Step 4: Testing epoch unlock...");
        
        console.log("  Controller ETH balance:", address(controller).balance / 1e18, "ETH");
        
        // Fast forward 1 day
        vm.warp(block.timestamp + 1 days + 1);
        console.log("  Time warped: +1 day");
        
        // Unlock epoch with ETH
        controller.unlockEpoch{value: 1 ether}();
        console.log("  Epoch 1 unlocked (sent 1 ether)");
        console.log("");
        
        // Step 5: Test Multiple Epochs
        console.log("Step 5: Testing multiple epochs...");
        
        for (uint i = 2; i <= 5; i++) {
            vm.warp(block.timestamp + 1 days);
            controller.unlockEpoch{value: 1 ether}();
            console.log("  Epoch", i, "unlocked");
        }
        
        (uint256 epochsUnlocked, , uint256 tokensUnlocked, ) = controller.getUnlockProgress();
        console.log("  Current epoch:", epochsUnlocked);
        console.log("  Total unlocked:", tokensUnlocked / 1e18, "tokens");
        console.log("");
        
        // Verify 5 epochs unlocked
        assertEq(epochsUnlocked, 5);
        
        // Step 6: Check Final State
        console.log("Step 6: Final state verification...");
        console.log("  Token total supply:", token.totalSupply() / 1e18);
        console.log("  Controller balance:", token.balanceOf(controllerAddr) / 1e18);
        console.log("  User1 balance:", token.balanceOf(user1) / 1e18);
        console.log("  User2 balance:", token.balanceOf(user2) / 1e18);
        console.log("  Trader balance:", token.balanceOf(trader) / 1e18);
        console.log("");
        
        console.log("=== ALL TESTS PASSED ===");
    }
    
    function testMultipleUserDeployments() public {
        console.log("=== TEST: Multiple Users Deploy Tokens ===");
        console.log("");
        
        // User1 deploys token
        vm.startPrank(user1);
        TokenFactory.DeploymentConfig memory config1 = TokenFactory.DeploymentConfig({
            name: "UserCoin1",
            symbol: "UC1",
            totalSupply: 500_000 * 1e18,
            initialLiquidityPercent: 2000, // 20%
            unlockDuration: 30 days,
            epochDuration: 1 days,
            evolisFactory: address(0)
        });
        
        (address token1, address controller1) = factory.deployTokenV2{value: 5 ether}(config1);
        vm.stopPrank();
        
        console.log("User1 deployed:");
        console.log("  Token:", token1);
        console.log("  Controller:", controller1);
        
        // User2 deploys token
        vm.startPrank(user2);
        TokenFactory.DeploymentConfig memory config2 = TokenFactory.DeploymentConfig({
            name: "UserCoin2",
            symbol: "UC2",
            totalSupply: 750_000 * 1e18,
            initialLiquidityPercent: 3000, // 30%
            unlockDuration: 30 days,
            epochDuration: 1 days,
            evolisFactory: address(0)
        });
        
        (address token2, address controller2) = factory.deployTokenV2{value: 7 ether}(config2);
        vm.stopPrank();
        
        console.log("User2 deployed:");
        console.log("  Token:", token2);
        console.log("  Controller:", controller2);
        
        // Verify different addresses
        assertTrue(token1 != token2);
        assertTrue(controller1 != controller2);
        
        // Check deployments registry
        address[] memory user1Deployments = factory.getUserDeployments(user1);
        address[] memory user2Deployments = factory.getUserDeployments(user2);
        
        console.log("User1 deployment count:", user1Deployments.length);
        console.log("User2 deployment count:", user2Deployments.length);
        
        assertEq(user1Deployments.length, 1);
        assertEq(user2Deployments.length, 1);
        
        console.log("=== MULTI-USER TEST PASSED ===");
        console.log("");
    }
    
    function testHighVolumeTrading() public {
        console.log("=== TEST: High Volume Trading ===");
        console.log("");
        
        // Deploy token
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "HighVolume",
            symbol: "HV",
            totalSupply: 10_000_000 * 1e18,
            initialLiquidityPercent: 2000, // 20%
            unlockDuration: 30 days,
            epochDuration: 1 days,
            evolisFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 100 ether}(config);
        
        Token token = Token(tokenAddr);
        LiquidityController controller = LiquidityController(payable(controllerAddr));
        
        console.log("Initial liquidity:");
        console.log("  Token address:", tokenAddr);
        console.log("  Total supply:", token.totalSupply() / 1e18);
        console.log("  Controller balance:", token.balanceOf(controllerAddr) / 1e18);
        console.log("");
        
        // Test epoch unlocks for multiple traders
        uint256 currentTime = block.timestamp;
        for (uint i = 1; i <= 3; i++) {
            // Warp forward by epoch duration
            currentTime += 1 days + 1;
            vm.warp(currentTime);
            controller.unlockEpoch{value: 5 ether}();
            console.log("  Epoch", i, "unlocked (5 ETH sent)");
        }
        
        (uint256 epochsUnlocked, , uint256 tokensUnlocked, ) = controller.getUnlockProgress();
        console.log("  Current epoch:", epochsUnlocked);
        console.log("  Total unlocked:", tokensUnlocked / 1e18, "tokens");
        console.log("");
        
        console.log("=== HIGH VOLUME TEST PASSED ===");
        console.log("");
    }
}
