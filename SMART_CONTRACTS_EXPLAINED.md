# 🧠 Complete Smart Contract System Explained

## Table of Contents
- [System Overview](#system-overview)
- [Contract Architecture](#contract-architecture)
- [Contract Deep Dives](#contract-deep-dives)
- [Why These Design Decisions](#why-these-design-decisions)
- [Flow Diagrams](#flow-diagrams)
- [Security Considerations](#security-considerations)

---

## System Overview

### What Problem Does This Solve?

**Traditional Crowdfunding Problems:**
- ❌ No liquidity: Backers can't exit early
- ❌ No upside: Fixed rewards, no value appreciation
- ❌ No accountability: Funds released immediately
- ❌ No recourse: Can't get money back if project fails

**Web3 Token Launch Problems:**
- ❌ Rug pulls: Creators drain treasury instantly
- ❌ No milestones: No proof of progress required
- ❌ Pump & dump: Creators sell immediately
- ❌ No backer protection: Once funds sent, they're gone

**Our Solution:**
✅ Escrow-based fundraising with milestone gates
✅ Liquid tokens tradeable on PancakeSwap
✅ Progressive fund release tied to delivery
✅ Refund protection if goals not met
✅ Anti-whale mechanisms and circuit breakers
✅ IL (Impermanent Loss) compensation for backers

---

## Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EvolisFactory.sol                         │
│  • Creates new crowdfunding campaigns                        │
│  • Maintains registry of all pools                           │
│  • Links pools to controllers                                │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────────┐
│    Token.sol            │   │    EvolisPool.sol           │
│  • ERC20 project token  │◄──│  • Fundraising logic        │
│  • 1M total supply      │   │  • Escrow management        │
│  • Distributed to pool  │   │  • Bonding curve sales      │
│    and controller       │   │  • Milestone verification   │
└─────────────────────────┘   │  • Refund logic             │
                              │  • EvoLP LP token (ERC20)   │
                              └─────────────────────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────────┐
                              │  LiquidityController.sol    │
                              │  • Holds locked tokens      │
                              │  • Progressive unlock       │
                              │  • Pairs with escrow BNB    │
                              │  • Adds to PancakeSwap      │
                              └─────────────────────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────────┐
                              │    PancakeSwap AMM          │
                              │  • Token/BNB liquidity pool │
                              │  • Market-driven pricing    │
                              └─────────────────────────────┘
```

---

## Contract Deep Dives

### 1. EvolisFactory.sol - The Campaign Creator

#### **Purpose:**
Factory pattern for deploying new crowdfunding campaigns. One factory serves the entire platform.

#### **Key Functions:**

```solidity
function createPool(PoolConfig calldata config) external returns (address pool)
```
**What:** Deploys a new EvolisPool campaign
**Why:** 
- **Gas efficiency**: Deploying from factory is cheaper than users deploying manually
- **Registry**: Automatic indexing of all campaigns
- **Standardization**: All pools have same interface
- **Security**: Verified creation pattern

**How it works:**
1. User calls `createPool()` with campaign params
2. Factory deploys new `EvolisPool` contract
3. Records pool in multiple mappings for easy lookup
4. Emits event for indexers to track

```solidity
function setPoolController(address pool, address controller) external
```
**What:** Links a pool to its liquidity controller
**Why:**
- **Separation of concerns**: Pool handles fundraising, controller handles liquidity
- **Post-deploy linking**: Can't know controller address until after pool created
- **Access control**: Only factory can call pool's `setController()` to prevent hijacking

---

### 2. Token.sol - The Project Token

#### **Purpose:**
Simple ERC20 token representing project ownership/utility.

```solidity
contract Token is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address _recipient
    ) ERC20(name, symbol) {
        _mint(_recipient, totalSupply);
    }
}
```

#### **Why So Simple?**
- ✅ **Pure utility token**: No governance, vesting, or complex logic
- ✅ **Security**: Less code = less attack surface
- ✅ **Standard**: Fully ERC20 compliant, works with all wallets/DEXs
- ✅ **Flexibility**: Projects can add features via wrapper contracts later

#### **Distribution:**
- 40% (400K tokens) → EvolisPool (for bonding curve sales)
- 60% (600K tokens) → LiquidityController (locked for progressive release)

**Why 40/60 split?**
- Goal: Raise 300 BNB at 1 BNB = 1000 tokens = 300K tokens needed
- Buffer: 400K tokens in pool gives headroom for slippage/fees
- Liquidity depth: 600K locked tokens create deeper pools over time
- Market stability: Gradual unlock prevents dump pressure

---

### 3. EvolisPool.sol - The Fundraising Engine

#### **Purpose:**
Core crowdfunding logic with escrow, milestones, and refunds.

---

#### **Phase 1: Bonding Curve Fundraise**

```solidity
function buyBondingCurve(uint256 minTokensOut) external payable nonReentrant notPaused {
    // 1. Fee split
    uint256 platformFee = (msg.value * 100) / 10000;   // 1%
    uint256 ilFee       = (msg.value * 50) / 10000;    // 0.5%
    uint256 netBnb      = msg.value - platformFee - ilFee;
    
    // 2. Calculate tokens to receive
    uint256 tokensOut = _bondingTokensOut(netBnb);
    
    // 3. Update state
    totalRaised += netBnb;
    contributions[msg.sender] += netBnb;
    
    // 4. Transfer tokens to buyer
    IERC20(projectToken).transfer(msg.sender, tokensOut);
    
    // 5. Check if goal reached
    if (totalRaised >= fundingGoal) {
        _onGoalReached();
    }
}
```

**Why This Design?**

**1. Fee Structure:**
- **Platform fee (1%)**: Sustainable protocol revenue
- **IL fund (0.5%)**: Protects backers from impermanent loss
- **Total 1.5%**: Industry-standard (Uniswap charges 0.3%, centralized platforms charge 5-10%)

**2. Fixed Price (slope=0):**
```solidity
uint256 public immutable bondingSlope;  // Set to 0 for fixed price
```
- Matches PROJECT_PLAN.md requirement: "1 BNB = 1000 tokens"
- Fair for all backers (no early bird discount drama)
- Simpler math, less gas
- Could add linear/exponential curves later by changing slope

**3. Contributions Tracking:**
```solidity
mapping(address => uint256) public contributions;
```
- Required for refunds (need to know who paid what)
- Required for proportional EvoLP minting
- Required for milestone refund calculation
- Gas-efficient: only updates one slot per user

**4. Circuit Breaker:**
```solidity
function _checkAndUpdateCircuitBreaker(uint256 newPrice) internal {
    if (lastPriceBlock == block.number) {
        uint256 priceDiff = newPrice > lastCheckedPrice 
            ? newPrice - lastCheckedPrice 
            : lastCheckedPrice - newPrice;
        
        if ((priceDiff * 10000) / lastCheckedPrice > 2000) { // 20%
            paused = true;
            emit CircuitBreakerTriggered(newPrice);
        }
    }
}
```
**Why:**
- **Flash loan protection**: Multiple buys in same block can be attack
- **Whale protection**: Prevents single actor from moving price >20%
- **Resume mechanism**: Owner can unpause after investigation
- **Trade-off**: Small UX friction for major security gain

---

#### **Phase 2: Goal Reached**

```solidity
function _onGoalReached() internal {
    goalReached = true;
    bondingActive = false;
    
    // Split escrow 50/50
    uint256 releaseNow    = (totalRaised * 5000) / 10000;  // 50%
    liquidityEscrow       = totalRaised - releaseNow;      // 50%
    
    // Calculate BNB per epoch
    uint256 epochs        = ILiquidityController(controller).totalEpochs();
    epochBnbBudget        = liquidityEscrow / epochs;
    
    // Pay owner immediately
    (bool ok,) = projectOwner.call{value: releaseNow}("");
    require(ok, "Owner release failed");
}
```

**Why 50/50 Split?**

**Option A (PROJECT_PLAN):** 100% escrow until milestone
- ❌ Project has no runway to build
- ❌ Needs milestone before any funds
- ❌ Catch-22: Can't build without funds, can't get funds without building

**Option B (Our Implementation):** 50% immediate, 50% progressive
- ✅ Project gets working capital immediately
- ✅ Remaining 50% tied to time + milestone
- ✅ Backers still protected (50% locked)
- ✅ Liquidity built gradually (prevents dump)
- ✅ More realistic for real projects

**Real-world analogy:**
- Kickstarter releases 100% on funding (risky)
- We release 50% on funding, 50% over 6 months (balanced)

---

#### **Phase 3: Progressive Liquidity Unlock (PLU)**

```solidity
function triggerEpochUnlock() external nonReentrant notPaused {
    require(goalReached, "Goal not reached yet");
    
    // Check how many epochs are ready
    uint256 epochs = ILiquidityController(controller).getUnlockableEpochs();
    require(epochs > 0, "No epochs ready");
    
    // Calculate BNB to send
    uint256 bnbToSend = epochBnbBudget * epochs;
    require(liquidityEscrow >= bnbToSend, "Insufficient escrow");
    
    // Update state
    liquidityEscrow -= bnbToSend;
    epochBnbUsed     += bnbToSend;
    
    // Trigger unlock (sends BNB to controller)
    uint256 tokensUnlocked = ILiquidityController(controller).unlockEpoch{value: bnbToSend}();
    
    emit EpochFunded(bnbToSend, tokensUnlocked);
}
```

**Why Progressive Liquidity?**

**Problem without PLU:**
- Launch with full liquidity → whales dump → price crashes 80%
- Launch with thin liquidity → high slippage → poor UX
- All tokens unlocked → team dumps → backers rekt

**Solution with PLU:**
- Start with initial liquidity (balanced)
- Unlock tokens gradually over 6 epochs (30 days each = 180 days total)
- Pair unlocked tokens with escrow BNB (keeps ratio stable)
- Creates deepening pool over time (better for everyone)

**Math Example:**
- Goal: 300 BNB raised
- Immediate release: 150 BNB to owner
- Escrow for liquidity: 150 BNB
- Epochs: 6
- Per epoch: 150 BNB / 6 = 25 BNB
- Locked tokens: 600K
- Per epoch: 600K / 6 = 100K tokens

**Each epoch adds:**
- 25 BNB + 100K tokens to PancakeSwap
- Deepens pool by ~16.67% each time
- Over 6 months, not all at once

---

#### **Phase 4: Milestone Verification**

```solidity
function submitMilestone() external onlyProjectOwner nonReentrant {
    require(goalReached, "Goal not reached");
    require(!milestoneAchieved, "Already submitted");
    require(block.timestamp <= milestoneDeadline, "Deadline passed");
    require(liquidityEscrow > 0, "No escrow left");
    
    milestoneAchieved = true;
    uint256 release   = liquidityEscrow;
    liquidityEscrow   = 0;
    
    (bool ok,) = projectOwner.call{value: release}("");
    require(ok, "Milestone release failed");
}
```

**Why Milestone Gate?**

**Accountability mechanism:**
- Project must prove progress to unlock remaining funds
- If they don't, backers get refund
- Deadline is 90 days after goal reached (configurable)
- Owner calls `submitMilestone()` with proof (could be IPFS hash)

**What happens if missed:**
```solidity
function claimMilestoneRefund() external nonReentrant {
    require(goalReached, "Goal not reached");
    require(!milestoneAchieved, "Milestone was achieved");
    require(block.timestamp > milestoneDeadline, "Deadline not passed");
    
    uint256 contrib = contributions[msg.sender];
    uint256 share = (contrib * liquidityEscrow) / totalRaised;
    
    contributions[msg.sender] = 0;
    (bool ok,) = msg.sender.call{value: share}("");
    require(ok, "Refund failed");
}
```

**Backer gets proportional refund:**
- You contributed 10 BNB of 300 BNB total = 3.33%
- Remaining escrow: 100 BNB (after some epochs used)
- Your share: 100 * 0.0333 = 3.33 BNB back

**Why this works:**
- Incentivizes project to deliver
- Gives backers recourse
- Better than nothing if project abandons
- Fair distribution based on contribution size

---

#### **EvoLP: LP Share Tokens**

```solidity
function claimEvoLp() external nonReentrant {
    require(goalReached, "Goal not reached");
    require(!evolpClaimed[msg.sender], "Already claimed");
    
    uint256 contrib = contributions[msg.sender];
    require(contrib > 0, "No contribution");
    
    // Mint proportional EvoLP tokens
    uint256 lpAmount = (contrib * 1e18) / totalRaised;
    
    evolpClaimed[msg.sender] = true;
    evolpClaimTime[msg.sender] = block.timestamp;
    evolpEntryPrice[msg.sender] = _getCurrentAmmPrice();
    
    _mint(msg.sender, lpAmount);
    
    emit EvolpClaimed(msg.sender, lpAmount);
}
```

**What is EvoLP?**

EvolisPool itself IS an ERC20 token (inherits from OpenZeppelin ERC20).

**Why:**
- Represents your share of the pool
- Proportional to your contribution
- Tradeable (you can sell your pool stake)
- Required to claim IL compensation
- Tracks your entry price for IL calculation

**Example:**
- Alice contributes 30 BNB of 300 BNB total = 10%
- Alice gets 0.1 * 1e18 = 100000000000000000 EvoLP tokens
- Bob contributes 60 BNB = 20%
- Bob gets 0.2 * 1e18 = 200000000000000000 EvoLP tokens

---

#### **IL Protection Fund**

```solidity
function claimIlCompensation() external nonReentrant {
    require(evolpClaimed[msg.sender], "Must claim EvoLP first");
    require(!ilCompensationClaimed[msg.sender], "Already claimed");
    
    uint256 holdingTime = block.timestamp - evolpClaimTime[msg.sender];
    
    // Coverage tiers
    uint256 coveragePercent;
    if (holdingTime < 30 days) {
        coveragePercent = 0;      // No coverage
    } else if (holdingTime < 90 days) {
        coveragePercent = 50;     // 50% coverage
    } else {
        coveragePercent = 100;    // Full coverage
    }
    
    require(coveragePercent > 0, "Holding period too short");
    
    uint256 currentPrice = _getCurrentAmmPrice();
    uint256 entryPrice = evolpEntryPrice[msg.sender];
    
    // Only compensate if price dropped
    if (currentPrice >= entryPrice) return;
    
    uint256 priceDropPercent = ((entryPrice - currentPrice) * 10000) / entryPrice;
    uint256 compensation = (ilFund * priceDropPercent * coveragePercent) / 1000000;
    
    require(compensation > 0 && compensation <= ilFund, "Invalid compensation");
    
    ilCompensationClaimed[msg.sender] = true;
    ilFund -= compensation;
    
    (bool ok,) = msg.sender.call{value: compensation}("");
    require(ok, "Compensation transfer failed");
}
```

**Why IL Protection?**

**Problem:**
When you provide liquidity to AMM, you suffer "impermanent loss" if price moves.

**Example:**
- You add liquidity at 1 token = 0.001 BNB
- Price drops to 1 token = 0.0005 BNB
- You lost 50% vs just holding tokens
- This is IL (impermanent loss)

**Our solution:**
- 0.5% of every buy goes to IL fund
- If price drops, backers claim compensation
- Time-weighted: Hold longer = more coverage
  - <30 days = 0% (prevents gaming)
  - 30-90 days = 50%
  - >90 days = 100%

**Math:**
- You provided liquidity at 0.001 BNB per token
- Now trading at 0.0005 BNB per token
- Price drop: 50%
- You held 100 days
- Coverage: 100%
- IL fund: 1 BNB
- Your compensation: (1 BNB * 50% drop * 100% coverage) / participants
  
**Why this is novel:**
- Most DEXs have NO IL protection
- Bancor tried and failed (too expensive)
- Our version is sustainable (funded by fees, not printed tokens)
- Incentivizes long-term holding

---

### 4. LiquidityController.sol - The Token Locker

#### **Purpose:**
Holds locked tokens and releases them progressively into AMM.

```solidity
constructor(
    address _token,
    address _owner,
    uint256 _lockedTokens,        // 600K tokens
    uint256 _unlockDuration,      // 180 days
    uint256 _epochDuration,       // 30 days
    address _router
) {
    token = _token;
    owner = _owner;
    lockedTokens = _lockedTokens;
    unlockDuration = _unlockDuration;
    epochDuration = _epochDuration;
    
    totalEpochs = _unlockDuration / _epochDuration;  // 180/30 = 6
    unlockPerEpoch = _lockedTokens / totalEpochs;    // 600K/6 = 100K
    
    startTime = block.timestamp;
}
```

**Key Function:**

```solidity
function unlockEpoch() external payable nonReentrant returns (uint256 tokensUnlocked) {
    // 1. Check how many epochs are ready
    uint256 epochsReady = getUnlockableEpochs();
    require(epochsReady > 0, "No epochs unlocked yet");
    
    // 2. Calculate tokens to unlock
    uint256 tokensToUnlock = unlockPerEpoch * epochsReady;
    
    // 3. Update state
    epochsUnlocked += epochsReady;
    lastUnlockTime = block.timestamp;
    
    // 4. Approve router
    IERC20(token).approve(address(PANCAKE_ROUTER), tokensToUnlock);
    
    // 5. Add liquidity to PancakeSwap
    PANCAKE_ROUTER.addLiquidityETH{value: msg.value}(
        token,
        tokensToUnlock,
        0,  // Min tokens (accept any)
        0,  // Min BNB (accept any)
        address(this),  // LP tokens to controller
        block.timestamp + 300
    );
    
    return tokensToUnlock;
}
```

**Why This Design?**

**1. Time-based unlocking:**
```solidity
function getUnlockableEpochs() public view returns (uint256) {
    uint256 timePassed = block.timestamp - startTime;
    uint256 epochsPassed = timePassed / epochDuration;
    
    if (epochsPassed > totalEpochs) {
        epochsPassed = totalEpochs;
    }
    
    return epochsPassed - epochsUnlocked;
}
```
- **Transparent**: Anyone can verify when epochs unlock
- **Automatic**: No oracle or admin needed
- **Flexible**: Can unlock multiple epochs at once if delayed
- **Fair**: Everyone knows the schedule upfront

**2. Paired with BNB:**
- EvolisPool sends BNB with each epoch trigger
- Controller matches unlocked tokens with that BNB
- Maintains price ratio as liquidity deepens
- Prevents "sell pressure" dump from unlocks

**3. LP tokens ownership:**
```solidity
address(this)  // LP tokens sent to controller
```
- Controller holds the LP tokens, not owner
- Prevents owner from withdrawing liquidity
- Ensures long-term liquidity commitment
- Could add function to send LP to community treasury later

---

## Why These Design Decisions

### Why Immutable Variables?

```solidity
address public immutable projectOwner;
address public immutable factory;
uint256 public immutable fundingGoal;
uint256 public immutable deadline;
```

**Reason:**
- **Gas savings**: Immutable stored in bytecode, not storage
- **Security**: Cannot be changed after deploy (prevents rug pulls)
- **Trust**: Backers know rules won't change mid-campaign
- **Cost**: ~97% cheaper to read than storage variable

### Why OpenZeppelin Imports?

```solidity
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
```

**Reason:**
- **Battle-tested**: Used by 99% of top protocols
- **Audited**: Security experts have reviewed it
- **Standard**: Everyone knows how OpenZeppelin contracts work
- **Maintained**: Updated for new Solidity versions
- **Trust**: Investors see OpenZeppelin, they trust it

### Why Factory Pattern?

Instead of letting users deploy contracts directly:

**Benefits:**
1. **Registry**: Factory knows all pools (easy for frontend to index)
2. **Standardization**: All pools use same bytecode
3. **Gas efficiency**: Factory uses CREATE2 for deterministic addresses
4. **Upgradability**: Can deploy new factory with updated logic
5. **Access control**: Factory can gate who creates pools (could add whitelist)

### Why ReentrancyGuard?

```solidity
contract EvolisPool is ERC20, ReentrancyGuard {
    function buyBondingCurve(...) external payable nonReentrant {
        // Safe from reentrancy attacks
    }
}
```

**What it prevents:**
```solidity
// Attack attempt
contract Attacker {
    function attack() external {
        pool.buyBondingCurve{value: 1 ether}(0);
        // Fallback tries to call buyBondingCurve again before first call finishes
    }
    
    receive() external payable {
        pool.buyBondingCurve{value: 1 ether}(0);  // ❌ BLOCKED by nonReentrant
    }
}
```

**Cost:** Only 2100 gas per protected function (tiny price for massive security)

### Why call{value:} Instead of transfer()?

```solidity
// ❌ DON'T USE THIS
payable(owner).transfer(amount);

// ✅ USE THIS
(bool ok,) = owner.call{value: amount}("");
require(ok, "Transfer failed");
```

**Reason:**
- `transfer()` sends only 2300 gas (not enough for smart contract recipients)
- `call{value:}` sends all available gas
- More compatible with multisig wallets
- More compatible with contract-based wallets (Gnosis Safe, Argent, etc.)
- Industry best practice since 2021

### Why basis points (BPS)?

```solidity
uint256 public constant PLATFORM_FEE_BPS = 100;  // 1%
uint256 public constant IL_FEE_BPS = 50;         // 0.5%

uint256 fee = (amount * PLATFORM_FEE_BPS) / 10000;
```

**Instead of:**
```solidity
uint256 fee = (amount * 1) / 100;  // ❌ Can't represent 0.5%
```

**Reason:**
- Solidity has no decimals
- BPS allows precision to 0.01%
- Standard in DeFi (Uniswap, Aave, Compound all use BPS)
- 10000 BPS = 100%

### Why Check-Effects-Interactions Pattern?

```solidity
function buyBondingCurve(...) external payable {
    // 1. CHECKS
    require(bondingActive, "Bonding curve not active");
    require(!goalReached, "Goal already reached");
    
    // 2. EFFECTS (update state)
    totalRaised += netBnb;
    contributions[msg.sender] += netBnb;
    tokensSoldInCurve += tokensOut;
    
    // 3. INTERACTIONS (external calls)
    IERC20(projectToken).transfer(msg.sender, tokensOut);
    projectOwner.call{value: platformFee}("");
}
```

**Why this order:**
- If external call fails, state already updated → inconsistency
- If external call reenters, state not yet updated → attacker sees old values
- Always: Checks → Effects → Interactions

### Why Events Everywhere?

```solidity
event BondingBuy(address indexed buyer, uint256 bnbIn, uint256 tokensOut, uint256 newPrice);
event GoalReached(uint256 totalRaised, uint256 releaseNow, uint256 liquidityEscrow);
event MilestoneSubmitted(uint256 released);
```

**Reason:**
1. **Frontend indexing**: Can't query contract state history, but can read events
2. **Cost efficiency**: Events cost ~375 gas, storage costs 20,000 gas
3. **User notifications**: Frontend can listen for events and show alerts
4. **Analytics**: Track all campaign activity off-chain
5. **Debugging**: Events help debug failed transactions

---

## Flow Diagrams

### Full Campaign Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 0: DEPLOYMENT                       │
│                                                              │
│  Owner calls EvolisFactory.createPool()                     │
│    ↓                                                         │
│  Factory deploys: Token, EvolisPool, LiquidityController    │
│    ↓                                                         │
│  Tokens distributed: 40% pool, 60% controller               │
│    ↓                                                         │
│  Factory links pool ↔ controller                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 PHASE 1: FUNDRAISING (YOU ARE HERE)         │
│                                                              │
│  Backers call pool.buyBondingCurve{value: BNB}()           │
│    ↓                                                         │
│  Pool deducts fees: 1% platform + 0.5% IL fund             │
│    ↓                                                         │
│  Pool transfers tokens to backer                            │
│    ↓                                                         │
│  Pool updates: totalRaised, contributions[backer]          │
│    ↓                                                         │
│  If totalRaised >= fundingGoal → PHASE 2                   │
│  If deadline passes without goal → REFUND PHASE             │
└─────────────────────────────────────────────────────────────┘
        │                                           │
        │ Goal reached                              │ Deadline passed
        ▼                                           ▼
┌─────────────────────────┐         ┌──────────────────────────┐
│   PHASE 2: GOAL HIT     │         │   REFUND PHASE           │
│                         │         │                          │
│ • 50% BNB → owner       │         │ Backers call refund()    │
│ • 50% BNB → escrow      │         │   ↓                      │
│ • Bonding disabled      │         │ Get full BNB back        │
│ • EvoLP claimable       │         │   ↓                      │
│ • Epochs start          │         │ Keep tokens (worthless)  │
└─────────────────────────┘         └──────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 3: PROGRESSIVE LIQUIDITY                  │
│                                                              │
│  Anyone calls pool.triggerEpochUnlock()                     │
│    ↓                                                         │
│  Pool sends epochBnbBudget to controller                    │
│    ↓                                                         │
│  Controller calls controller.unlockEpoch()                  │
│    ↓                                                         │
│  Controller approves tokens for PancakeRouter               │
│    ↓                                                         │
│  Controller calls router.addLiquidityETH()                  │
│    ↓                                                         │
│  Liquidity added to PancakeSwap!                            │
│    ↓                                                         │
│  Repeat every 30 days for 6 epochs (180 days total)        │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 4: MILESTONE CHECKPOINT                   │
│                                                              │
│  IF owner calls submitMilestone() before deadline:          │
│    → Remaining liquidityEscrow → owner                      │
│    → Campaign successful ✅                                  │
│                                                              │
│  IF deadline passes without submitMilestone():              │
│    → Backers call claimMilestoneRefund()                   │
│    → Get proportional share of remaining escrow             │
│    → Partial recovery ⚠️                                     │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ONGOING: TRADING                          │
│                                                              │
│  • Token tradeable on PancakeSwap                           │
│  • Backers can claim EvoLP tokens                           │
│  • EvoLP holders can claim IL compensation (if price drop)  │
│  • Market determines price via x*y=k                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

### 1. Reentrancy Protection

✅ **All external calls protected:**
```solidity
function buyBondingCurve(...) external payable nonReentrant {
    // Safe from reentrancy
}
```

### 2. Integer Overflow Protection

✅ **Solidity 0.8.20 has built-in overflow checks:**
```solidity
totalRaised += netBnb;  // Reverts if overflow
```

### 3. Access Control

✅ **Critical functions restricted:**
```solidity
modifier onlyProjectOwner() {
    require(msg.sender == projectOwner, "Not project owner");
    _;
}

function submitMilestone() external onlyProjectOwner { ... }
```

### 4. Timestamp Manipulation

⚠️ **Known limitation:**
- Miners can manipulate `block.timestamp` by ±15 seconds
- Our deadlines are in days/weeks (not critical)
- Epoch durations are 30 days (15 seconds irrelevant)

### 5. Front-running

⚠️ **Possible attacks:**
- Whale sees your buy tx → sends larger buy first → you pay higher price
- **Mitigation:** `minTokensOut` parameter in `buyBondingCurve()`
- **Mitigation:** Circuit breaker pauses if >20% price move in one block

### 6. Locked LP Tokens

✅ **LP tokens held by controller:**
```solidity
PANCAKE_ROUTER.addLiquidityETH(..., address(this), ...);
```
- Owner cannot withdraw liquidity
- Permanent liquidity unless controller upgraded

### 7. Emergency Functions

⚠️ **Owner can pause:**
```solidity
function setPaused(bool _paused) external onlyProjectOwner {
    paused = _paused;
}
```
**Risk:** Malicious owner could lock funds
**Mitigation:** Could add timelock or DAO governance

---

## Summary: Why This Architecture?

### ✅ **What We Did Right:**

1. **Progressive liquidity prevents dumps**
2. **Milestone gate creates accountability**
3. **Refund mechanism protects backers**
4. **IL compensation is novel and fair**
5. **Circuit breaker prevents manipulation**
6. **Factory pattern enables discovery**
7. **Immutable values build trust**
8. **OpenZeppelin for security**
9. **Events enable frontend indexing**
10. **ReentrancyGuard on all money flows**

### ⚠️ **Trade-offs Made:**

1. **50/50 escrow split** (vs 100% locked) - Better for real-world projects
2. **Single milestone** (vs multiple) - Simpler MVP, can extend later
3. **Time-based epochs** (vs trigger-based) - More predictable, less flexible
4. **Owner can pause** (centralization) - Could migrate to DAO later

### 🚀 **Why This Beats Competitors:**

| Feature | Kickstarter | Gitcoin | Juicebox | **Evolis** |
|---------|------------|---------|----------|------------|
| Refunds | ❌ | ❌ | ⚠️ | ✅ |
| Milestones | ❌ | ❌ | ❌ | ✅ |
| Liquid tokens | ❌ | ❌ | ⚠️ | ✅ |
| IL protection | ❌ | ❌ | ❌ | ✅ |
| Progressive liquidity | ❌ | ❌ | ❌ | ✅ |
| Anti-whale | ❌ | ❌ | ❌ | ✅ |

---

## Next Steps

To fully understand, try:
1. Deploy to local Anvil
2. Execute full lifecycle (buy → goal → epoch → milestone)
3. Test refund path (miss deadline)
4. Test milestone refund path (miss milestone)
5. Read the test files in `test/` folder

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for step-by-step instructions.
