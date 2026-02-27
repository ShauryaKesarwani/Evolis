# 🏗 ARCHITECTURE_SUMMARY.md

---

# 🔷 System Overview

Frontend (Next.js + Tailwind)
        ↓
Backend (Event Indexer + API)
        ↓
Smart Contracts (BNB Chain)
        ↓
TokenFactory + Token + LiquidityController

Backend does NOT custody funds.
All critical logic is on-chain.

---

# 📜 Smart Contract Layer

## 1️⃣ TokenFactory

Responsible for:
- Deploying new token + controller pairs via `deployTokenV2()`
- Tracking all deployments
- Emitting `TokenDeployed` events

Stores (per deployment):
- token address
- controller address
- owner
- timestamp
- totalSupply, initialTokens, lockedTokens

Emits:
- TokenDeployed event

---

## 2️⃣ Token (ERC-20)

Standard ERC20.

Features:
- Fixed supply
- Minted at deployment to recipient
- Stores immutable deployer address

No pricing logic inside token.

---

## 3️⃣ LiquidityController (PLU)

Progressive Liquidity Unlock controller.

### State Variables

- token
- owner
- lockedTokens
- unlockDuration
- epochDuration
- totalEpochs
- unlockPerEpoch
- epochsUnlocked

### Core Functions

initialize() — Adds initial liquidity to PancakeSwap
unlockEpoch() — Releases tokens for current epoch into AMM
manualAddLiquidity() — Owner-controlled manual injection

---

# 🔹 Deployment Flow

deployTokenV2():

1. Validate config inputs
2. Calculate token split (initialTokens vs lockedTokens)
3. Deploy Token (minted to factory temporarily)
4. Deploy LiquidityController
5. Transfer lockedTokens to controller
6. Initialize controller with initial liquidity (BNB + initialTokens)
7. Store deployment record
8. Emit TokenDeployed event

---

# 🔹 PLU (Progressive Liquidity Unlock)

unlockEpoch():

- Checks if epoch has passed
- Calculates tokens to unlock
- Pairs tokens with BNB and adds to PancakeSwap
- Updates epoch counter

---

# 📈 Token Value Architecture

Initial Sale:
- Initial liquidity added at deployment

Post-Deployment:
- Tokens progressively unlocked into PancakeSwap

AMM Formula:
x * y = k

Market sets price dynamically.

---

# 🌐 Backend Layer

## Stack

- Runtime: Bun
- Framework: Hono
- Database: Bun SQLite
- Chain client: Ethers.js v6

## Responsibilities

- Listen to TokenDeployed events (indexer)
- Index deployment data into SQLite
- Provide REST API to frontend
- Verify milestones (when MilestoneEscrow is implemented)

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
- created_at
- updated_at

Milestones:
- project_id
- milestone_index
- description
- unlock_amount
- verified
- released
- created_at
- updated_at

Contributions:
- project_id
- contributor
- amount
- tx_hash
- created_at

Sync State:
- key
- value

---

# 🔌 Frontend → System Mapping

Create Token → Factory.deployTokenV2()

View Deployments → Backend API (GET /projects)

View Details → Backend API (GET /project/:id)

Verify Milestone → Backend → Escrow.verifyMilestone() *(when escrow exists)*

Release Funds → Escrow.releaseMilestoneFunds() *(when escrow exists)*

---

# 🔐 Security Model

- Owner/deployer gating on controller functions
- Epoch timing enforcement
- Token transfer validation
- Input validation on all config parameters

---

# ⚠️ Milestone Escrow: Not Yet Implemented

The milestone-gated escrow system (contribute, refund, verifyMilestone, releaseMilestoneFunds) described in the project vision is NOT yet implemented as a contract. The current contracts cover token deployment and PLU only.

Required to complete the vision:
- MilestoneEscrow contract
- Factory integration to deploy escrow alongside token + controller

---

# 🏁 Final Architecture Statement

Tokens are atomically deployed with progressive liquidity.
Liquidity is market-driven via AMM.
Milestone accountability is planned but not yet on-chain.