# 🖥 Backend Architecture

Stack:
Bun (runtime)
Hono (web framework)
Ethers.js v6
Bun SQLite

Purpose:
Index events + Provide API + Verify milestones

Backend does NOT hold funds.

---

# 1️⃣ Event Indexer

Listens to:

TokenDeployed (from TokenFactory)

Planned (when MilestoneEscrow exists):
ContributionMade
MilestoneVerified
FundsReleased
RefundClaimed

Store in database.

---

# 2️⃣ Database Tables

## Projects

id
token_address
escrow_address
creator
funding_goal
total_raised
deadline
status
created_at
updated_at

## Milestones

project_id
milestone_index
description
unlock_amount
verified
released
created_at
updated_at

## Contributions

project_id
contributor
amount
tx_hash
created_at

## Sync State

key
value

---

# 3️⃣ API Endpoints

GET /projects
GET /project/:id
GET /project/:id/milestones
GET /project/:id/contributors

POST /verify-milestone

---

# 🔹 verify-milestone Flow

1. Admin submits milestone proof
2. Backend validates off-chain proof (TODO: currently accepted as-is)
3. Backend calls escrow.verifyMilestone() with admin wallet
4. Event emitted
5. DB updated

---

# 4️⃣ Frontend Integration Map

Deploy Token → Factory.deployTokenV2()

View Deployments → Backend API (GET /projects)

Verify → Backend → Escrow.verifyMilestone() *(when escrow exists)*

Release → Escrow.releaseMilestoneFunds() *(when escrow exists)*

Display stats → Backend API

---

# 🔐 Admin Role

Backend holds:
ADMIN_PRIVATE_KEY

Only used for:
verifyMilestone()

Never holds user funds.

Note: POST /verify-milestone currently has NO authentication middleware.
Any caller can invoke it. Auth must be added before production.

---

# 📈 Token Value

After deployment:

Tokens deployed with initial liquidity via LiquidityController.

Progressive Liquidity Unlock adds tokens over time:
unlockEpoch() → PancakeSwap

AMM formula:
x * y = k

Market sets price.

No backend price manipulation.