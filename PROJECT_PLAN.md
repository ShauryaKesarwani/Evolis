# 🚀 PROJECT_PLAN.md
## Milestone-Based Tokenized Crowdfunding on BNB Chain

---

# 🎯 Vision

Build a decentralized crowdfunding protocol where:

- Startups raise funds without equity
- Supporters receive utility tokens
- Funds are locked in escrow
- Capital is released only after milestone verification
- Refunds are available if funding goal is not met
- Tokens gain market value via AMM (x * y = k)

---

# 🧩 Problem

Traditional crowdfunding:
- No liquidity
- No upside
- Funds released instantly

Web3 token launches:
- No accountability
- Instant treasury access
- High rug-pull risk

We combine:
Crowdfunding + Escrow + Milestones + AMM liquidity.

---

# 💡 Core Mechanism

1. Startup creates project
2. Sets:
   - Token supply
   - Funding goal
   - Deadline
   - Milestones
3. Supporters buy tokens
4. Funds stored in escrow
5. If goal not reached → refunds enabled
6. If goal reached → milestone phase
7. Funds released progressively
8. Liquidity added to AMM

---

# 💰 Funding Model

## Fixed Price Sale

Example:
1 BNB = 1000 Tokens

- Funding goal required
- Deadline enforced
- Contributions tracked per address

---

# 🔁 Refund Logic

Refund allowed if:
- Deadline passed
- Funding goal not reached

Refund returns:
- Full contributed BNB

Tokens:
- Remain with supporter (become non-functional if project fails)

---

# 🧱 Escrow Model

Escrow holds:
- All contributed BNB

Funds are released only when:
- Milestone verified by backend admin
- releaseMilestoneFunds() called

Prevents:
- Immediate treasury drain
- Rug pull

---

# 📈 Token Value Logic (AMM Model)

After successful funding:

Project adds liquidity to PancakeSwap:

x * y = k

Where:
- x = token reserve
- y = BNB reserve

Price = y / x

Pure market-driven pricing.
No predictive algorithms.
No manipulation.

---

# 🔐 Regulatory Positioning

Token represents:
- Utility
- Participation
- Governance
- Access

Token does NOT represent:
- Equity
- Revenue share
- Profit claim
- Dividend rights

---

# 🛠 Hackathon Deliverables

- Factory Contract
- Utility Token (BEP-20)
- Milestone Escrow
- Refund logic
- Funding goal enforcement
- Deadline logic
- Backend indexer
- Milestone verification API
- AMM liquidity integration plan

---

# 🏁 Final Summary

A milestone-gated, refund-protected, AMM-liquid crowdfunding protocol on BNB Chain enabling startups to bootstrap without equity while protecting supporters through programmable escrow.