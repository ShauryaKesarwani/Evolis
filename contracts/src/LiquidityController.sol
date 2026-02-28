// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPancakeRouter {
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
}

interface IPLUPair {
    function mint(address to) external returns (uint256 liquidity);
    function getCurrentEpoch() external view returns (uint256);
}

/**
 * @title LiquidityController
 * @notice Manages Progressive Liquidity Unlock (PLU) for a token
 * @dev Holds tokens and gradually releases them into AMM pool over time
 */
contract LiquidityController {
    // State variables
    IPancakeRouter public immutable PANCAKE_ROUTER;
    
    address public immutable token;
    address public immutable owner;
    address public immutable deployer;
    address public pair; // PLUPair address (can be set after initialization)
    
    uint256 public immutable startTime;
    uint256 public immutable unlockDuration;
    uint256 public immutable epochDuration;
    uint256 public immutable totalEpochs;
    uint256 public immutable unlockPerEpoch;
    uint256 public immutable lockedTokens;
    
    uint256 public lastUnlockTime;
    uint256 public epochsUnlocked;
    
    event LiquidityUnlocked(uint256 indexed epoch, uint256 tokenAmount, uint256 bnbAmount, uint256 liquidity);
    
    constructor(
        address _token,
        address _owner,
        uint256 _lockedTokens,
        uint256 _unlockDuration,
        uint256 _epochDuration,
        address _router
    ) {
        require(_token != address(0), "Invalid token");
        require(_owner != address(0), "Invalid owner");
        // Router can be zero if using PLUPair instead
        require(_lockedTokens > 0, "No tokens to lock");
        require(_unlockDuration > 0, "Invalid unlock duration");
        require(_epochDuration > 0, "Invalid epoch duration");
        require(_unlockDuration >= _epochDuration, "Duration must be >= epoch");
        
        token = _token;
        owner = _owner;
        deployer = msg.sender;
        PANCAKE_ROUTER = IPancakeRouter(_router);
        lockedTokens = _lockedTokens;
        unlockDuration = _unlockDuration;
        epochDuration = _epochDuration;
        
        totalEpochs = _unlockDuration / _epochDuration;
        require(totalEpochs > 0, "Invalid epoch calculation");
        
        unlockPerEpoch = _lockedTokens / totalEpochs;
        require(unlockPerEpoch > 0, "Unlock per epoch too small");
        
        startTime = block.timestamp;
        lastUnlockTime = block.timestamp;
    }
    
    /**
     * @notice Initialize by adding initial liquidity to AMM
     * @param initialTokenAmount Amount of tokens for initial liquidity
     */
    function initialize(uint256 initialTokenAmount) external payable {
        require(msg.sender == owner || msg.sender == deployer, "Only owner or deployer");
        require(epochsUnlocked == 0, "Already initialized");
        require(msg.value > 0, "Need BNB for liquidity");
        require(initialTokenAmount > 0, "Need tokens for liquidity");
        
        // Approve router
        IERC20(token).approve(address(PANCAKE_ROUTER), initialTokenAmount);
        
        // Add initial liquidity
        PANCAKE_ROUTER.addLiquidityETH{value: msg.value}(
            token,
            initialTokenAmount,
            0, // Accept any amount of tokens
            0, // Accept any amount of BNB
            owner, // LP tokens go to owner
            block.timestamp + 300
        );
        
        epochsUnlocked = 1; // Mark as initialized
    }
    
    /**
     * @notice Emergency function to withdraw excess tokens (for testnet/recovery)
     * @param amount Amount of tokens to withdraw
     */
    function withdrawTokens(uint256 amount) external {
        require(msg.sender == owner || msg.sender == deployer, "Only owner or deployer");
        require(amount > 0, "Invalid amount");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        
        require(IERC20(token).transfer(owner, amount), "Transfer failed");
    }
    
    /**
     * @notice Initialize with PLUPair (anti-whale enabled)
     * @param initialTokenAmount Amount of tokens for initial liquidity
     * @param _pair PLUPair address
     */
    function initializeWithPair(uint256 initialTokenAmount, address _pair) external payable {
        require(msg.sender == owner || msg.sender == deployer, "Only owner or deployer");
        require(epochsUnlocked == 0, "Already initialized");
        require(msg.value > 0, "Need BNB for liquidity");
        require(initialTokenAmount > 0, "Need tokens for liquidity");
        require(_pair != address(0), "Invalid pair");
        
        pair = _pair;
        
        // Approve pair contract
        IERC20(token).approve(_pair, initialTokenAmount);
        
        // Transfer tokens and BNB to pair
        require(IERC20(token).transfer(_pair, initialTokenAmount), "Token transfer failed");
        
        // Send BNB to pair
        (bool success, ) = _pair.call{value: msg.value}("");
        require(success, "BNB transfer to pair failed");
        
        // Mint LP tokens (pair will handle the swap)
        IPLUPair(_pair).mint(owner);
    }
    
    /**
     * @notice Unlock tokens for current epoch and inject into AMM
     * @dev Can be called by anyone, but only executes if epoch has passed
     */
    function unlockEpoch() external payable returns (uint256 tokensUnlocked) {
        require(epochsUnlocked < totalEpochs, "All epochs unlocked");
        
        uint256 epochsPassed = (block.timestamp - startTime) / epochDuration;
        require(epochsPassed > epochsUnlocked, "Epoch not ready");
        require(msg.value > 0, "Need BNB for liquidity");
        
        // Calculate how many epochs to unlock
        uint256 epochsToUnlock = epochsPassed - epochsUnlocked;
        if (epochsToUnlock > totalEpochs - epochsUnlocked) {
            epochsToUnlock = totalEpochs - epochsUnlocked;
        }
        
        tokensUnlocked = unlockPerEpoch * epochsToUnlock;
        
        // Route through PLUPair if available, otherwise use traditional router
        if (pair != address(0)) {
            // PLUPair path - transfer directly to pair
            IERC20(token).approve(pair, tokensUnlocked);
            require(IERC20(token).transfer(pair, tokensUnlocked), "Token transfer to pair failed");
            
            // Send BNB to pair
            (bool success, ) = pair.call{value: msg.value}("");
            require(success, "BNB transfer to pair failed");
            
            // Mint LP tokens via pair (pair handles fee calculation)
            IPLUPair(pair).mint(owner);
        } else {
            // Traditional router path
            // Approve router
            IERC20(token).approve(address(PANCAKE_ROUTER), tokensUnlocked);
            
            // Add liquidity
            PANCAKE_ROUTER.addLiquidityETH{value: msg.value}(
                token,
                tokensUnlocked,
                0,
                0,
                owner, // LP tokens go to owner
                block.timestamp + 300
            );
        }
        
        epochsUnlocked += epochsToUnlock;
        lastUnlockTime = block.timestamp;
        
        emit LiquidityUnlocked(epochsUnlocked, tokensUnlocked, msg.value, 0);
        
        return tokensUnlocked;
    }
    
    /**
     * @notice Get number of epochs ready to unlock
     */
    function getUnlockableEpochs() external view returns (uint256) {
        if (epochsUnlocked >= totalEpochs) return 0;
        
        uint256 epochsPassed = (block.timestamp - startTime) / epochDuration;
        if (epochsPassed <= epochsUnlocked) return 0;
        
        uint256 unlockable = epochsPassed - epochsUnlocked;
        if (unlockable > totalEpochs - epochsUnlocked) {
            unlockable = totalEpochs - epochsUnlocked;
        }
        
        return unlockable;
    }
    
    /**
     * @notice Get time until next epoch unlock
     */
    function getTimeUntilNextEpoch() external view returns (uint256) {
        if (epochsUnlocked >= totalEpochs) return 0;
        
        uint256 nextEpochTime = startTime + ((epochsUnlocked + 1) * epochDuration);
        if (block.timestamp >= nextEpochTime) return 0;
        
        return nextEpochTime - block.timestamp;
    }
    
    /**
     * @notice Get unlock progress
     */
    function getUnlockProgress() external view returns (
        uint256 _epochsUnlocked,
        uint256 _totalEpochs,
        uint256 _tokensUnlocked,
        uint256 _tokensRemaining
    ) {
        _epochsUnlocked = epochsUnlocked;
        _totalEpochs = totalEpochs;
        _tokensUnlocked = epochsUnlocked * unlockPerEpoch;
        _tokensRemaining = lockedTokens - _tokensUnlocked;
    }

    /**
     * @notice Manually add liquidity (owner-controlled)
     * @dev Allows deployer/owner to add custom liquidity amounts
     * @param tokenAmount Amount of tokens to add to pool
     */
    function manualAddLiquidity(uint256 tokenAmount) external payable {
        require(msg.sender == owner || msg.sender == deployer, "Only owner or deployer");
        require(tokenAmount > 0, "Token amount must be > 0");
        require(msg.value > 0, "ETH amount must be > 0");
        require(IERC20(token).balanceOf(address(this)) >= tokenAmount, "Insufficient token balance");

        // Approve router
        IERC20(token).approve(address(PANCAKE_ROUTER), tokenAmount);

        // Add liquidity
        (uint256 amountToken, uint256 amountETH, uint256 liquidity) = PANCAKE_ROUTER.addLiquidityETH{value: msg.value}(
            token,
            tokenAmount,
            0,
            0,
            owner,
            block.timestamp + 300
        );

        emit LiquidityUnlocked(0, amountToken, amountETH, liquidity);
    }

    /**
     * @notice Get token balance held by this controller
     */
    function getTokenBalance() external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
