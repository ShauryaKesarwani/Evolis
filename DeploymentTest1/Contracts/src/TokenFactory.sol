// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Token.sol";
import "./LiquidityController.sol";

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
        controllerContract.initialize{value: msg.value}(initialTokens);
        
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
}
