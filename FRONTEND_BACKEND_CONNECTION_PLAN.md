# Frontend–Backend Connection Plan

This document provides: (1) a **master prompt** for understanding the system and finding connection points, (2) a **full list of connection points** between frontend, backend API, and smart contracts, and (3) **required frontend pages and functionality** before connecting frontend to backend. No code changes are made here—analysis only.

---

## Part 1: Master Prompt (Understanding & Finding Connection Points)

Use the following prompt so that any agent or developer understands the system and can locate every place frontend and backend (and contracts) must connect:

---

**Context:** You are working on the Evolis hackathon project: a **milestone-gated tokenized crowdfunding protocol on BNB Chain**. The stack is:

- **Frontend:** Next.js (App Router), React, Tailwind; currently **no** wagmi/viem/ethers (MetaMask not integrated).
- **Backend:** Node/Bun, Hono, SQLite; event indexer (optional); **does not custody funds**.
- **Contracts (per ARCHITECTURE):** ProjectFactory (deploy projects), UtilityToken (BEP-20), MilestoneEscrow (contributions, refunds, milestone verify/release).  
  _(Note: The `contracts/` folder currently contains TokenFactory/Token/LiquidityController for a different PLU model; backend ABIs and indexer expect ProjectFactory + Escrow semantics. Align deployment and ABIs accordingly.)_

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
   - Every place the frontend **calls or should call** the wallet (connect, switch chain, sign, sendTransaction): Navbar “Connect Wallet”, Create Campaign deploy, Campaign Detail contribute/refund, Dashboard (address/balance), Admin (admin check), any “Connect Wallet” modal.
   - Every place that **depends on** connected address, chain id, or contract addresses (Factory, Escrow, Token).
   - Route and link consistency (e.g. `/campaign/[id]` vs `/project/[id]`, `/admin`, `/campaign/[id]/submit-milestone`).

2. **Map each to:**
   - **Backend API:** `GET /projects`, `GET /project/:id`, `GET /project/:id/milestones`, `GET /project/:id/contributors`, `POST /verify-milestone`.
   - **Contract calls:** Factory `createProject` / `getProject`, Escrow `contribute` / `refund` / `verifyMilestone` / `releaseMilestoneFunds`, and token reads if needed.
   - **Environment:** Backend base URL, RPC URL, Factory address, and (for frontend) chain id and any contract addresses the UI needs.

3. **List all connection points** in a structured way (see Part 2 below) and note **required frontend pages and functionality** (see Part 3) before implementing connections.

---

## Part 2: Connection Points (Full List)

### 2.1 MetaMask / Wallet Integration (First Priority)

| #   | Location                                                       | Purpose                                                                  | Connects To                                                                                         |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 1   | `frontend/src/components/Navbar.tsx`                           | “Connect Wallet” button (currently static)                               | Wallet provider (e.g. wagmi + MetaMask). On connect: store address, chain; show disconnect/address. |
| 2   | Global / layout                                                | Connect Wallet **modal** (UIUX: overlay, not a page)                     | Same provider; trigger from any page that needs wallet for an action.                               |
| 3   | `frontend/src/app/create/page.tsx`                             | `isWalletConnected` mock; “Connect Wallet to Deploy” in StepReviewDeploy | Real wallet connection state; require connected before deploy.                                      |
| 4   | `frontend/src/components/create-campaign/StepReviewDeploy.tsx` | Deploy button / Connect Wallet button                                    | Wallet must be connected; deploy will call Factory (needs signer).                                  |
| 5   | `frontend/src/app/campaign/[id]/page.tsx`                      | TokenPurchasePanel needs `userBalanceBNB`; contribute tx                 | Wallet balance (BNB); signer for Escrow.contribute().                                               |
| 6   | `frontend/src/components/campaign/TokenPurchasePanel.tsx`      | Balance display, “Confirm Purchase” (comment: “wagmi writeContract”)     | Wallet balance; Escrow.contribute() with msg.value.                                                 |
| 7   | `frontend/src/app/dashboard/page.tsx`                          | Profile address “vitalik.bnb”; “My Investments” / “My Campaigns”         | Connected address to show “My” data and to gate founder view.                                       |
| 8   | `frontend/src/app/admin/page.tsx`                              | Admin check (mock 1.5s); “Admin: 0xAdmin...9aF”                          | Compare connected address to backend-configured admin address; gate access.                         |
| 9   | `frontend/src/components/campaign/FounderActionStrip.tsx`      | Show strip only if `isOwner`                                             | Compare connected address to project.creator (from API or chain).                                   |
| 10  | Campaign Detail page                                           | Refund button (if present) / refund flow                                 | Escrow.refund() with user signer when refundsEnabled.                                               |

**Notes:** Frontend has **no** wagmi/viem/ethers yet. Adding MetaMask integration (e.g. wagmi + viem) is the first step; then wire the above components to `useAccount`, `useBalance`, `useConnect`, and contract write hooks.

---

### 2.2 Backend API ↔ Frontend Data

| #   | Frontend Location                               | API Endpoint                                       | Purpose                                                                                                                                                                         |
| --- | ----------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | `frontend/src/components/home/CampaignGrid.tsx` | `GET /projects`                                    | Replace `dummyCampaigns` with API projects. Map backend `ProjectRow` (id, token_address, escrow_address, creator, funding_goal, total_raised, deadline, status) to card props.  |
| 12  | `frontend/src/app/campaign/[id]/page.tsx`       | `GET /project/:id`                                 | Replace mock campaign/token/milestones with API + optional chain fallback. Need: project meta, status, total_raised, deadline for progress and token price.                     |
| 13  | Same (Campaign Detail)                          | `GET /project/:id/milestones`                      | Populate `MilestoneTracker`; map backend `MilestoneRow` (milestone_index, description, unlock_amount, verified, released) to UI milestone status.                               |
| 14  | Same (Campaign Detail)                          | `GET /project/:id/contributors`                    | Populate ActivityFeed / supporter count; map backend `contributor` + `amount` to “recent purchases” or aggregate.                                                               |
| 15  | `frontend/src/app/dashboard/page.tsx`           | `GET /projects` (filter by creator or contributor) | “My Campaigns”: filter by `creator === address`; “My Investments”: filter by contributions (may need backend support or client filter if API returns per-project contributors). |
| 16  | `frontend/src/app/admin/page.tsx`               | `GET /project/:id` + `GET /project/:id/milestones` | Load projects and milestones for admin; show pending (submitted, not verified) milestones for approval.                                                                         |

**Backend response shapes (from backend code):**

- `GET /projects` → `{ projects: ProjectRow[] }`
- `GET /project/:id` → `{ project: ProjectRow }` (or 404)
- `GET /project/:id/milestones` → `{ projectId, milestones: MilestoneRow[] }`
- `GET /project/:id/contributors` → `{ projectId, contributors: { contributor, amount }[] }`

---

### 2.3 Backend API ↔ Frontend Actions (Admin)

| #   | Frontend Location                 | API Endpoint                   | Purpose                                                                                                                                                                               |
| --- | --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 17  | `frontend/src/app/admin/page.tsx` | `POST /verify-milestone`       | On “Approve & Release Funds”: send `{ projectId, milestoneIndex }` (and optionally `proof`, `escrowAddress`). Backend calls Escrow.verifyMilestone(milestoneIndex) with admin wallet. |
| 18  | Same                              | Optional: “Release funds” step | Backend currently verifies only; release may be separate Escrow.releaseMilestoneFunds() call from backend or from frontend with admin signer—clarify with contract flow.              |

**Backend:** `POST /verify-milestone` body: `{ projectId: number, milestoneIndex?: number, proof?: string, escrowAddress?: string }`.

---

### 2.4 Smart Contract ↔ Frontend (Reads / Writes)

| #   | Action                      | Contract              | Function / Data                                                                 | Frontend Touch Point                                                                                                                                                       |
| --- | --------------------------- | --------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 19  | Create campaign             | ProjectFactory        | `createProject(name, symbol, totalSupply, fundingGoal, deadline, milestones)`   | Create Campaign flow: map `CampaignData` (name, symbol, totalSupply, fundingGoal, deadlineDays → timestamp, milestones[]) to contract args; send tx from connected wallet. |
| 20  | Get project meta (fallback) | ProjectFactory        | `getProject(projectId)`                                                         | If backend has no project or for on-chain truth; frontend or backend can call (backend already uses this in projects route).                                               |
| 21  | Contribute                  | MilestoneEscrow       | `contribute()` with BNB (msg.value)                                             | TokenPurchasePanel “Confirm Purchase”: send BNB to escrow.contribute(); amount = user input in BNB.                                                                        |
| 22  | Refund                      | MilestoneEscrow       | `refund()`                                                                      | Campaign Detail or Dashboard: show “Claim Refund” when refundsEnabled; call escrow.refund() with user signer.                                                              |
| 23  | Verify milestone            | Backend (admin)       | Backend calls Escrow.verifyMilestone(milestoneIndex)                            | Admin UI calls POST /verify-milestone; no direct contract call from frontend for verify.                                                                                   |
| 24  | Release milestone funds     | MilestoneEscrow       | `releaseMilestoneFunds()` (or per-milestone)                                    | If done from frontend by admin: admin wallet signs release; else backend (needs contract wiring in backend).                                                               |
| 25  | Token balance / price       | UtilityToken + Escrow | token.balanceOf(user), escrow totalRaised / fundingGoal, token price derivation | Campaign Detail: user token balance; token price from funding params or derived (e.g. 1 token = price in BNB).                                                             |

**Note:** Contract ABIs and addresses must be available to the frontend (e.g. env: `NEXT_PUBLIC_FACTORY_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`, RPC). Backend uses `backend/src/chain/abis.ts` (factoryAbi, escrowAbi)—frontend will need matching ABIs for Factory and Escrow (and Token if used).

---

### 2.5 Route & Link Consistency

| #   | Issue                                        | Current                                                 | Should Be                                                                                                   |
| --- | -------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 26  | Campaign card link                           | `CampaignCard.tsx`: `href={/project/${id}}`             | Campaign detail route is `app/campaign/[id]/page.tsx`. Use `/campaign/${id}` so cards open the detail page. |
| 27  | Dashboard “View Campaign” / “Manage Project” | Links to `/campaign` (no id)                            | Use `/campaign/${projectId}` for each project.                                                              |
| 28  | FounderActionStrip “Verifications”           | `<button>` (no link)                                    | For admin: link to `/admin` (and only show if connected address is admin).                                  |
| 29  | Milestone Submission page                    | Link exists: `/campaign/${campaignId}/submit-milestone` | Route **does not exist**; add `app/campaign/[id]/submit-milestone/page.tsx` and gate by campaign owner.     |

---

### 2.6 Environment & Config

| #   | Purpose                        | Where                                                                     |
| --- | ------------------------------ | ------------------------------------------------------------------------- |
| 30  | Backend base URL               | Frontend env (e.g. `NEXT_PUBLIC_API_URL`) for all API calls.              |
| 31  | Chain id (BNB testnet/mainnet) | Frontend wallet config; backend RPC.                                      |
| 32  | Factory address                | Backend: `FACTORY_ADDRESS`; Frontend: deploy and contribute flows.        |
| 33  | Escrow/Token addresses         | Per project, from API `project.escrow_address` / `project.token_address`. |

---

## Part 3: Frontend Pages Required (With Functionality) Before Connecting

These are the pages and behaviors the UIUX and codebase expect **before** you wire API and contracts. Filling these in makes integration straightforward.

| Page                               | Route                             | Required Functionality (Before Connecting)                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home / Explore**                 | `/`                               | Hero, How it works, **Campaign grid**: ready to consume `GET /projects` and map to `CampaignCard`; filters/sort can stay client-side. Fix card link to `/campaign/:id`.                                                                                                                                                                                       |
| **Create Campaign**                | `/create`                         | Multi-step form (Project, Token, Funding, Milestones, Review) already exists. **Before connect:** Ensure “Connect Wallet” and “Deploy” use real wallet state; deploy step maps `CampaignData` to Factory.createProject args (name, symbol, totalSupply, fundingGoal, deadline unix, milestones array).                                                        |
| **Campaign Detail**                | `/campaign/[id]`                  | **Before connect:** Fetch project by `id` from API (`GET /project/:id`), then milestones and contributors. Replace all mock data. **TokenPurchasePanel:** Connect wallet for balance and contribute tx. **FounderActionStrip:** Show only when `connectedAddress === project.creator`. Add Refund CTA when `refundsEnabled`. Fix `isOwner` to come from data. |
| **Milestone Submission**           | `/campaign/[id]/submit-milestone` | **Page missing.** Add route. Content: campaign context, current milestone, form (summary, evidence, optional URL). Submit = POST to backend (e.g. “submissions” store) or only off-chain for admin to review; actual on-chain verify stays with Admin + POST /verify-milestone. Gate: only campaign owner.                                                    |
| **Admin / Milestone Verification** | `/admin`                          | **Before connect:** Gate by admin address (from env or API). Load list of projects/milestones from API; “Approve” calls POST /verify-milestone with projectId + milestoneIndex. Optionally call release from frontend if admin signs.                                                                                                                         |
| **User Dashboard**                 | `/dashboard`                      | **Before connect:** Use connected address. “My Investments”: projects where user is in contributors (need API or derived list). “My Campaigns”: projects where creator === address (filter GET /projects or add API). Links to `/campaign/:id` and “Submit Milestone” to `/campaign/:id/submit-milestone`.                                                    |
| **Connect Wallet**                 | Global (modal)                    | **Component missing.** Add global modal: trigger from Navbar and from any “Connect Wallet” CTA; wallet list (e.g. MetaMask); on success, close and keep user on same page.                                                                                                                                                                                    |

---

## Part 4: Summary Checklist

- **MetaMask integration:** Add wagmi (or equivalent), wire Navbar, modal, and every screen that needs address/balance/signer.
- **Backend API:** Wire GET projects, project/:id, milestones, contributors to Home, Campaign Detail, Dashboard, Admin.
- **Backend POST:** Wire POST /verify-milestone from Admin UI.
- **Contracts:** Wire Factory.createProject (Create Campaign), Escrow.contribute (TokenPurchasePanel), Escrow.refund (Campaign Detail/Dashboard); verify/release via backend or admin frontend.
- **Routes/links:** Fix CampaignCard → `/campaign/:id`; add `/campaign/[id]/submit-milestone`; fix Dashboard and FounderActionStrip links.
- **Env:** Backend URL, chain id, Factory address; per-project escrow/token from API.

Use this document as the single reference for “where frontend and backend connect” and “what each page must do before integration.”
