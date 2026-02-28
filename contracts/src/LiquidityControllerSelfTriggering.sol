// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LiquidityControllerSelfTriggering
 * @notice Self-triggering automatic unlock - NO EXTERNAL SERVICE NEEDED
 * @dev Automatically detects when epoch is due and executes on next interaction
 * 
 * HOW IT WORKS:
 * 1. Time passes → Epoch becomes ready
 * 2. User/bot calls ANY function on contract
 * 3. Contract auto-detects: "Is it time to unlock?"
 * 4. YES → Automatically releases tokens before function executes
 * 5. User gets their function result (unlock already happened behind scenes)
 * 
 * NO CHAINLINK, NO BOTS, NO EXTERNAL SERVICES NEEDED
 * Just time + interaction = automatic unlock
 */

interface IPancakeRouterV3 {
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);
}

contract LiquidityControllerSelfTriggering {
    // State variables
    IPancakeRouterV3 public immutable PANCAKE_ROUTER;
    
    address public immutable token;
    address public immutable owner;
    address public immutable deployer;
    
    uint256 public immutable startTime;
    uint256 public immutable unlockDuration;
    uint256 public immutable epochDuration;
    uint256 public immutable totalEpochs;
    uint256 public immutable unlockPerEpoch;
    uint256 public immutable lockedTokens;
    
    // Pre-allocated ETH for each unlock (set at initialization)
    uint256 public ethPerUnlock;
    
    // Mutable state
    uint256 public epochsUnlocked;
    uint256 public lastUnlockTime;
    uint256 public ethAccumulated;
    
    event LiquidityUnlocked(
        uint256 indexed epoch, 
        uint256 tokenAmount, 
        uint256 bnbAmount, 
        uint256 liquidity,
        bool autoTriggered
    );
    
    event ETHDeposited(uint256 amount);
    
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
        require(_router != address(0), "Invalid router");
        require(_lockedTokens > 0, "No tokens to lock");
        require(_unlockDuration > 0, "Invalid unlock duration");
        require(_epochDuration > 0, "Invalid epoch duration");
        require(_unlockDuration >= _epochDuration, "Duration must be >= epoch");
        
        token = _token;
        owner = _owner;
        deployer = msg.sender;
        PANCAKE_ROUTER = IPancakeRouterV3(_router);
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
     * @notice Initialize with initial liquidity
     * @param initialTokenAmount Tokens for initial liquidity
     */
    function initialize(uint256 initialTokenAmount) external payable {
        require(msg.sender == owner || msg.sender == deployer, "Only owner/deployer");
        require(epochsUnlocked == 0, "Already initialized");
        require(msg.value > 0, "Need ETH");
        require(initialTokenAmount > 0, "Need tokens");
        
        // Calculate ETH per unlock for future epochs
        // Example: if 1 ETH total, and 30 epochs, 1/30 ETH per unlock
        uint256 remainingUnlockEpochs = totalEpochs - 1;  // First epoch happens now, rest later
        ethPerUnlock = msg.value / (remainingUnlockEpochs > 0 ? remainingUnlockEpochs : 1);
        ethAccumulated = msg.value;
        
        // Approve router
        IERC20(token).approve(address(PANCAKE_ROUTER), initialTokenAmount);
        
        // Add initial liquidity
        PANCAKE_ROUTER.addLiquidityETH{value: ethPerUnlock}(
            token,
            initialTokenAmount,
            0,
            0,
            owner,
            block.timestamp + 300
        );
        
        ethAccumulated -= ethPerUnlock;
        lastUnlockTime = block.timestamp;
    }
    
    /**
     * @notice AUTOMATIC: Check and execute pending unlocks
     * @dev Called internally before ANY function execution
     * This is the MAGIC - automatically releases tokens when time is ready
     * NO EXTERNAL SERVICE, NO CHAINLINK, NO BOT NEEDED
     */
    function _autoCheckAndUnlock() internal {
        // Already unlocked all? Skip
        if (epochsUnlocked >= totalEpochs) return;
        
        // Is it time for next unlock?
        uint256 epochsPassed = (block.timestamp - startTime) / epochDuration;
        if (epochsPassed <= epochsUnlocked) return;
        
        // Do we have ETH available?
        if (ethAccumulated < ethPerUnlock) return;
        
        // YES! Auto-unlock
        _executeUnlock();
    }
    
    /**
     * @notice Internal: Execute the actual unlock
     */
    function _executeUnlock() internal {
        uint256 epochsPassed = (block.timestamp - startTime) / epochDuration;
        
        // Calculate epochs to unlock
        uint256 epochsToUnlock = epochsPassed - epochsUnlocked;
        if (epochsToUnlock > totalEpochs - epochsUnlocked) {
            epochsToUnlock = totalEpochs - epochsUnlocked;
        }
        
        uint256 tokensToUnlock = unlockPerEpoch * epochsToUnlock;
        uint256 ethToUse = ethPerUnlock * epochsToUnlock;
        
        // Safety check
        if (tokensToUnlock == 0 || ethToUse == 0) return;
        if (ethAccumulated < ethToUse) ethToUse = ethAccumulated;
        
        // Approve router
        IERC20(token).approve(address(PANCAKE_ROUTER), tokensToUnlock);
        
        // Add liquidity (HAPPENS AUTOMATICALLY!)
        (,, uint256 liquidity) = PANCAKE_ROUTER.addLiquidityETH{value: ethToUse}(
            token,
            tokensToUnlock,
            0,
            0,
            owner,
            block.timestamp + 300
        );
        
        // Update state
        epochsUnlocked += epochsToUnlock;
        lastUnlockTime = block.timestamp;
        ethAccumulated -= ethToUse;
        
        emit LiquidityUnlocked(epochsUnlocked, tokensToUnlock, ethToUse, liquidity, true);
    }
    
    // ========== PUBLIC FUNCTIONS (All trigger auto-unlock) ==========
    
    /**
     * @notice Get unlock progress
     * Automatically checks and unlocks if needed first!
     */
    function getUnlockProgress() external returns (
        uint256 _epochsUnlocked,
        uint256 _totalEpochs,
        uint256 _tokensUnlocked,
        uint256 _tokensRemaining
    ) {
        _autoCheckAndUnlock();  // ✨ AUTOMATIC UNLOCK HAPPENS HERE
        
        _epochsUnlocked = epochsUnlocked;
        _totalEpochs = totalEpochs;
        _tokensUnlocked = epochsUnlocked * unlockPerEpoch;
        _tokensRemaining = lockedTokens - _tokensUnlocked;
    }
    
    /**
     * @notice Get time until next unlock
     * Automatically checks and unlocks if needed first!
     */
    function getTimeUntilNextUnlock() external returns (uint256) {
        _autoCheckAndUnlock();  // ✨ AUTOMATIC UNLOCK HAPPENS HERE
        
        if (epochsUnlocked >= totalEpochs) return 0;
        
        uint256 nextEpochTime = startTime + ((epochsUnlocked + 1) * epochDuration);
        if (block.timestamp >= nextEpochTime) return 0;
        
        return nextEpochTime - block.timestamp;
    }
    
    /**
     * @notice Get current status
     * Automatically checks and unlocks if needed first!
     */
    function getStatus() external returns (
        uint256 nextEpochReady,
        uint256 etherAvailable,
        uint256 tokenBalance
    ) {
        _autoCheckAndUnlock();  // ✨ AUTOMATIC UNLOCK HAPPENS HERE
        
        nextEpochReady = startTime + ((epochsUnlocked + 1) * epochDuration);
        etherAvailable = ethAccumulated;
        tokenBalance = IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @notice Deposit additional ETH for future unlocks
     */
    function depositETHForUnlocks() external payable {
        require(msg.value > 0, "No ETH sent");
        ethAccumulated += msg.value;
        emit ETHDeposited(msg.value);
        _autoCheckAndUnlock();  // ✨ Trigger auto-unlock after deposit
    }
    
    /**
     * @notice Helper: Direct interaction to trigger auto-unlock
     * Call this anytime to force check + unlock if needed
     * No parameters, no complexity, just: "Check if it's time, if yes, unlock"
     */
    function checkAndUnlock() external {
        _autoCheckAndUnlock();  // ✨ AUTOMATIC UNLOCK HAPPENS HERE
    }
    
    /**
     * @notice Manual unlock (fallback if needed)
     */
    function manualUnlock() external payable {
        require(msg.sender == owner, "Only owner");
        require(epochsUnlocked < totalEpochs, "All unlocked");
        require(block.timestamp >= startTime + ((epochsUnlocked + 1) * epochDuration), "Not yet time");
        
        if (msg.value > 0) {
            ethAccumulated += msg.value;
        }
        
        _executeUnlock();
    }
    
    // ========== VIEW FUNCTIONS (No auto-trigger) ==========
    
    function getTokenBalance() external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    function getEpochsUnlocked() external view returns (uint256) {
        return epochsUnlocked;
    }
    
    function getEthAvailable() external view returns (uint256) {
        return ethAccumulated;
    }
    
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
    
    // Allow receiving ETH
    receive() external payable {
        ethAccumulated += msg.value;
        emit ETHDeposited(msg.value);
        _autoCheckAndUnlock();  // ✨ Trigger auto-unlock when ETH received
    }
}
