# 🏗 ARCHITECTURE_SUMMARY.md

---

# 🔷 System Overview

Frontend (Next.js + wagmi)
        ↓
Backend (Event Indexer + Verification Service)
        ↓
Smart Contracts (BNB Chain)
        ↓
Escrow + Token + Factory

Backend does NOT custody funds.
All critical logic is on-chain.

---

# 📜 Smart Contract Layer

## 1️⃣ ProjectFactory

Responsible for:
- Deploying new projects
- Deploying token + escrow
- Tracking project metadata

Stores:
- token address
- escrow address
- creator
- funding goal
- deadline

Emits:
- ProjectCreated event

---

## 2️⃣ UtilityToken (BEP-20)

Standard ERC20.

Features:
- Fixed supply
- Minted at deployment
- Sale allocation sent to Escrow
- Optional team lock

No pricing logic inside token.

---

## 3️⃣ MilestoneEscrow

Core contract.

### State Variables

- token
- creator
- fundingGoal
- totalRaised
- deadline
- goalReached
- refundsEnabled

### Contribution Tracking

mapping(address => uint256) contributions;

---

# 🔹 Contribution Flow

contribute():

- Must be before deadline
- Increases totalRaised
- Transfers tokens to supporter
- If totalRaised >= fundingGoal → goalReached = true

---

# 🔹 Finalization Logic

After deadline:

If totalRaised < fundingGoal:
- refundsEnabled = true

If totalRaised >= fundingGoal:
- milestone phase begins

---

# 🔹 Refund Flow

refund():

Requirements:
- refundsEnabled == true
- user contributed > 0

Action:
- Return BNB
- Reset contribution record

---

# 🔹 Milestone Logic

struct Milestone:
- description
- unlockAmount
- verified
- fundsReleased

verifyMilestone():
- Only backend admin wallet

releaseMilestoneFunds():
- Transfers unlockAmount to creator
- Moves to next milestone

---

# 🌐 Backend Layer

## Responsibilities

- Listen to contract events
- Index project data
- Provide API to frontend
- Verify milestone completion
- Call verifyMilestone()

Backend never holds user funds.

---

# 🗄 Database Schema

Projects:
- id
- token_address
- escrow_address
- creator
- funding_goal
- total_raised
- deadline
- status

Milestones:
- project_id
- description
- unlock_amount
- verified
- released

Contributions:
- project_id
- contributor
- amount

---

# 🔌 Frontend → Contract Mapping

Create Project → Factory.createProject()

Contribute → Escrow.contribute()

Refund → Escrow.refund()

Verify Milestone → Backend → Escrow.verifyMilestone()

Release Funds → Escrow.releaseMilestoneFunds()

Fetch Data → Backend API

---

# 📈 Token Value Architecture

Initial Sale:
- Fixed price

Post-Sale:
- Add liquidity to PancakeSwap

AMM Formula:
x * y = k

Market sets price dynamically.

---

# 🔐 Security Model

- ReentrancyGuard on refund
- Deadline enforcement
- Escrow isolation
- Backend cannot move funds
- Only verified milestones release capital

---

# 🏁 Final Architecture Statement

Funds are programmatically locked.
Capital is milestone-gated.
Refunds are automatic.
Liquidity is market-driven.

Accountability + Liquidity + Utility.