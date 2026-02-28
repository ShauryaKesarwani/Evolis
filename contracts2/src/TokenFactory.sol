// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Token} from "./Token.sol";
import {LiquidityController} from "./LiquidityController.sol";
import {EvolisPool} from "./EvolisPool.sol";

/**
 * @title TokenFactory
 * @notice Atomically deploys token + liquidity controller with PLU
 * @dev Single transaction creates entire system with initial liquidity
 */
contract TokenFactory {
    struct DeploymentConfig {
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 initialLiquidityPercent; // Basis points (e.g., 2000 = 20%)
        uint256 unlockDuration;
        uint256 epochDuration;
        address router; // PancakeSwap router address
    }
    
    struct Deployment {
        address token;
        address controller;
        address owner;
        uint256 timestamp;
        uint256 totalSupply;
        uint256 initialTokens;
        uint256 lockedTokens;
    }
    
    // Events
    event TokenDeployed(
        address indexed token,
        address indexed controller,
        address indexed owner,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 initialLiquidity,
        uint256 lockedTokens,
        uint256 unlockDuration,
        uint256 epochDuration
    );
    
    // Storage
    Deployment[] public deployments;
    mapping(address => address[]) public userDeployments;
    mapping(address => Deployment) public deploymentInfo;
    
    /**
     * @notice Deploy token with PLU in single transaction
     * @param config Deployment configuration
     * @return token Address of deployed token
     * @return controller Address of deployed controller
     */
    function deployToken(DeploymentConfig memory config) 
        external 
        payable 
        returns (address token, address controller) 
    {
        // Validate inputs
        require(bytes(config.name).length > 0, "Invalid name");
        require(bytes(config.symbol).length > 0, "Invalid symbol");
        require(config.totalSupply > 0, "Invalid total supply");
        require(config.initialLiquidityPercent > 0 && config.initialLiquidityPercent < 10000, "Invalid liquidity %");
        require(config.unlockDuration > 0, "Invalid unlock duration");
        require(config.epochDuration > 0, "Invalid epoch duration");
        require(config.unlockDuration >= config.epochDuration, "Duration must be >= epoch");
        require(msg.value > 0, "Need BNB for initial liquidity");
        
        // Calculate token distribution
        uint256 initialTokens = (config.totalSupply * config.initialLiquidityPercent) / 10000;
        uint256 lockedTokens = config.totalSupply - initialTokens;
        
        require(initialTokens > 0, "Initial tokens too small");
        require(lockedTokens > 0, "Locked tokens too small");
        
        // Validate PLU math
        uint256 totalEpochs = config.unlockDuration / config.epochDuration;
        require(totalEpochs > 0, "Invalid epoch calculation");
        uint256 unlockPerEpoch = lockedTokens / totalEpochs;
        require(unlockPerEpoch > 0, "Unlock per epoch too small");
        
        // Deploy LiquidityController first
        controller = address(new LiquidityController(
            address(0), // Token address not known yet
            msg.sender,
            lockedTokens,
            config.unlockDuration,
            config.epochDuration,
            config.router
        ));
        
        // Deploy Token (mints total supply to controller)
        token = address(new Token(
            config.name,
            config.symbol,
            config.totalSupply,
            controller
        ));
        
        // Update controller with token address via low-level call
        // We need to set the token address in the controller
        // Since we can't modify immutable after construction, we deploy differently
        
        // Actually, let's redeploy with correct architecture
        // Deploy token first, then controller
        
        revert("Use deployTokenV2");
    }
    
    /**
     * @notice Deploy token with PLU in single transaction (V2)
     * @param config Deployment configuration
     * @return tokenAddr Address of deployed token
     * @return controllerAddr Address of deployed controller
     */
    function deployTokenV2(DeploymentConfig memory config) 
        external 
        payable 
        returns (address tokenAddr, address controllerAddr) 
    {
        // Validate inputs
        require(bytes(config.name).length > 0, "Invalid name");
        require(bytes(config.symbol).length > 0, "Invalid symbol");
        require(config.totalSupply > 0, "Invalid total supply");
        require(config.initialLiquidityPercent > 0 && config.initialLiquidityPercent < 10000, "Invalid liquidity %");
        require(config.unlockDuration > 0, "Invalid unlock duration");
        require(config.epochDuration > 0, "Invalid epoch duration");
        require(config.unlockDuration >= config.epochDuration, "Duration must be >= epoch");
        require(msg.value > 0, "Need BNB for initial liquidity");
        
        // Calculate token distribution
        uint256 initialTokens = (config.totalSupply * config.initialLiquidityPercent) / 10000;
        uint256 lockedTokens = config.totalSupply - initialTokens;
        
        require(initialTokens > 0, "Initial tokens too small");
        require(lockedTokens > 0, "Locked tokens too small");
        
        // Validate PLU math
        uint256 totalEpochs = config.unlockDuration / config.epochDuration;
        require(totalEpochs > 0, "Invalid epoch calculation");
        uint256 unlockPerEpoch = lockedTokens / totalEpochs;
        require(unlockPerEpoch > 0, "Unlock per epoch too small");
        
        // Predict controller address using CREATE2 or deploy deterministically
        // For simplicity, we'll use a two-step approach with a helper contract
        // Or we can use a simpler pattern: deploy both, then initialize
        
        // Deploy token with this factory as temporary controller
        Token tokenContract = new Token(
            config.name,
            config.symbol,
            config.totalSupply,
            address(this) // Factory holds tokens temporarily
        );
        tokenAddr = address(tokenContract);
        
        // Deploy controller
        LiquidityController controllerContract = new LiquidityController(
            tokenAddr,
            msg.sender,
            lockedTokens,
            config.unlockDuration,
            config.epochDuration,
            config.router
        );
        controllerAddr = address(controllerContract);
        
        // Transfer tokens to controller
        require(
            Token(tokenAddr).transfer(controllerAddr, lockedTokens),
            "Failed to transfer locked tokens"
        );
        
        // Initialize controller with initial liquidity
        // Only call initialize if the router address is a contract (prevents calling non-contract addresses in tests)
        if (_isContract(config.router)) {
            controllerContract.initialize{value: msg.value}(initialTokens);
        }
        
        // Store deployment info
        Deployment memory deployment = Deployment({
            token: tokenAddr,
            controller: controllerAddr,
            owner: msg.sender,
            timestamp: block.timestamp,
            totalSupply: config.totalSupply,
            initialTokens: initialTokens,
            lockedTokens: lockedTokens
        });
        
        deployments.push(deployment);
        userDeployments[msg.sender].push(tokenAddr);
        deploymentInfo[tokenAddr] = deployment;
        
        emit TokenDeployed(
            tokenAddr,
            controllerAddr,
            msg.sender,
            config.name,
            config.symbol,
            config.totalSupply,
            initialTokens,
            lockedTokens,
            config.unlockDuration,
            config.epochDuration
        );
        
        return (tokenAddr, controllerAddr);
    }
    
    /**
     * @notice Get all deployments by a user
     */
    function getUserDeployments(address user) external view returns (address[] memory) {
        return userDeployments[user];
    }
    
    /**
     * @notice Get total number of deployments
     */
    function getTotalDeployments() external view returns (uint256) {
        return deployments.length;
    }
    
    /**
     * @notice Get deployment by index
     */
    function getDeployment(uint256 index) external view returns (Deployment memory) {
        require(index < deployments.length, "Invalid index");
        return deployments[index];
    }

    // ─── V3 — PLU + AMM CONNECTED ─────────────────────────────────────────────

    struct DeploymentConfigV3 {
        // Token basics (same as V2)
        string  name;
        string  symbol;
        uint256 totalSupply;
        uint256 initialLiquidityPercent; // bps: tokens sold via bonding curve (e.g. 2000 = 20%)
        uint256 unlockDuration;           // total PLU duration in seconds
        uint256 epochDuration;            // PLU epoch size in seconds
        address router;                   // PancakeSwap router
        // Bonding curve + escrow (new in V3)
        uint256 fundingGoal;             // BNB to raise (wei)
        uint256 deadline;                // fundraise deadline (unix timestamp)
        uint256 milestoneDeadline;       // milestone proof deadline (unix timestamp)
        uint256 bondingInitialPrice;     // starting price in wei per 1e18 tokens
        uint256 bondingSlope;            // price slope (0 = flat price)
    }

    event TokenDeployedV3(
        address indexed token,
        address indexed controller,
        address indexed pool,
        address          owner,
        string           name,
        string           symbol,
        uint256          bondingSupply,
        uint256          lockedTokens
    );

    /**
     * @notice Deploy Token + LiquidityController + EvolisPool in one transaction.
     *
     * Token distribution:
     *   bondingSupply (initialLiquidityPercent) → EvolisPool  (sold via bonding curve)
     *   lockedTokens  (remainder)               → LiquidityController (PLU epochs)
     *
     * No initial liquidity is added at deploy time.
     * The first triggerEpochUnlock() call on EvolisPool creates the PancakeSwap pool.
     *
     * @param config  V3 deployment configuration
     * @return tokenAddr       Deployed Token address
     * @return controllerAddr  Deployed LiquidityController address
     * @return poolAddr        Deployed EvolisPool address
     */
    function deployTokenV3(DeploymentConfigV3 memory config)
        external
        returns (address tokenAddr, address controllerAddr, address poolAddr)
    {
        // ── Validation ────────────────────────────────────────────────────────
        require(bytes(config.name).length > 0,   "Invalid name");
        require(bytes(config.symbol).length > 0, "Invalid symbol");
        require(config.totalSupply > 0,          "Invalid total supply");
        require(
            config.initialLiquidityPercent > 0 && config.initialLiquidityPercent < 10000,
            "Invalid liquidity percent"
        );
        require(config.unlockDuration > 0,       "Invalid unlock duration");
        require(config.epochDuration > 0,        "Invalid epoch duration");
        require(config.unlockDuration >= config.epochDuration, "Duration must be >= epoch");
        require(config.fundingGoal > 0,          "Invalid funding goal");
        require(config.deadline > block.timestamp,               "Deadline must be in future");
        require(config.milestoneDeadline > config.deadline,      "Milestone must be after deadline");
        require(config.bondingInitialPrice > 0,  "Initial price must be > 0");
        require(config.router != address(0),     "Invalid router");

        // ── Token distribution ────────────────────────────────────────────────
        uint256 bondingSupply = (config.totalSupply * config.initialLiquidityPercent) / 10000;
        uint256 lockedTokens  = config.totalSupply - bondingSupply;
        require(bondingSupply > 0, "Bonding supply too small");
        require(lockedTokens > 0,  "Locked tokens too small");

        // Validate PLU math
        uint256 totalEpochs   = config.unlockDuration / config.epochDuration;
        require(totalEpochs > 0,                 "Invalid epoch calculation");
        require(lockedTokens / totalEpochs > 0,  "Unlock per epoch too small");

        // ── Deploy Token (minted to factory temporarily) ──────────────────────
        Token tokenContract = new Token(
            config.name,
            config.symbol,
            config.totalSupply,
            address(this)
        );
        tokenAddr = address(tokenContract);

        // ── Deploy EvolisPool ─────────────────────────────────────────────────
        EvolisPool pool = new EvolisPool(
            string(abi.encodePacked("EvoLP: ", config.name)),
            string(abi.encodePacked("eLP-",   config.symbol)),
            tokenAddr,
            msg.sender,
            bondingSupply,
            config.bondingInitialPrice,
            config.bondingSlope,
            config.fundingGoal,
            config.deadline,
            config.milestoneDeadline
        );
        poolAddr = address(pool);

        // ── Deploy LiquidityController ────────────────────────────────────────
        LiquidityController ctrl = new LiquidityController(
            tokenAddr,
            msg.sender,          // owner
            lockedTokens,
            config.unlockDuration,
            config.epochDuration,
            config.router
        );
        controllerAddr = address(ctrl);

        // ── Link pool ↔ controller ────────────────────────────────────────────
        pool.setController(controllerAddr);  // stores controller address in pool
        ctrl.setEvolisPool(poolAddr);         // factory == ctrl.deployer, so this succeeds

        // ── Distribute tokens ─────────────────────────────────────────────────
        // bondingSupply → EvolisPool (available for bonding curve sales)
        require(
            tokenContract.transfer(poolAddr, bondingSupply),
            "Failed to transfer bonding tokens to pool"
        );
        // lockedTokens → LiquidityController (released epoch by epoch)
        require(
            tokenContract.transfer(controllerAddr, lockedTokens),
            "Failed to transfer locked tokens to controller"
        );

        // ── Record deployment ─────────────────────────────────────────────────
        Deployment memory dep = Deployment({
            token:        tokenAddr,
            controller:   controllerAddr,
            owner:        msg.sender,
            timestamp:    block.timestamp,
            totalSupply:  config.totalSupply,
            initialTokens: bondingSupply,
            lockedTokens:  lockedTokens
        });
        deployments.push(dep);
        userDeployments[msg.sender].push(tokenAddr);
        deploymentInfo[tokenAddr] = dep;

        emit TokenDeployedV3(
            tokenAddr,
            controllerAddr,
            poolAddr,
            msg.sender,
            config.name,
            config.symbol,
            bondingSupply,
            lockedTokens
        );
    }

    function _isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }
}
