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
| 19 | Deploy token | TokenFactory | `deployTokenV2(DeploymentConfig)` | Create Campaign flow: map `CampaignData` to DeploymentConfig (name, symbol, totalSupply, initialLiquidityPercent, unlockDuration, epochDuration, router); send tx with msg.value. |
| 20 | Get deployment meta (fallback) | TokenFactory | `getDeployment(index)` | Backend uses this; frontend can call if needed. |
| 21 | Contribute | MilestoneEscrow | `contribute()` with BNB (msg.value) | TokenPurchasePanel "Confirm Purchase" — **N/A until MilestoneEscrow deployed**. |
| 22 | Refund | MilestoneEscrow | `refund()` | Campaign Detail/Dashboard — **N/A until MilestoneEscrow deployed**. |
| 23 | Verify milestone | Backend (admin) | Backend calls Escrow.verifyMilestone(milestoneIndex) | Admin UI calls POST /verify-milestone with x-admin-address. |
| 24 | Release milestone funds | Backend (admin) | Backend calls Escrow.releaseMilestoneFunds(milestoneIndex) | Admin UI calls POST /release-milestone with x-admin-address. |
| 25 | Token balance / price | Token + LiquidityController | token.balanceOf(user); token price from AMM | Campaign Detail: user token balance; token price from pool or derived. *total_raised is null in current schema (no sale mechanism).* |

---

## Notes

- **Current contracts:** TokenFactory, Token, LiquidityController (PLU). MilestoneEscrow is **not yet implemented**; contribute, refund, verify, release require escrow to be deployed.
- Contract ABIs: backend has `backend/src/chain/abis.ts` (factoryAbi, escrowAbi). Frontend needs matching ABIs.
- Per-project addresses: `project.token_address`, `project.escrow_address` (controller mapped to escrow_address today).

---

## Deliverables

- [ ] TokenFactory ABI + Token ABI (and escrowAbi when MilestoneEscrow exists) in frontend
- [ ] Create Campaign: `deployTokenV2` tx with CampaignData mapped to DeploymentConfig
- [ ] TokenPurchasePanel: `contribute` tx — when MilestoneEscrow exists
- [ ] Campaign Detail: Refund CTA — when MilestoneEscrow exists
- [ ] Campaign Detail: token balance and price display (from token / AMM)
- [ ] Admin: POST /verify-milestone and POST /release-milestone with x-admin-address header
