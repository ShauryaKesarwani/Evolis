// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ILiquidityController {
    function unlockEpoch() external payable returns (uint256 tokensUnlocked);
    function setEvolisPool(address _pool) external;
    function epochsUnlocked() external view returns (uint256);
    function totalEpochs() external view returns (uint256);
    function getUnlockableEpochs() external view returns (uint256);
    function lockedTokens() external view returns (uint256);
}

/**
 * @title EvolisPool
 * @notice Milestone-based crowdfunding with escrow and AMM integration.
 *
 * Flow:
 *   Phase 1 — Bonding Curve Fundraise
 *     · Users buy project tokens at a linearly rising price (or fixed if slope=0).
 *     · BNB accumulates in escrow inside this contract.
 *     · 1% platform fee + 0.5% IL fund fee deducted per purchase.
 *     · Circuit breaker watches for >20% price moves per block.
 *
 *   Phase 2 — Goal Reached
 *     · 50% of escrow BNB released to project owner immediately.
 *     · Remaining 50% stays as `liquidityEscrow` to pair with PLU unlocks.
 *     · Per-epoch BNB budget = liquidityEscrow / totalEpochs.
 *
 *   Phase 3 — PLU Epochs (post-goal)
 *     · Anyone calls triggerEpochUnlock().
 *     · EvolisPool sends epochBNBBudget to LiquidityController.unlockEpoch().
 *     · First epoch creates the PancakeSwap pool; subsequent epochs deepen it.
 *     · LP tokens from PancakeSwap flow to EvolisPool.
 *
 *   Phase 4 — Milestone
 *     · Project owner calls submitMilestone() before milestoneDeadline.
 *     · Any remaining liquidityEscrow released to project owner.
 *     · If deadline missed, backers can claimMilestoneRefund() proportionally.
 *
 * EvoLP Token (this contract IS the EvoLP ERC-20):
 *     · Minted to backers proportional to their BNB contribution after goal reached.
 *     · Represents LP ownership + IL protection eligibility.
 *
 * IL Protection:
 *     · Funded by the 0.5% fee on every bonding curve purchase.
 *     · Coverage: <30 days = 0%, 30-90 days = 50%, >90 days = 100%.
 *     · Based on price drop from entry price at time of EvoLP claim.
 */
contract EvolisPool is ERC20, ReentrancyGuard {

    // ─── ROLES ───────────────────────────────────────────────────────────────
    address public immutable projectOwner;
    address public immutable factory;

    // ─── LINKED CONTRACTS ────────────────────────────────────────────────────
    address public immutable projectToken;          // The launched token
    address public controller;                      // LiquidityController (set once post-deploy)

    // ─── BONDING CURVE ───────────────────────────────────────────────────────
    // Linear price: P(t) = initialPrice + slope * tokensSoldInCurve / 1e18
    // where initialPrice and slope are in wei per 1e18 tokens
    // Set slope = 0 for FIXED PRICE sale (matches PROJECT_PLAN.md requirement)
    uint256 public immutable bondingInitialPrice;
    uint256 public immutable bondingSlope;
    uint256 public immutable bondingSupply;         // tokens loaded into this contract for sale
    uint256 public tokensSoldInCurve;
    bool public bondingActive;

    // ─── ESCROW ──────────────────────────────────────────────────────────────
    uint256 public immutable fundingGoal;           // BNB required to reach goal
    uint256 public immutable deadline;              // fundraise deadline (unix timestamp)
    uint256 public totalRaised;                     // net BNB raised (after fees)
    uint256 public liquidityEscrow;                 // 50% retained for PLU pairing
    bool public goalReached;
    mapping(address => uint256) public contributions; // net BNB per backer (for refund math)

    // ─── MILESTONE ───────────────────────────────────────────────────────────
    uint256 public immutable milestoneDeadline;     // deadline by which milestone must be proven
    bool public milestoneAchieved;
    // 50% released on goal, 50% released on milestone (hardcoded)
    uint256 public constant MILESTONE_RELEASE_BPS = 5000;

    // ─── PLU LIQUIDITY BUDGET ────────────────────────────────────────────────
    uint256 public epochBnbBudget;                  // BNB sent to controller per epoch
    uint256 public epochBnbUsed;                    // running total sent so far

    // ─── FEES ────────────────────────────────────────────────────────────────
    uint256 public constant PLATFORM_FEE_BPS = 100; // 1% → project owner
    uint256 public constant IL_FEE_BPS = 50;         // 0.5% → IL fund
    uint256 public ilFund;                           // accumulated IL compensation pool

    // ─── CIRCUIT BREAKER ─────────────────────────────────────────────────────
    uint256 public lastCheckedPrice;
    uint256 public lastPriceBlock;
    uint256 public constant CB_THRESHOLD_BPS = 2000; // 20% move in one block → pause
    uint256 public constant CB_COOLDOWN = 1 hours;
    bool public circuitBreakerActive;
    uint256 public circuitBreakerUntil;

    // ─── IL PROTECTION ───────────────────────────────────────────────────────
    struct LpEntry {
        uint256 bnbContributed;  // net BNB this backer put in
        uint256 entryPrice;      // bonding curve price at time of EvoLP claim (wei per 1e18 tokens)
        uint256 entryTime;       // block.timestamp when EvoLP was claimed
        uint256 evolpAmount;     // EvoLP tokens minted to this backer
        bool ilClaimed;          // prevent double IL claim
    }
    mapping(address => LpEntry) public lpEntries;
    mapping(address => bool)    public evolpClaimed; // separate from contributions

    // ─── EVENTS ──────────────────────────────────────────────────────────────
    event BondingBuy(
        address indexed buyer,
        uint256 bnbIn,
        uint256 tokensOut,
        uint256 newPrice
    );
    event GoalReached(
        uint256 totalRaised,
        uint256 releasedToOwner,
        uint256 heldForLiquidity
    );
    event EpochFunded(uint256 epochBnb, uint256 tokensUnlocked);
    event MilestoneSubmitted(uint256 bnbReleased);
    event MilestoneRefundClaimed(address indexed backer, uint256 amount);
    event Refunded(address indexed user, uint256 amount);
    event EvoLPClaimed(address indexed backer, uint256 evolpAmount, uint256 entryPrice);
    event ILCompensationClaimed(address indexed lp, uint256 amount);
    event CircuitBreakerTripped(uint256 priceChangeBps, uint256 resumeAt);
    event CircuitBreakerReset();
    event ControllerSet(address indexed controller);

    // ─── MODIFIERS ───────────────────────────────────────────────────────────
    modifier notPaused() {
        _notPaused();
        _;
    }

    function _notPaused() internal {
        if (circuitBreakerActive) {
            if (block.timestamp >= circuitBreakerUntil) {
                // Auto-reset after cooldown
                circuitBreakerActive = false;
                emit CircuitBreakerReset();
            } else {
                revert("Circuit breaker: trading paused");
            }
        }
    }

    modifier onlyProjectOwner() {
        _onlyProjectOwner();
        _;
    }

    function _onlyProjectOwner() internal view {
        require(msg.sender == projectOwner, "Not project owner");
    }

    modifier onlyFactory() {
        _onlyFactory();
        _;
    }

    function _onlyFactory() internal view {
        require(msg.sender == factory, "Only factory");
    }

    // ─── CONSTRUCTOR ─────────────────────────────────────────────────────────
    /**
     * @param _lpName          EvoLP token name, e.g. "EvoLP: ProjectName"
     * @param _lpSymbol        EvoLP token symbol, e.g. "eLP-SYM"
     * @param _projectToken    Address of the launched token
     * @param _projectOwner    Campaign creator
     * @param _bondingSupply   Tokens loaded into this contract for bonding curve sale
     * @param _bondingInitialPrice  Starting price in wei per 1e18 tokens (e.g., 0.001 ether for 1 BNB = 1000 tokens)
     * @param _bondingSlope    Price increase per token sold (set to 0 for FIXED PRICE)
     * @param _fundingGoal     BNB needed (after fees) to reach goal
     * @param _deadline        Fundraise deadline timestamp
     * @param _milestoneDeadline  Deadline for project to prove milestone
     */
    constructor(
        string memory _lpName,
        string memory _lpSymbol,
        address _projectToken,
        address _projectOwner,
        uint256 _bondingSupply,
        uint256 _bondingInitialPrice,
        uint256 _bondingSlope,
        uint256 _fundingGoal,
        uint256 _deadline,
        uint256 _milestoneDeadline
    ) ERC20(_lpName, _lpSymbol) {
        require(_projectToken != address(0), "Invalid token");
        require(_projectOwner != address(0), "Invalid owner");
        require(_bondingSupply > 0, "Bonding supply must be > 0");
        require(_bondingInitialPrice > 0, "Initial price must be > 0");
        require(_fundingGoal > 0, "Funding goal must be > 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_milestoneDeadline > _deadline, "Milestone deadline must be after fund deadline");

        factory = msg.sender;
        projectToken = _projectToken;
        projectOwner = _projectOwner;
        bondingSupply = _bondingSupply;
        bondingInitialPrice = _bondingInitialPrice;
        bondingSlope = _bondingSlope;
        fundingGoal = _fundingGoal;
        deadline = _deadline;
        milestoneDeadline = _milestoneDeadline;
        bondingActive = true;
    }

    // ─── SETUP ───────────────────────────────────────────────────────────────

    /**
     * @notice Link the LiquidityController to this pool. Called by factory after deployment.
     */
    function setController(address _controller) external onlyFactory {
        require(controller == address(0), "Controller already set");
        require(_controller != address(0), "Invalid controller");
        controller = _controller;
        emit ControllerSet(_controller);
    }

    // ─── PHASE 1 — BONDING CURVE BUY ─────────────────────────────────────────

    /**
     * @notice Purchase tokens via the bonding curve during the funding phase.
     * @param minTokensOut  Minimum tokens expected (slippage protection).
     */
    function buyBondingCurve(uint256 minTokensOut) external payable nonReentrant notPaused {
        require(bondingActive, "Bonding curve not active");
        require(!goalReached, "Goal already reached");
        require(block.timestamp <= deadline, "Funding deadline passed");
        require(msg.value > 0, "Must send BNB");

        // ── Fee split ─────────────────────────────────────────────────────────
        uint256 platformFee = (msg.value * PLATFORM_FEE_BPS) / 10000;
        uint256 ilFee       = (msg.value * IL_FEE_BPS) / 10000;
        uint256 netBnb      = msg.value - platformFee - ilFee;

        ilFund += ilFee;

        // ── Bonding curve calculation ─────────────────────────────────────────
        uint256 tokensOut = _bondingTokensOut(netBnb);
        require(tokensOut > 0, "BNB too small");
        require(tokensOut >= minTokensOut, "Slippage: insufficient tokens out");
        require(tokensSoldInCurve + tokensOut <= bondingSupply, "Exceeds bonding supply");

        tokensSoldInCurve += tokensOut;
        totalRaised       += netBnb;
        contributions[msg.sender] += netBnb;

        // ── Transfer tokens to buyer ──────────────────────────────────────────
        require(
            IERC20(projectToken).transfer(msg.sender, tokensOut),
            "Token transfer failed"
        );

        // ── Forward platform fee to project owner ─────────────────────────────
        if (platformFee > 0) {
            (bool ok,) = projectOwner.call{value: platformFee}("");
            require(ok, "Platform fee transfer failed");
        }

        uint256 newPrice = _currentPrice();
        emit BondingBuy(msg.sender, msg.value, tokensOut, newPrice);

        // ── Circuit breaker check ─────────────────────────────────────────────
        _checkAndUpdateCircuitBreaker(newPrice);

        // ── Check if goal reached ─────────────────────────────────────────────
        if (totalRaised >= fundingGoal) {
            _onGoalReached();
        }
    }

    /**
     * @notice Refund if funding goal was not reached by deadline.
     */
    function refund() external nonReentrant {
        require(!goalReached, "Goal was reached - no refunds");
        require(block.timestamp > deadline, "Deadline has not passed yet");
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "Nothing to refund");

        contributions[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "Refund transfer failed");

        emit Refunded(msg.sender, amount);
    }

    // ─── PHASE 2 — GOAL REACHED (internal) ───────────────────────────────────

    function _onGoalReached() internal {
        goalReached = true;
        bondingActive = false;

        // 50% to project owner immediately, 50% stays for PLU BNB pairing
        uint256 releaseNow    = (totalRaised * MILESTONE_RELEASE_BPS) / 10000;
        liquidityEscrow       = totalRaised - releaseNow;

        // Compute BNB budget per PLU epoch
        uint256 epochs        = ILiquidityController(controller).totalEpochs();
        require(epochs > 0, "Controller not ready");
        epochBnbBudget        = liquidityEscrow / epochs;

        (bool ok,) = projectOwner.call{value: releaseNow}("");
        require(ok, "Owner release failed");

        emit GoalReached(totalRaised, releaseNow, liquidityEscrow);
    }

    // ─── PHASE 3 — PLU EPOCH TRIGGER ─────────────────────────────────────────

    /**
     * @notice Trigger a PLU epoch unlock, pairing locked tokens with escrow BNB.
     *         Callable by anyone once the epoch window has passed.
     *         First call creates the PancakeSwap pool; subsequent calls deepen it.
     */
    function triggerEpochUnlock() external nonReentrant notPaused {
        require(goalReached, "Goal not reached yet");
        require(controller != address(0), "Controller not set");

        uint256 epochs = ILiquidityController(controller).getUnlockableEpochs();
        require(epochs > 0, "No epochs ready to unlock");

        uint256 bnbToSend = epochBnbBudget * epochs;
        require(liquidityEscrow >= bnbToSend, "Insufficient escrow BNB for epoch");

        liquidityEscrow -= bnbToSend;
        epochBnbUsed     += bnbToSend;

        uint256 tokensUnlocked = ILiquidityController(controller).unlockEpoch{value: bnbToSend}();

        emit EpochFunded(bnbToSend, tokensUnlocked);
    }

    // ─── PHASE 4 — MILESTONE ─────────────────────────────────────────────────

    /**
     * @notice Project owner submits milestone as achieved.
     *         Releases remaining liquidityEscrow to project owner.
     */
    function submitMilestone() external onlyProjectOwner nonReentrant {
        require(goalReached, "Goal not reached");
        require(!milestoneAchieved, "Milestone already submitted");
        require(block.timestamp <= milestoneDeadline, "Milestone deadline passed");
        require(liquidityEscrow > 0, "No escrow left to release");

        milestoneAchieved = true;
        uint256 release   = liquidityEscrow;
        liquidityEscrow   = 0;

        (bool ok,) = projectOwner.call{value: release}("");
        require(ok, "Milestone release failed");

        emit MilestoneSubmitted(release);
    }

    /**
     * @notice If milestone deadline passed without submission, backers reclaim
     *         their proportional share of the remaining liquidityEscrow.
     */
    function claimMilestoneRefund() external nonReentrant {
        require(goalReached, "Goal not reached");
        require(!milestoneAchieved, "Milestone was achieved");
        require(block.timestamp > milestoneDeadline, "Milestone deadline not passed");

        uint256 contrib = contributions[msg.sender];
        require(contrib > 0, "No contribution or already claimed");

        // Proportional share of whatever escrow remains
        uint256 share = (contrib * liquidityEscrow) / totalRaised;
        require(share > 0, "Share is zero");

        contributions[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: share}("");
        require(ok, "Milestone refund failed");

        emit MilestoneRefundClaimed(msg.sender, share);
    }

    // ─── EvoLP — CLAIM & IL PROTECTION ───────────────────────────────────────

    /**
     * @notice Backer claims EvoLP tokens after goal is reached.
     *         EvoLP amount = contribution / totalRaised (fractional share × 1e18).
     *         Entry price is recorded for IL compensation calculations.
     */
    function claimEvoLp() external nonReentrant {
        require(goalReached, "Goal not reached");
        require(!evolpClaimed[msg.sender], "EvoLP already claimed");
        uint256 contrib = contributions[msg.sender];
        require(contrib > 0, "No contribution");

        uint256 evolpAmount   = (contrib * 1e18) / totalRaised;
        uint256 entryPrice    = _currentPrice();

        // Mark EvoLP as claimed - contributions left intact for milestone refund path
        evolpClaimed[msg.sender] = true;

        lpEntries[msg.sender] = LpEntry({
            bnbContributed: contrib,
            entryPrice:     entryPrice,
            entryTime:      block.timestamp,
            evolpAmount:    evolpAmount,
            ilClaimed:      false
        });

        _mint(msg.sender, evolpAmount);

        emit EvoLPClaimed(msg.sender, evolpAmount, entryPrice);
    }

    /**
     * @notice Calculate BNB IL compensation owed to an LP holder.
     * @dev Coverage tiers: <30d = 0%, 30-90d = 50%, >90d = 100%.
     *      Simple price-drop model: ilAmount = contribution × priceDrop%.
     */
    function calculateIlCompensation(address lp) public view returns (uint256 compensation) {
        LpEntry memory entry = lpEntries[lp];
        if (entry.evolpAmount == 0 || entry.ilClaimed) return 0;

        uint256 currentPrice = lastCheckedPrice > 0 ? lastCheckedPrice : _currentPrice();
        if (currentPrice >= entry.entryPrice) return 0; // no IL if price went up

        // Time-based coverage
        uint256 holdTime     = block.timestamp - entry.entryTime;
        uint256 coverageBps;
        if      (holdTime >= 90 days) coverageBps = 10000;
        else if (holdTime >= 30 days) coverageBps = 5000;
        else                          coverageBps = 0;

        if (coverageBps == 0) return 0;

        // IL estimate: proportional to price drop
        uint256 priceDrop    = ((entry.entryPrice - currentPrice) * 10000) / entry.entryPrice;
        uint256 rawIl        = (entry.bnbContributed * priceDrop) / 10000;
        compensation         = (rawIl * coverageBps) / 10000;

        if (compensation > ilFund) compensation = ilFund;
    }

    /**
     * @notice Claim IL compensation from the IL fund.
     */
    function claimIlCompensation() external nonReentrant {
        uint256 compensation = calculateIlCompensation(msg.sender);
        require(compensation > 0, "No IL compensation available");
        require(ilFund >= compensation, "IL fund insufficient");

        ilFund -= compensation;
        lpEntries[msg.sender].ilClaimed = true;

        (bool ok,) = msg.sender.call{value: compensation}("");
        require(ok, "IL transfer failed");

        emit ILCompensationClaimed(msg.sender, compensation);
    }

    // ─── CIRCUIT BREAKER ─────────────────────────────────────────────────────

    function _checkAndUpdateCircuitBreaker(uint256 currentPrice) internal {
        // Only check once per block
        if (lastPriceBlock == block.number) return;

        if (lastCheckedPrice > 0) {
            uint256 change;
            if (currentPrice > lastCheckedPrice) {
                change = ((currentPrice - lastCheckedPrice) * 10000) / lastCheckedPrice;
            } else {
                change = ((lastCheckedPrice - currentPrice) * 10000) / lastCheckedPrice;
            }

            if (change > CB_THRESHOLD_BPS) {
                circuitBreakerActive = true;
                circuitBreakerUntil  = block.timestamp + CB_COOLDOWN;
                emit CircuitBreakerTripped(change, circuitBreakerUntil);
            }
        }

        lastCheckedPrice = currentPrice;
        lastPriceBlock   = block.number;
    }

    // ─── BONDING CURVE MATH ───────────────────────────────────────────────────

    /**
     * @dev Current instantaneous price: initialPrice + slope × sold / 1e18.
     *      Returns price in wei per 1e18 tokens.
     *      If slope = 0, this is a FIXED PRICE sale.
     */
    function _currentPrice() internal view returns (uint256) {
        return bondingInitialPrice + (bondingSlope * tokensSoldInCurve) / 1e18;
    }

    /**
     * @dev Tokens out for a given net BNB input.
     *      Uses current price as approximation (slightly underestimates → safe for users).
     *      If slope is zero (flat price), exact result.
     */
    function _bondingTokensOut(uint256 netBnb) internal view returns (uint256) {
        uint256 price = _currentPrice();
        if (price == 0) return 0;
        return (netBnb * 1e18) / price;
    }

    // ─── VIEW FUNCTIONS ───────────────────────────────────────────────────────

    /// @notice Current bonding curve price (wei per 1e18 tokens).
    function getCurrentPrice() external view returns (uint256) {
        return _currentPrice();
    }

    /// @notice Preview how many tokens a given BNB buy would yield.
    function previewBuy(uint256 bnbIn) external view returns (uint256 tokensOut, uint256 netBnb) {
        uint256 platformFee  = (bnbIn * PLATFORM_FEE_BPS) / 10000;
        uint256 ilFeeAmount  = (bnbIn * IL_FEE_BPS) / 10000;
        netBnb               = bnbIn - platformFee - ilFeeAmount;
        tokensOut            = _bondingTokensOut(netBnb);
    }

    /// @notice Full escrow + milestone status snapshot.
    function getEscrowStatus() external view returns (
        uint256 _totalRaised,
        uint256 _fundingGoal,
        uint256 _liquidityEscrow,
        uint256 _epochBnbBudget,
        bool    _goalReached,
        bool    _milestoneAchieved
    ) {
        return (
            totalRaised,
            fundingGoal,
            liquidityEscrow,
            epochBnbBudget,
            goalReached,
            milestoneAchieved
        );
    }

    /// @notice Whether the circuit breaker is currently active.
    function isCircuitBreakerActive() external view returns (bool active, uint256 resumeAt) {
        if (circuitBreakerActive && block.timestamp < circuitBreakerUntil) {
            return (true, circuitBreakerUntil);
        }
        return (false, 0);
    }

    // ─── RECEIVE ─────────────────────────────────────────────────────────────
    receive() external payable {}
}
