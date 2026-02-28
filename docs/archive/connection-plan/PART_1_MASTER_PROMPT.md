# Part 1: Master Prompt (Understanding & Finding Connection Points)

**Use this prompt** so that any agent or developer understands the Evolis system and can locate every place frontend and backend (and contracts) must connect.

---

## The Prompt

**Context:** You are working on the Evolis hackathon project: a **milestone-gated tokenized crowdfunding protocol on BNB Chain**. The stack is:

- **Frontend:** Next.js (App Router), React, Tailwind; currently **no** wagmi/viem/ethers (MetaMask not integrated).
- **Backend:** Bun, Hono, SQLite, port 3001 (default); event indexer (optional); **does not custody funds**.
- **Contracts (current):** TokenFactory (deployTokenV2), Token (ERC-20), LiquidityController (PLU). **MilestoneEscrow is NOT yet implemented** — contribute, refund, verifyMilestone, releaseMilestoneFunds are placeholders until escrow contract exists.

**Reference docs to read:**

- `PROJECT_PLAN.md` — vision, funding model, refund logic, escrow, AMM.
- `ARCHITECTURE.md` — system overview, TokenFactory/Token/LiquidityController, DB schema, MilestoneEscrow planned.
- `BACKEND_SUMMARY.md` — stack, TokenDeployed indexer, API endpoints, x-admin-address auth, verify-milestone and release-milestone flows.
- `CONTRACTS_SUMMARY.md` — TokenFactory (deployTokenV2, getDeployment), Token, LiquidityController; MilestoneEscrow noted as not implemented.
- `UIUX.md` — pages (Home, Create Campaign, Campaign Detail, Milestone Submission, Admin, Dashboard, Connect Wallet modal), navigation, access control (founder vs admin).

**Tasks:**

1. **Search the codebase** for:
   - Every place the frontend **fetches or should fetch** data (projects list, project by id, milestones, contributors).
   - Every place the frontend **sends or should send** requests (e.g. POST verify-milestone).
   - Every place the frontend **calls or should call** the wallet (connect, switch chain, sign, sendTransaction): Navbar "Connect Wallet", Create Campaign deploy, Campaign Detail contribute/refund, Dashboard (address/balance), Admin (admin check), any "Connect Wallet" modal.
   - Every place that **depends on** connected address, chain id, or contract addresses (Factory, Escrow, Token).
   - Route and link consistency (e.g. `/campaign/[id]` vs `/project/[id]`, `/admin`, `/campaign/[id]/submit-milestone`).

2. **Map each to:**
   - **Backend API:** `GET /projects`, `GET /project/:id`, `GET /project/:id/milestones`, `GET /project/:id/contributors`, `POST /verify-milestone`, `POST /release-milestone` (both require `x-admin-address` header).
   - **Contract calls:** TokenFactory `deployTokenV2` / `getDeployment`; Escrow (contribute, refund, verifyMilestone, releaseMilestoneFunds) when MilestoneEscrow exists; token reads if needed.
   - **Environment:** Backend base URL, RPC URL, Factory address, and (for frontend) chain id and any contract addresses the UI needs.

3. **List all connection points** in a structured way and note **required frontend pages and functionality** before implementing connections. Refer to the other parts in `docs/connection-plan/` for the full breakdown.
