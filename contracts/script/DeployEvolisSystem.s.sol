// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EvolisFactory.sol";
import "../src/Token.sol";
import "../src/LiquidityController.sol";
import "../src/MockPancakeRouter.sol";

/**
 * @title DeployEvolisSystem
 * @notice Deploy a complete milestone-based crowdfunding system
 * @dev Creates: Token + EvolisPool + LiquidityController
 */
contract DeployEvolisSystem is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy system contracts directly (avoids oversized TokenFactory deployment)
        EvolisFactory factory = new EvolisFactory();
        console.log("EvolisFactory deployed at:", address(factory));
        
        // Example: Fixed price fundraise (PROJECT_PLAN.md style)
        // 1 BNB = 1000 tokens → initialPrice = 0.001 ether
        // Fixed price → slope = 0
        uint256 totalSupply = 1_000_000 * 10**18;
        uint256 bondingSupply = 400_000 * 10**18;
        uint256 lockedTokens = totalSupply - bondingSupply;

        Token tokenContract = new Token("Startup Token", "START", totalSupply, deployer);
        address token = address(tokenContract);

        MockPancakeRouter router = new MockPancakeRouter();
        LiquidityController controllerContract = new LiquidityController(
            token,
            msg.sender,
            lockedTokens,
            180 days,
            30 days,
            address(router)
        );
        address controller = address(controllerContract);

        EvolisFactory.PoolConfig memory poolConfig = EvolisFactory.PoolConfig({
            lpName: "EvoLP: Startup Token",
            lpSymbol: "eLP-START",
            projectToken: token,
            projectOwner: deployer,
            bondingSupply: bondingSupply,
            bondingInitialPrice: 0.001 ether,
            bondingSlope: 0,
            fundingGoal: 300 ether,
            deadline: block.timestamp + 30 days,
            milestoneDeadline: block.timestamp + 90 days
        });

        address pool = factory.createPool(poolConfig);

        require(tokenContract.transfer(pool, bondingSupply), "transfer to pool failed");
        require(tokenContract.transfer(controller, lockedTokens), "transfer to controller failed");
        factory.setPoolController(pool, controller);
        
        console.log("=== EVOLIS SYSTEM DEPLOYED ===");
        console.log("Token:", token);
        console.log("EvolisPool:", pool);
        console.log("LiquidityController:", controller);
        console.log("");
        console.log("Next steps:");
        console.log("1. Backers call EvolisPool.buyBondingCurve{value: BNB}(minTokens)");
        console.log("2. Once fundingGoal reached:");
        console.log("   - 50% BNB -> project owner immediately");
        console.log("   - 50% BNB -> held for progressive liquidity");
        console.log("3. Call EvolisPool.triggerEpochUnlock() to add liquidity");
        console.log("4. Owner calls EvolisPool.submitMilestone() to release remaining funds");
        console.log("5. Backers call EvolisPool.claimEvoLp() to get LP tokens");
        console.log("6. Backers can claim IL protection via claimIlCompensation()");
        
        vm.stopBroadcast();
    }
}
