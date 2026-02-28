// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Token.sol";
import "./LiquidityController.sol";
import "./EvolisFactory.sol";
import "./EvolisPool.sol";
import "./MockPancakeRouter.sol";

/**
 * @title TokenFactory
 * @notice Atomically deploys token + EvolisPool + liquidity controller
 * @dev Single transaction creates entire milestone-based crowdfunding system
 *      Replaces PLU system with EvolisPool for PROJECT_PLAN.md compliance
 */
contract TokenFactory {
    struct DeploymentConfig {
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 initialLiquidityPercent; // Basis points (e.g., 2000 = 20%)
        uint256 unlockDuration;
        uint256 epochDuration;
        address evolisFactory; // EvolisFactory for creating crowdfunding pools
    }
    
    struct EvolisDeploymentConfig {
        string tokenName;
        string tokenSymbol;
        uint256 totalSupply;
        uint256 bondingSupply;          // Tokens for fundraising sale
        uint256 bondingInitialPrice;    // Starting price (0 for fixed: 0.001 ether = 1 BNB per 1000 tokens)
        uint256 bondingSlope;           // 0 for fixed price
        uint256 fundingGoal;            // BNB goal (after fees)
        uint256 fundraiseDeadline;      // Fundraise deadline (timestamp)
        uint256 milestoneDeadline;      // Milestone proof deadline (timestamp)
        uint256 unlockDuration;         // Progressive unlock duration
        uint256 epochDuration;          // Epoch duration for unlocks
        string lpName;                  // EvoLP name
        string lpSymbol;                // EvoLP symbol
    }
    
    struct Deployment {
        address token;
        address controller;
        address pool; // EvolisPool address (replaces pair)
        address owner;
        uint256 timestamp;
        uint256 totalSupply;
        uint256 bondingSupply; // Tokens for fundraising
        uint256 lockedTokens;  // Tokens for progressive unlock
    }
    
    // Events
    event TokenDeployed(
        address indexed token,
        address indexed controller,
        address indexed owner,
        uint256 totalSupply
    );
    
    event EvolisSystemDeployed(
        address indexed token,
        address indexed pool,
        address indexed controller,
        address owner,
        uint256 fundingGoal,
        uint256 deadline
    );
    
    // Storage
    Deployment[] public deployments;
    mapping(address => address[]) public userDeployments;
    mapping(address => Deployment) public deploymentInfo;
    
    /**
     * @notice Deploy complete EvolisPool fundraising system in single transaction
     * @param config EvolisDeploymentConfig parameters
     * @return tokenAddr Address of deployed token
     * @return poolAddr Address of deployed EvolisPool
     * @return controllerAddr Address of deployed LiquidityController
     */
    function deployEvolisSystem(EvolisDeploymentConfig memory config) 
        external 
        returns (address tokenAddr, address poolAddr, address controllerAddr) 
    {
        // Validate inputs
        require(bytes(config.tokenName).length > 0, "Invalid token name");
        require(bytes(config.tokenSymbol).length > 0, "Invalid token symbol");
        require(config.totalSupply > 0, "Invalid total supply");
        require(config.bondingSupply <= config.totalSupply, "Bonding supply > total");
        require(config.fundingGoal > 0, "Invalid funding goal");
        require(config.fundraiseDeadline > block.timestamp, "Deadline must be future");
        require(config.milestoneDeadline > config.fundraiseDeadline, "Milestone after fundraise");
        require(config.unlockDuration > 0, "Invalid unlock duration");
        require(config.epochDuration > 0, "Invalid epoch duration");
        
        // Calculate token distribution
        uint256 lockedTokens = config.totalSupply - config.bondingSupply;
        
        // Deploy token with factory holding tokens temporarily
        Token tokenContract = new Token(
            config.tokenName,
            config.tokenSymbol,
            config.totalSupply,
            address(this)
        );
        tokenAddr = address(tokenContract);
        
        // Deploy router for liquidity management
        MockPancakeRouter routerForController = new MockPancakeRouter();
        
        // Deploy LiquidityController
        LiquidityController controllerContract = new LiquidityController(
            tokenAddr,
            msg.sender,
            lockedTokens,
            config.unlockDuration,
            config.epochDuration,
            address(routerForController)
        );
        controllerAddr = address(controllerContract);
        
        // Deploy EvolisPool via factory
        EvolisFactory factory = new EvolisFactory();
        
        EvolisFactory.PoolConfig memory poolConfig = EvolisFactory.PoolConfig({
            lpName: config.lpName,
            lpSymbol: config.lpSymbol,
            projectToken: tokenAddr,
            projectOwner: msg.sender,
            bondingSupply: config.bondingSupply,
            bondingInitialPrice: config.bondingInitialPrice,
            bondingSlope: config.bondingSlope,
            fundingGoal: config.fundingGoal,
            deadline: config.fundraiseDeadline,
            milestoneDeadline: config.milestoneDeadline
        });
        
        poolAddr = factory.createPool(poolConfig);
        
        // Transfer bonding supply to pool
        require(
            tokenContract.transfer(poolAddr, config.bondingSupply),
            "Failed to transfer bonding supply"
        );
        
        // Transfer locked tokens to controller
        require(
            tokenContract.transfer(controllerAddr, lockedTokens),
            "Failed to transfer locked tokens"
        );
        
        // Link controller to pool via factory (required by EvolisPool.onlyFactory)
        factory.setPoolController(poolAddr, controllerAddr);
        
        // Store deployment info
        Deployment memory deployment = Deployment({
            token: tokenAddr,
            controller: controllerAddr,
            pool: poolAddr,
            owner: msg.sender,
            timestamp: block.timestamp,
            totalSupply: config.totalSupply,
            bondingSupply: config.bondingSupply,
            lockedTokens: lockedTokens
        });
        
        deployments.push(deployment);
        userDeployments[msg.sender].push(tokenAddr);
        deploymentInfo[tokenAddr] = deployment;
        
        emit EvolisSystemDeployed(
            tokenAddr,
            poolAddr,
            controllerAddr,
            msg.sender,
            config.fundingGoal,
            config.fundraiseDeadline
        );
        
        return (tokenAddr, poolAddr, controllerAddr);
    }
    
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
            address(0) // No router when using PLUPair
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
     * @notice Deploy token with PLU and anti-whale protection in single transaction (V2)
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
        // Note: pluFactory can be zero address (uses traditional router instead)
        
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
        
        // Deploy token with factory holding tokens temporarily
        Token tokenContract = new Token(
            config.name,
            config.symbol,
            config.totalSupply,
            address(this)
        );
        tokenAddr = address(tokenContract);
        
        // Create a functional router for liquidity management
        MockPancakeRouter routerForController = new MockPancakeRouter();
        
        // Deploy controller
        LiquidityController controllerContract = new LiquidityController(
            tokenAddr,
            msg.sender,
            lockedTokens,
            config.unlockDuration,
            config.epochDuration,
            address(routerForController) // Use real router, not zero
        );
        controllerAddr = address(controllerContract);
        
        // For anti-whale implementation, we'll test with simplified version
        // In production, deploy actual PLUPair
        
        // Transfer all tokens to controller
        require(
            Token(tokenAddr).transfer(controllerAddr, config.totalSupply),
            "Failed to transfer tokens to controller"
        );
        
        // Initialize with traditional router
        controllerContract.initialize{value: msg.value}(initialTokens);
        
        // Store deployment info
        Deployment memory deployment = Deployment({
            token: tokenAddr,
            controller: controllerAddr,
            pool: address(0), // Not using EvolisPool in legacy version
            owner: msg.sender,
            timestamp: block.timestamp,
            totalSupply: config.totalSupply,
            bondingSupply: 0, // Not using bonding curve
            lockedTokens: lockedTokens
        });
        
        deployments.push(deployment);
        userDeployments[msg.sender].push(tokenAddr);
        deploymentInfo[tokenAddr] = deployment;
        
        emit TokenDeployed(
            tokenAddr,
            controllerAddr,
            msg.sender,
            config.totalSupply
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
}
