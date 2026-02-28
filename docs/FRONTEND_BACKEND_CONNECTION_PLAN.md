# Frontend–Backend Connection Plan

This document outlines the integration architecture and points to **executable parts** in `docs/connection-plan/`.

---

## Current Stack

- **Backend:** Bun, Hono, port 3001 (default), Bun SQLite
- **Contracts:** TokenFactory + Token + LiquidityController (PLU). MilestoneEscrow **not yet implemented**.

---

## Connection Map (Summary)

### 1. Project Indexing
- **Contract:** TokenFactory
- **Event:** TokenDeployed (NOT ProjectCreated)
- **Action:** Indexer polls TokenDeployed, calls `getDeployment(index)`
- **Mapping:** controller → escrow_address, owner → creator, totalSupply → funding_goal (placeholder)

### 2. Campaign Display
- **Route:** `/campaign/[id]`
- **Fetch:** `GET http://localhost:3001/project/:id`
- **Link from Card:** `/campaign/${id}` (fixed)

### 3. Milestone Submission
- **Route:** `/campaign/[id]/submit-milestone` (page exists)
- **Creator Check:** Frontend gates by comparing connected wallet to project.creator

### 4. Milestone Verification (Admin)
- **Route:** `/admin`
- **Verify:** `POST /verify-milestone` with `x-admin-address` header (required). Body: `{ projectId, milestoneIndex }` — milestoneIndex is required.
- **Release:** `POST /release-milestone` (separate step) with same header. Body: `{ projectId, milestoneIndex }`

---

## Auth & Security

- **Admin:** Routes gated by `x-admin-address` header matching `ADMIN_PRIVATE_KEY`–derived address.
- **Funds:** In LiquidityController today; MilestoneEscrow (contribute, refund) when implemented.

---

## Executable Parts (`docs/connection-plan/`)

| Part | File | Purpose |
|------|------|---------|
| 0 | PART_0_INDEX.md | Execution order, quick reference |
| 1 | PART_1_MASTER_PROMPT.md | Master prompt for agents |
| 2 | PART_2_METAMASK_WALLET.md | MetaMask integration |
| 3 | PART_3_BACKEND_API.md | Backend API wiring |
| 4 | PART_4_SMART_CONTRACTS.md | Smart contract wiring |
| 5 | PART_5_ROUTES_AND_LINKS.md | Route/link fixes |
| 6 | PART_6_ENVIRONMENT.md | Environment config |
| 7 | PART_7_PAGE_REQUIREMENTS.md | Per-page checklist |

---

## Notes

- `total_raised` is `null` — current contracts focus on liquidity deployment, not contribution sale.
- EscrowAbi (contribute, refund, verifyMilestone, releaseMilestoneFunds) requires MilestoneEscrow to be deployed; backend has placeholders.
