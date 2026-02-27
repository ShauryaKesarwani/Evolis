# 🔌 FRONTEND_BACKEND_CONNECTION_PLAN.md (UPDATED)

This document outlines the final integration architecture after the post-audit fixes.

---

## 🛠 Backend Stack
- **Runtime**: Bun
- **Framework**: Hono
- **Port**: 3001
- **DB**: Bun SQLite

---

## 🔗 Connection Map

### 1. Project Indexing
- **Contract**: `TokenFactory`
- **Event**: `TokenDeployed` (NOT `ProjectCreated`)
- **Action**: Indexer polls and calls `getDeployment(index)`.
- **Mapping**: 
  - `controller` -> `escrow_address`
  - `owner` -> `creator`
  - `totalSupply` -> `funding_goal` (placeholder)

### 2. Campaign Display
- **Route**: `/campaign/[id]`
- **Fetch**: `GET http://localhost:3001/project/:id`
- **Link from Card**: `/campaign/${id}`

### 3. Milestone Submission
- **Route**: `/campaign/[id]/submit-milestone`
- **Creator Check**: Frontend gates by comparing connected wallet.

### 4. Milestone Verification (Admin)
- **Route**: `/admin`
- **Action**: Admin verifies proof and triggers:
  - `POST http://localhost:3001/verify-milestone` (Requires `x-admin-address` header)
- **Follow-up**: After verification, admin triggers:
  - `POST http://localhost:3001/release-milestone`

---

## 🔐 Auth & Security
- **Admin**: Routes gated by `x-admin-address` header check against derived address of `ADMIN_PRIVATE_KEY`.
- **Funds**: Remain locked in `LiquidityController` or `MilestoneEscrow` (future).

---

## ⚠️ Notes
- `total_raised` is currently `null` as current contracts focus on liquidity deployment rather than sale.
- `escrowAbi` functions require a `MilestoneEscrow` contract to be deployed.
