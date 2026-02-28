# 📜 Smart Contract Architecture

Network: BNB Chain Testnet  
Language: Solidity  
Libraries: OpenZeppelin  

---

## 🟢 Currently Implemented Contracts

# 1️⃣ TokenFactory

## Purpose
Atomically deploy Token + LiquidityController (PLU) in a single transaction.

## Structs

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

## Functions

deployTokenV2(DeploymentConfig config) → (address token, address controller)
  - Primary entry point (deployToken V1 reverts with "Use deployTokenV2")
  - Deploys Token, then LiquidityController
  - Transfers locked tokens to controller
  - Initializes controller with initial liquidity (msg.value)

getUserDeployments(address user) → address[]
getTotalDeployments() → uint256
getDeployment(uint256 index) → Deployment

## Storage

Deployment[] public deployments;
mapping(address => address[]) public userDeployments;
mapping(address => Deployment) public deploymentInfo;

## Emits

TokenDeployed(
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
)

---

# 2️⃣ Token (ERC-20)

Simple ERC20 token.

## Features

- Fixed total supply
- Minted at deployment to a recipient (factory or controller)
- Stores deployer address (immutable)

## Constructor

Token(string name, string symbol, uint256 totalSupply, address _recipient)

No pricing logic inside token.

---

# 3️⃣ LiquidityController

## Purpose
Manages Progressive Liquidity Unlock (PLU) for a token.
Holds tokens and gradually releases them into AMM pool over time.

## State

address public immutable token;
address public immutable owner;
address public immutable deployer;
uint256 public immutable startTime;
uint256 public immutable unlockDuration;
uint256 public immutable epochDuration;
uint256 public immutable totalEpochs;
uint256 public immutable unlockPerEpoch;
uint256 public immutable lockedTokens;
uint256 public lastUnlockTime;
uint256 public epochsUnlocked;

## Functions

initialize(uint256 initialTokenAmount) payable
  - Adds initial liquidity to PancakeSwap
  - Only owner or deployer

unlockEpoch() payable → uint256 tokensUnlocked
  - Unlocks tokens for current epoch and injects into AMM
  - Callable by anyone once epoch has passed
  - Requires BNB (msg.value) for liquidity pairing

manualAddLiquidity(uint256 tokenAmount) payable
  - Owner-controlled manual liquidity addition

getUnlockableEpochs() → uint256
getTimeUntilNextEpoch() → uint256
getUnlockProgress() → (epochsUnlocked, totalEpochs, tokensUnlocked, tokensRemaining)
getTokenBalance() → uint256

## Emits

LiquidityUnlocked(uint256 indexed epoch, uint256 tokenAmount, uint256 bnbAmount, uint256 liquidity)

---

# 🔹 AMM Liquidity Plan (Current Implementation)

At deployment via deployTokenV2:

1. initialLiquidityPercent of tokens + msg.value BNB → initial PancakeSwap pool
2. Remaining tokens locked in LiquidityController
3. Tokens released epoch-by-epoch via unlockEpoch()

Price determined by AMM:
x * y = k

---

## 🟡 Planned Future Contracts (Not Yet Implemented)

The following milestone-gated escrow system and project factory tracking are described in the project vision and planned for future development to complete the architecture.

# 4️⃣ ProjectFactory

## Purpose
Deploy and track projects, potentially integrating with TokenFactory for the token/PLU layer and deploying the MilestoneEscrow.

## Struct Example

struct ProjectMeta {
    address token;
    address escrow;
    address creator;
    uint256 fundingGoal;
    uint256 deadline;
    bool goalReached;
    bool finalized;
}

## Planned Functions

createProject(
    string name,
    string symbol,
    uint256 totalSupply,
    uint256 fundingGoal,
    uint256 deadline,
    Milestone[] milestones
)

getProject(uint256 id)

## Emits

ProjectCreated(
    uint256 projectId,
    address token,
    address escrow
)

---

# 5️⃣ MilestoneEscrow

## Purpose
Manage contribution tracking, refund logic, milestone verification, and fund release.

## Planned State

address public token;
address public creator;
uint256 public fundingGoal;
uint256 public totalRaised;
uint256 public deadline;
bool public goalReached;
bool public refundsEnabled;

mapping(address => uint256) public contributions;

struct Milestone {
    string description;
    uint256 unlockAmount;
    bool verified;
    bool fundsReleased;
}

Milestone[] public milestones;
uint256 public currentMilestone;

---

# 🔹 Contribute()

Requirements:
- block.timestamp < deadline
- funding not finalized

Logic:
- contributions[msg.sender] += msg.value
- totalRaised += msg.value
- transfer tokens proportional to fixed price
- if totalRaised >= fundingGoal:
    goalReached = true

---

# 🔹 Finalize()

If deadline passed:

If totalRaised < fundingGoal:
    refundsEnabled = true

Else:
    goalReached = true

---

# 🔹 Refund()

Requirements:
- refundsEnabled == true
- contributions[msg.sender] > 0

Logic:
- return BNB
- reset contribution

---

# 🔹 Verify Milestone()

Only backend/admin wallet.

Sets:
- milestone.verified = true

---

# 🔹 Release Milestone Funds()

Requirements:
- milestone verified
- not already released

Logic:
- transfer unlockAmount to creator
- mark released
- increment currentMilestone

---

# 🔹 AMM Liquidity Plan (Post-Milestone Goal)

After goalReached:

Creator calls (or integration with TokenFactory/PLU handles this):
- approve(router)
- addLiquidity(token, BNB)

Liquidity created on PancakeSwap.

Price determined by:
x * y = k

---

# 🔐 Security Considerations

- Owner/deployer gating on initialize and manualAddLiquidity
- Epoch timing enforcement (cannot unlock before epoch passes)
- Token transfer validation during deployment
- Input validation on all config parameters
- (Future) ReentrancyGuard on refund
- (Future) Checks-Effects-Interactions pattern for escrow
- (Future) Deadline enforcement for milestones