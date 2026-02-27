# Part 2: MetaMask / Wallet Integration (Executable)

**Execute this part** to add MetaMask (or equivalent) wallet integration. This is the **first priority** for frontend–backend/contract connection.

---

## Prerequisites

- Part 6 (Environment) for `NEXT_PUBLIC_CHAIN_ID`, RPC URL
- Add wagmi + viem (or ethers) to frontend `package.json`

---

## Connection Points

| # | Location | Purpose | Connects To |
|---|----------|---------|-------------|
| 1 | `frontend/src/components/Navbar.tsx` | "Connect Wallet" button (currently static) | Wallet provider (e.g. wagmi + MetaMask). On connect: store address, chain; show disconnect/address. |
| 2 | Global / layout | Connect Wallet **modal** (UIUX: overlay, not a page) | Same provider; trigger from any page that needs wallet for an action. |
| 3 | `frontend/src/app/create/page.tsx` | `isWalletConnected` mock; "Connect Wallet to Deploy" in StepReviewDeploy | Real wallet connection state; require connected before deploy. |
| 4 | `frontend/src/components/create-campaign/StepReviewDeploy.tsx` | Deploy button / Connect Wallet button | Wallet must be connected; deploy will call Factory (needs signer). |
| 5 | `frontend/src/app/campaign/[id]/page.tsx` | TokenPurchasePanel needs `userBalanceBNB`; contribute tx | Wallet balance (BNB); signer for Escrow.contribute(). |
| 6 | `frontend/src/components/campaign/TokenPurchasePanel.tsx` | Balance display, "Confirm Purchase" (comment: "wagmi writeContract") | Wallet balance; Escrow.contribute() with msg.value. |
| 7 | `frontend/src/app/dashboard/page.tsx` | Profile address "vitalik.bnb"; "My Investments" / "My Campaigns" | Connected address to show "My" data and to gate founder view. |
| 8 | `frontend/src/app/admin/page.tsx` | Admin check (mock 1.5s); "Admin: 0xAdmin...9aF" | Compare connected address to backend-configured admin address; gate access. |
| 9 | `frontend/src/components/campaign/FounderActionStrip.tsx` | Show strip only if `isOwner` | Compare connected address to project.creator (from API or chain). |
| 10 | Campaign Detail page | Refund button (if present) / refund flow | Escrow.refund() with user signer when refundsEnabled. |

---

## Notes

- Frontend has **no** wagmi/viem/ethers yet. Adding MetaMask integration (e.g. wagmi + viem) is the first step.
- Wire components to `useAccount`, `useBalance`, `useConnect`, and contract write hooks.

---

## Deliverables

- [ ] wagmi/viem (or equivalent) installed and configured
- [ ] Navbar "Connect Wallet" opens modal and shows address when connected
- [ ] Connect Wallet modal (global) implemented
- [ ] Create Campaign uses real `isWalletConnected` from provider
- [ ] TokenPurchasePanel receives real BNB balance and can trigger contribute tx
- [ ] Dashboard shows connected address
- [ ] Admin page gates by admin address
- [ ] FounderActionStrip `isOwner` derived from `connectedAddress === project.creator`
- [ ] Refund flow (if UI exists) wired to Escrow.refund()
