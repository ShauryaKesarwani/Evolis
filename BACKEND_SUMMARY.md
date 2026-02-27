# 🖥 Backend Architecture

Stack:
Node.js
Express
Ethers.js
PostgreSQL (or SQLite for hackathon)

Purpose:
Index events + Verify milestones

Backend does NOT hold funds.

---

# 1️⃣ Event Indexer

Listen to:

ProjectCreated
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

## Milestones

project_id
description
unlock_amount
verified
released

## Contributions

project_id
contributor
amount

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
2. Backend validates off-chain proof
3. Backend calls escrow.verifyMilestone()
4. Event emitted
5. DB updated

---

# 4️⃣ Frontend Integration Map

Create Project → Factory.createProject()

Contribute → Escrow.contribute()

Refund → Escrow.refund()

Verify → Backend → Escrow.verifyMilestone()

Release → Escrow.releaseMilestoneFunds()

Display stats → Backend API

---

# 🔐 Admin Role

Backend holds:
ADMIN_PRIVATE_KEY

Only used for:
verifyMilestone()

Never holds user funds.

---

# 📈 Token Value

After funding success:

Frontend prompts creator:
"Add liquidity to PancakeSwap?"

Liquidity added via Router:
addLiquidityETH()

AMM formula:
x * y = k

Market sets price.

No backend price manipulation.