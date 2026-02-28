# Connection Plan — Index & Execution Order

The frontend–backend connection work is split into **7 executable parts**. Each part can be done independently; the recommended order is below.

---

## Execution Order

| Phase | Part | File | Depends On |
|-------|------|------|------------|
| **0** | Index & Context | `PART_0_INDEX.md` | — |
| **1** | Master Prompt | `PART_1_MASTER_PROMPT.md` | — |
| **2** | Environment | `PART_6_ENVIRONMENT.md` | — |
| **3** | MetaMask / Wallet | `PART_2_METAMASK_WALLET.md` | Part 6 (env) |
| **4** | Routes & Links | `PART_5_ROUTES_AND_LINKS.md` | — |
| **5** | Backend API | `PART_3_BACKEND_API.md` | Part 6 (API URL) |
| **6** | Smart Contracts | `PART_4_SMART_CONTRACTS.md` | Parts 3, 6 |
| **7** | Page Requirements | `PART_7_PAGE_REQUIREMENTS.md` | Reference for all |

---

## Quick Reference

- **PART_1** — Master prompt for agents/developers to understand the system and find connection points
- **PART_2** — MetaMask integration (Navbar, modal, balance, signer) — *execute first for wallet*
- **PART_3** — Backend API wiring (GET projects, project/:id, milestones, contributors; POST verify-milestone, POST release-milestone; x-admin-address header)
- **PART_4** — Smart contract calls (deployTokenV2; contribute/refund when MilestoneEscrow exists; verify/release via backend)
- **PART_5** — Route and link fixes (CampaignCard, Dashboard links fixed; submit-milestone page exists; Verifications link TODO)
- **PART_6** — Environment variables (API URL, chain id, Factory address)
- **PART_7** — Per-page checklist of required functionality before connecting

---

## Related Docs (Root)

- `PROJECT_PLAN.md` — Vision, funding model, escrow, refunds
- `ARCHITECTURE.md` — System overview, contract mapping, DB schema
- `BACKEND_SUMMARY.md` — API endpoints, verify-milestone flow
- `UIUX.md` — Pages, navigation, access control
