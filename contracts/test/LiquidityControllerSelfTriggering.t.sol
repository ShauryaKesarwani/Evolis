// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Token.sol";
import "../src/LiquidityControllerSelfTriggering.sol";
import "../src/MockPancakeRouter.sol";

contract LiquidityControllerSelfTriggeringTest is Test {
    LiquidityControllerSelfTriggering public controller;
    MockPancakeRouter public mockRouter;
    Token public token;
    address public owner = address(0x1);
    
    function setUp() public {
        mockRouter = new MockPancakeRouter();
        vm.deal(owner, 100 ether);
        
        // Create token
        token = new Token(
            "Test Token",
            "TEST",
            1_000_000 * 10**18,
            address(this)
        );
        
        // Create self-triggering controller
        controller = new LiquidityControllerSelfTriggering(
            address(token),
            owner,
            800_000 * 10**18,
            30 days,
            1 days,
            address(mockRouter)
        );
        
        // Transfer tokens to controller
        token.transfer(address(controller), 1_000_000 * 10**18);
        
        // Initialize
        vm.prank(owner);
            controller.initialize{value: 3 ether}(200_000 * 10**18);
    }
    
    // ========== SELF-TRIGGERING TESTS ==========
    
    function testAutoUnlockOnViewFunctionCall() public {
        // Day 0: Deploy complete
        assertEq(controller.getEpochsUnlocked(), 0);
        
        // Advance 1 day
        vm.warp(block.timestamp + 1 days);
        
        // Just call a view function... 
        // IT AUTOMATICALLY TRIGGERS UNLOCK! ✨
        uint256 timeUntil = controller.getTimeUntilNextUnlock();
        
        // Verify unlock happened automatically
        uint256 epochsNow = controller.getEpochsUnlocked();
        assertTrue(epochsNow > 0, "Auto-unlock should have triggered");
    }
    
    function testAutoUnlockOnStatusCall() public {
        vm.warp(block.timestamp + 1 days);
        
        // Call getStatus... auto-unlock triggers! ✨
        (uint256 nextEpoch, uint256 ethAvail, uint256 tokenBal) = controller.getStatus();
        
        // Everything was updated automatically
        assertTrue(tokenBal < 1_000_000 * 10**18, "Tokens should have been released");
        uint256 epochsNow = controller.getEpochsUnlocked();
        assertTrue(epochsNow > 0, "Epochs should auto-increment");
    }
    
    function testAutoUnlockOnReceiveETH() public {
        vm.warp(block.timestamp + 1 days);
        
        uint256 epochsBefore = controller.getEpochsUnlocked();
        
        // Send ETH directly... auto-unlock triggers! ✨
        (bool success, ) = payable(address(controller)).call{value: 0.1 ether}("");
        assertTrue(success);
        
        uint256 epochsAfter = controller.getEpochsUnlocked();
        assertTrue(epochsAfter > epochsBefore, "Auto-unlock on ETH receive");
    }
    
    function testAutoUnlockOnCheckAndUnlock() public {
        vm.warp(block.timestamp + 1 days);
        
        uint256 epochsBefore = controller.getEpochsUnlocked();
        
        // Explicit call to trigger check
        controller.checkAndUnlock();  // ✨ AUTO-UNLOCK!
        
        uint256 epochsAfter = controller.getEpochsUnlocked();
        assertTrue(epochsAfter > epochsBefore, "Explicit checkAndUnlock should auto-trigger");
    }
    
    function testNoUnlockIfNotTimeYet() public {
        assertEq(controller.getEpochsUnlocked(), 0);
        
        // Call immediately (no time passed)
        controller.checkAndUnlock();
        
        // Nothing should happen
        assertEq(controller.getEpochsUnlocked(), 0);
    }
    
    function testMultipleDaysAutoUnlock() public {
        // Day 0
        assertEq(controller.getEpochsUnlocked(), 0);
        
        // Day 5: multiple epochs ready
        vm.warp(block.timestamp + 5 days);
        
        // Just call getStatus... automatically unlocks all 5 epochs! ✨
        (uint256 nextEpoch, , ) = controller.getStatus();
        
        uint256 epochsNow = controller.getEpochsUnlocked();
        assertEq(epochsNow, 5, "All 5 pending epochs should auto-unlock");
    }
    
    function testProgressAutoUpdates() public {
        vm.warp(block.timestamp + 10 days);
        
        // Call progress function... auto-unlock happens internally ✨
        (uint256 e1, uint256 te1, uint256 tu1, uint256 tr1) = 
            controller.getUnlockProgress();
        
        assertEq(e1, 10, "10 epochs auto-unlocked by day 10");
        assertTrue(tu1 > 0, "Tokens unlocked");
        assertTrue(tr1 < 800_000 * 10**18, "Remaining decreased");
    }
    
    function testCompleteLifecycleAuto() public {
        // Simulate 30 days with periodic interaction
        // NO EXTERNAL SERVICE, NO CHAINLINK, NO BOT
        
        uint256 startTime = block.timestamp;
        uint256 lastEpochs = 0;
        
        for (uint256 day = 1; day <= 30; day++) {
            vm.warp(startTime + (day * 1 days));
            
            // Just query progress... auto-unlock happens! ✨
            (uint256 epochs, , , ) = controller.getUnlockProgress();
            
            // Should be making progress
            assertTrue(epochs >= lastEpochs, "Progress should not decrease");
            lastEpochs = epochs;
        }
        
        // After day 30, all epochs should be unlocked
        uint256 finalEpochs = controller.getEpochsUnlocked();
        assertEq(finalEpochs, 30, "All 30 epochs auto-unlocked");
    }
    
    function testDepositETHTriggersUnlock() public {
        vm.warp(block.timestamp + 1 days);
        
        uint256 epochsBefore = controller.getEpochsUnlocked();
        
        // Deposit ETH... auto-unlock triggers! ✨
        controller.depositETHForUnlocks{value: 0.5 ether}();
        
        uint256 epochsAfter = controller.getEpochsUnlocked();
        assertTrue(epochsAfter > epochsBefore, "Deposit triggers auto-unlock");
    }
    
    function testManualUnlockAsOwner() public {
        vm.warp(block.timestamp + 1 days);
        
        vm.prank(owner);
        controller.manualUnlock();
        
        assertTrue(controller.getEpochsUnlocked() > 0, "Manual unlock works");
    }
    
    function testViewFunctionsNoAutoTrigger() public {
        vm.warp(block.timestamp + 1 days);
        
        // These are pure view functions - no auto-trigger
        uint256 balance = controller.getTokenBalance();
        uint256 epochs = controller.getEpochsUnlocked();
        uint256 eth = controller.getEthAvailable();
        uint256 unlockable = controller.getUnlockableEpochs();
        
        // They return state without updating it
        assertTrue(unlockable > 0, "Shows unlockable");
        assertEq(epochs, 0, "But doesn't auto-execute view-only");
    }
    
    function testAutoUnlockWithoutExternalService() public {
        // THIS IS THE KEY TEST
        // Simulate 30 days with ONLY contract calls (no bots, no chainlink)
        
        uint256 startTime = block.timestamp;
        
        // Day 15: Trader wants to check their position
        vm.warp(startTime + 15 days);
        (uint256 e1, , , ) = controller.getUnlockProgress();  // Just checking!
        assertTrue(e1 > 0, "15 epochs auto-unlocked by day 15");
        
        // Day 25: Another trader sends ETH (for liquidity boost)
        vm.warp(startTime + 25 days);
        (bool success, ) = payable(address(controller)).call{value: 0.1 ether}("");
        assertTrue(success);
        (uint256 e2, , , ) = controller.getUnlockProgress();  // Just query
        assertTrue(e2 > e1, "More epochs auto-unlocked by day 25");
        
        // Day 30: Someone calls checkAndUnlock
        vm.warp(startTime + 30 days);
        controller.checkAndUnlock();  // Just trigger
        (uint256 e3, , , ) = controller.getUnlockProgress();  // Query
        assertEq(e3, 30, "All epochs unlocked by day 30");
        
        // NO CHAINLINK, NO BOT, NO EXTERNAL SERVICE
        // Just time + interaction = automatic unlocking ✨
    }
}
