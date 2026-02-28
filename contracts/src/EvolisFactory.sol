// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EvolisPool.sol";
import "./Token.sol";

/**
 * @title EvolisFactory
 * @notice Factory for creating milestone-based crowdfunding pools with EvolisPool
 * @dev Replaces PLUFactory for PROJECT_PLAN.md compliance:
 *      - Escrow-based fundraising
 *      - Milestone verification
 *      - Refunds if goal not met
 *      - Progressive fund release
 *      - AMM integration via PancakeSwap
 */
contract EvolisFactory {
    
    // Track all created pools
    mapping(address => address[]) public projectOwnerPools; // owner => pools
    mapping(address => address) public tokenToPool;         // token => pool
    mapping(address => bool) public isPoolFromFactory;
    address[] public allPools;
    
    event PoolCreated(
        address indexed pool,
        address indexed projectToken,
        address indexed projectOwner,
        uint256 fundingGoal,
        uint256 deadline,
        uint256 milestoneDeadline
    );
    
    struct PoolConfig {
        string lpName;                  // EvoLP token name
        string lpSymbol;                // EvoLP token symbol
        address projectToken;           // Token being fundraised
        address projectOwner;           // Project owner address
        uint256 bondingSupply;          // Tokens for sale
        uint256 bondingInitialPrice;    // Starting price (wei per 1e18 tokens)
        uint256 bondingSlope;           // Price increase rate (0 for fixed price)
        uint256 fundingGoal;            // BNB goal (after fees)
        uint256 deadline;               // Fundraise deadline
        uint256 milestoneDeadline;      // Milestone proof deadline
    }
    
    /**
     * @notice Create a new EvolisPool for a project
     * @param config Pool configuration parameters
     * @return pool Address of created EvolisPool
     */
    function createPool(PoolConfig calldata config) external returns (address pool) {
        require(config.projectToken != address(0), "EvolisFactory: ZERO_TOKEN");
        require(config.projectOwner != address(0), "EvolisFactory: ZERO_OWNER");
        require(tokenToPool[config.projectToken] == address(0), "EvolisFactory: POOL_EXISTS");
        
        // Deploy new EvolisPool
        EvolisPool evolisPool = new EvolisPool(
            config.lpName,
            config.lpSymbol,
            config.projectToken,
            config.projectOwner,
            config.bondingSupply,
            config.bondingInitialPrice,
            config.bondingSlope,
            config.fundingGoal,
            config.deadline,
            config.milestoneDeadline
        );
        
        pool = address(evolisPool);
        
        // Record the pool
        tokenToPool[config.projectToken] = pool;
        projectOwnerPools[config.projectOwner].push(pool);
        isPoolFromFactory[pool] = true;
        allPools.push(pool);
        
        emit PoolCreated(
            pool,
            config.projectToken,
            config.projectOwner,
            config.fundingGoal,
            config.deadline,
            config.milestoneDeadline
        );
        
        return pool;
    }

    /**
     * @notice Link an existing factory-created pool to its LiquidityController.
     * @dev Must be called via this factory because EvolisPool.setController is onlyFactory.
     */
    function setPoolController(address pool, address controller) external {
        require(isPoolFromFactory[pool], "EvolisFactory: UNKNOWN_POOL");
        require(controller != address(0), "EvolisFactory: ZERO_CONTROLLER");

        EvolisPool(payable(pool)).setController(controller);
    }
    
    /**
     * @notice Get all pools for a project owner
     */
    function getPoolsByOwner(address owner) external view returns (address[] memory) {
        return projectOwnerPools[owner];
    }
    
    /**
     * @notice Get pool for a specific token
     */
    function getPoolByToken(address token) external view returns (address) {
        return tokenToPool[token];
    }
    
    /**
     * @notice Get total number of pools created
     */
    function poolCount() external view returns (uint256) {
        return allPools.length;
    }
    
    /**
     * @notice Get pool at specific index
     */
    function getPool(uint256 index) external view returns (address) {
        require(index < allPools.length, "EvolisFactory: INDEX_OUT_OF_BOUNDS");
        return allPools[index];
    }
}
