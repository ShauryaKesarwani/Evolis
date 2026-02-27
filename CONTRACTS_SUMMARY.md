# 📜 Smart Contract Architecture

Network: BNB Chain Testnet  
Language: Solidity  
Libraries: OpenZeppelin  

---

# 1️⃣ ProjectFactory

## Purpose
Deploy and track projects.

## Struct

struct ProjectMeta {
    address token;
    address escrow;
    address creator;
    uint256 fundingGoal;
    uint256 deadline;
    bool goalReached;
    bool finalized;
}

## Functions

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

# 2️⃣ UtilityToken (BEP-20)

Standard ERC20 token.

## Features

- Fixed total supply
- Minted at deployment
- Sale allocation sent to Escrow
- Team allocation locked

No pricing logic inside token.

---

# 3️⃣ MilestoneEscrow

## State

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

# 🔹 AMM Liquidity Plan

After goalReached:

Creator calls:
- approve(router)
- addLiquidity(token, BNB)

Liquidity created on PancakeSwap.

Price determined by:
x * y = k

---

# 🔐 Security Considerations

- ReentrancyGuard on refund
- Checks-Effects-Interactions pattern
- Deadline enforcement
- Locked team allocation