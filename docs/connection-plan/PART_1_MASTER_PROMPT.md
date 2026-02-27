# Part 1: Master Prompt (Understanding & Finding Connection Points)

**Use this prompt** so that any agent or developer understands the Evolis system and can locate every place frontend and backend (and contracts) must connect.

---

## The Prompt

**Context:** You are working on the Evolis hackathon project: a **milestone-gated tokenized crowdfunding protocol on BNB Chain**. The stack is:

- **Frontend:** Next.js (App Router), React, Tailwind; currently **no** wagmi/viem/ethers (MetaMask not integrated).
- **Backend:** Node/Bun, Hono, SQLite; event indexer (optional); **does not custody funds**.
- **Contracts (per ARCHITECTURE):** ProjectFactory (deploy projects), UtilityToken (BEP-20), MilestoneEscrow (contributions, refunds, milestone verify/release).  
  *(Note: The `contracts/` folder currently contains TokenFactory/Token/LiquidityController for a different PLU model; backend ABIs and indexer expect ProjectFactory + Escrow semantics. Align deployment and ABIs accordingly.)*

**Reference docs to read:**

- `PROJECT_PLAN.md` — vision, funding model, refund logic, escrow, AMM.
- `ARCHITECTURE.md` — system overview, contract roles, Frontend → Contract mapping, DB schema.
- `BACKEND_SUMMARY.md` — stack, indexer events, API endpoints, verify-milestone flow, admin role.
- `CONTRACTS_SUMMARY.md` — ProjectFactory struct/functions, UtilityToken, MilestoneEscrow (contribute, finalize, refund, verifyMilestone, releaseMilestoneFunds).
- `UIUX.md` — pages (Home, Create Campaign, Campaign Detail, Milestone Submission, Admin, Dashboard, Connect Wallet modal), navigation, access control (founder vs admin).

**Tasks:**

1. **Search the codebase** for:
   - Every place the frontend **fetches or should fetch** data (projects list, project by id, milestones, contributors).
   - Every place the frontend **sends or should send** requests (e.g. POST verify-milestone).
   - Every place the frontend **calls or should call** the wallet (connect, switch chain, sign, sendTransaction): Navbar "Connect Wallet", Create Campaign deploy, Campaign Detail contribute/refund, Dashboard (address/balance), Admin (admin check), any "Connect Wallet" modal.
   - Every place that **depends on** connected address, chain id, or contract addresses (Factory, Escrow, Token).
   - Route and link consistency (e.g. `/campaign/[id]` vs `/project/[id]`, `/admin`, `/campaign/[id]/submit-milestone`).

2. **Map each to:**
   - **Backend API:** `GET /projects`, `GET /project/:id`, `GET /project/:id/milestones`, `GET /project/:id/contributors`, `POST /verify-milestone`.
   - **Contract calls:** Factory `createProject` / `getProject`, Escrow `contribute` / `refund` / `verifyMilestone` / `releaseMilestoneFunds`, and token reads if needed.
   - **Environment:** Backend base URL, RPC URL, Factory address, and (for frontend) chain id and any contract addresses the UI needs.

3. **List all connection points** in a structured way and note **required frontend pages and functionality** before implementing connections. Refer to the other parts in `docs/connection-plan/` for the full breakdown.
