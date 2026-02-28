// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TokenFactory.sol";
import "../src/Token.sol";
import "../src/LiquidityController.sol";
import "../src/PLUFactory.sol";
import "../src/PLUPair.sol";

contract TokenFactoryTest is Test {
    TokenFactory public factory;
    PLUFactory public pluFactory;
    address public user = address(0x1);
    
    function setUp() public {
        factory = new TokenFactory();
        pluFactory = new PLUFactory();
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
            pluFactory: address(0) // Use PLUFactory
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        
        assertFalse(tokenAddr == address(0));
        assertFalse(controllerAddr == address(0));
        
        // Verify token
        Token token = Token(tokenAddr);
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        
        // Verify controller
        LiquidityController controller = LiquidityController(payable(controllerAddr));
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
            pluFactory: address(0)
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
            pluFactory: address(0)
        });
        
        (address tokenAddr1,) = factory.deployTokenV2{value: 0.1 ether}(config);
        (address tokenAddr2,) = factory.deployTokenV2{value: 0.1 ether}(config);
        
        address[] memory deployments = factory.getUserDeployments(user);
        assertEq(deployments.length, 2);
        assertEq(deployments[0], tokenAddr1);
        assertEq(deployments[1], tokenAddr2);
        
        vm.stopPrank();
    }

    // ========== EPOCH-BASED UNLOCK TESTS ==========

    function testEpochUnlockBasics() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000, // 20% initial = 200k tokens
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        Token token = Token(tokenAddr);
        
        // Verify initial state
        assertEq(controller.totalEpochs(), 30);
        assertEq(controller.epochsUnlocked(), 0);
        
        uint256 lockedTokens = 800_000 * 10**18;
        uint256 expectedPerEpoch = lockedTokens / 30; // Locked tokens / epochs
        assertEq(controller.unlockPerEpoch(), expectedPerEpoch);
        
        vm.stopPrank();
    }

    function testEpochUnlockAfterTimeProgression() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        
        // Initially no epochs unlocked
        assertEq(controller.getUnlockableEpochs(), 0);
        
        // Advance time by 1 day (1 epoch)
        vm.warp(block.timestamp + 1 days);
        
        // Now 1 epoch should be unlockable
        uint256 unlockable = controller.getUnlockableEpochs();
        assertEq(unlockable, 1);
        
        vm.stopPrank();
    }

    function testEpochProgressAfterUnlock() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        
        // Advance 1 day and unlock epoch
        vm.warp(block.timestamp + 1 days);
        controller.unlockEpoch{value: 0.01 ether}();
        
        // Verify epoch was unlocked
        assertEq(controller.epochsUnlocked(), 1);
        
        // Check progress
        (uint256 epochsUnlocked, uint256 totalEpochs, uint256 tokensUnlocked, uint256 tokensRemaining) = 
            controller.getUnlockProgress();
        
        assertEq(epochsUnlocked, 1);
        assertEq(totalEpochs, 30);
        assertEq(tokensUnlocked, controller.unlockPerEpoch());
        assertEq(tokensRemaining, controller.lockedTokens() - controller.unlockPerEpoch());
        
        vm.stopPrank();
    }

    function testMultipleEpochUnlock() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        
        // Advance 5 days
        vm.warp(block.timestamp + 5 days);
        
        // Should have 5 unlockable epochs
        assertEq(controller.getUnlockableEpochs(), 5);
        
        // Unlock multiple epochs at once
        uint256 tokensUnlocked = controller.unlockEpoch{value: 0.05 ether}();
        
        // Should unlock all 5 epochs at once
        assertEq(controller.epochsUnlocked(), 5);
        assertEq(tokensUnlocked, controller.unlockPerEpoch() * 5);
        
        vm.stopPrank();
    }

    function testTimeUntilNextEpoch() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        
        uint256 startTime = controller.startTime();
        
        // At time 0, time until next epoch should be ~24 hours
        uint256 timeUntil = controller.getTimeUntilNextEpoch();
        assertEq(timeUntil, 1 days);
        
        // After 12 hours, should be ~12 hours remaining
        vm.warp(block.timestamp + 12 hours);
        timeUntil = controller.getTimeUntilNextEpoch();
        assertEq(timeUntil, 12 hours);
        
        // After 1 day, should be 0 (epoch is ready)
        vm.warp(startTime + 1 days);
        timeUntil = controller.getTimeUntilNextEpoch();
        assertEq(timeUntil, 0);
        
        vm.stopPrank();
    }

    function testUnlockAllEpochs() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        
        // Advance past all epochs
        vm.warp(block.timestamp + 31 days);
        
        // Unlock all epochs
        controller.unlockEpoch{value: 1 ether}();
        
        // Verify all epochs unlocked
        assertEq(controller.epochsUnlocked(), 30);
        
        // Check no more epochs available
        assertEq(controller.getUnlockableEpochs(), 0);
        
        // Time until next epoch should be 0
        assertEq(controller.getTimeUntilNextEpoch(), 0);
        
        // Further calls should revert
        vm.expectRevert("All epochs unlocked");
        controller.unlockEpoch{value: 0.1 ether}();
        
        vm.stopPrank();
    }

    function testCannotUnlockBeforeEpochReady() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        
        // Try to unlock immediately (no epoch passed)
        vm.expectRevert("Epoch not ready");
        controller.unlockEpoch{value: 0.1 ether}();
        
        vm.stopPrank();
    }

    function testUnlockProgressTracking() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        
        uint256 lockedTokens = controller.lockedTokens();
        uint256 unlockPerEpoch = controller.unlockPerEpoch();
        
        // Initially no unlocks
        (uint256 e1, uint256 te1, uint256 tu1, uint256 tr1) = controller.getUnlockProgress();
        assertEq(e1, 0);
        assertEq(tu1, 0);
        assertEq(tr1, lockedTokens);
        
        // After 15 days, unlock 15 epochs
        vm.warp(block.timestamp + 15 days);
        controller.unlockEpoch{value: 0.15 ether}();
        
        (uint256 e2, uint256 te2, uint256 tu2, uint256 tr2) = controller.getUnlockProgress();
        assertEq(e2, 15);
        assertEq(te2, 30);
        assertEq(tu2, unlockPerEpoch * 15);
        assertEq(tr2, lockedTokens - (unlockPerEpoch * 15));
        
        // After 30 days, unlock remaining
        vm.warp(block.timestamp + 15 days);
        controller.unlockEpoch{value: 0.15 ether}();
        
        (uint256 e3, uint256 te3, uint256 tu3, uint256 tr3) = controller.getUnlockProgress();
        assertEq(e3, 30);
        assertEq(te3, 30);
        // Due to rounding in division, unlocked may be less by a small amount
        assertTrue(tu3 >= lockedTokens - 100); // Allow for small rounding error
        assertTrue(tr3 <= 100); // Remaining should be negligible
        
        vm.stopPrank();
    }

    function testEpochUnlockRequiresETH() public {
        vm.startPrank(user);
        
        TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
            name: "Test Token",
            symbol: "TEST",
            totalSupply: 1_000_000 * 10**18,
            initialLiquidityPercent: 2000,
            unlockDuration: 30 days,
            epochDuration: 1 days,
            pluFactory: address(0)
        });
        
        (address tokenAddr, address controllerAddr) = factory.deployTokenV2{value: 0.1 ether}(config);
        LiquidityController controller = LiquidityController(controllerAddr);
        
        // Advance 1 day
        vm.warp(block.timestamp + 1 days);
        
        // Try to unlock without ETH
        vm.expectRevert("Need BNB for liquidity");
        controller.unlockEpoch();
        
        vm.stopPrank();
    }
}
