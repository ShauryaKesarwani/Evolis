# Part 4: Smart Contract ↔ Frontend (Executable)

**Execute this part** to wire frontend to smart contracts (reads and writes).

---

## Prerequisites

- Part 2 (MetaMask): wallet connected, signer available
- Part 6 (Environment): `NEXT_PUBLIC_FACTORY_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`, RPC
- Contract ABIs: frontend needs Factory + Escrow (+ Token if used); backend has `backend/src/chain/abis.ts`

---

## Connection Points

| # | Action | Contract | Function / Data | Frontend Touch Point |
|----|--------|----------|------------------|----------------------|
| 19 | Create campaign | ProjectFactory | `createProject(name, symbol, totalSupply, fundingGoal, deadline, milestones)` | Create Campaign flow: map `CampaignData` (name, symbol, totalSupply, fundingGoal, deadlineDays → timestamp, milestones[]) to contract args; send tx from connected wallet. |
| 20 | Get project meta (fallback) | ProjectFactory | `getProject(projectId)` | If backend has no project or for on-chain truth; frontend or backend can call (backend already uses this in projects route). |
| 21 | Contribute | MilestoneEscrow | `contribute()` with BNB (msg.value) | TokenPurchasePanel "Confirm Purchase": send BNB to escrow.contribute(); amount = user input in BNB. |
| 22 | Refund | MilestoneEscrow | `refund()` | Campaign Detail or Dashboard: show "Claim Refund" when refundsEnabled; call escrow.refund() with user signer. |
| 23 | Verify milestone | Backend (admin) | Backend calls Escrow.verifyMilestone(milestoneIndex) | Admin UI calls POST /verify-milestone; no direct contract call from frontend for verify. |
| 24 | Release milestone funds | MilestoneEscrow | `releaseMilestoneFunds()` (or per-milestone) | If done from frontend by admin: admin wallet signs release; else backend (needs contract wiring in backend). |
| 25 | Token balance / price | UtilityToken + Escrow | token.balanceOf(user), escrow totalRaised / fundingGoal, token price derivation | Campaign Detail: user token balance; token price from funding params or derived (e.g. 1 token = price in BNB). |

---

## Notes

- Contract ABIs and addresses must be available to the frontend (e.g. env: `NEXT_PUBLIC_FACTORY_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`, RPC).
- Backend uses `backend/src/chain/abis.ts` (factoryAbi, escrowAbi)—frontend needs matching ABIs for Factory and Escrow (and Token if used).
- Per-project escrow and token addresses come from API: `project.escrow_address`, `project.token_address`.

---

## Deliverables

- [ ] Factory ABI + Escrow ABI (and Token if needed) in frontend
- [ ] Create Campaign: `createProject` tx with CampaignData mapped to args
- [ ] TokenPurchasePanel: `contribute` tx with user BNB input
- [ ] Campaign Detail: Refund CTA when refundsEnabled; `refund()` tx
- [ ] Campaign Detail: token balance and price display (from token + escrow reads)
- [ ] Optional: admin releaseMilestoneFunds from frontend if contract supports
