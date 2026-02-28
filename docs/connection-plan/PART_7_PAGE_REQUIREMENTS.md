# Part 7: Frontend Pages — Required Functionality (Reference)

**Use this part** as a per-page checklist. These are the behaviors the UIUX and codebase expect **before** wiring API and contracts.

---

## Page Checklist

| Page | Route | Required Functionality (Before Connecting) |
|------|--------|--------------------------------------------|
| **Home / Explore** | `/` | Hero, How it works, **Campaign grid**: ready to consume `GET /projects` and map to `CampaignCard`; filters/sort can stay client-side. Fix card link to `/campaign/:id`. |
| **Create Campaign** | `/create` | Multi-step form (Project, Token, Funding, Milestones, Review) already exists. **Before connect:** Ensure "Connect Wallet" and "Deploy" use real wallet state; deploy step maps `CampaignData` to TokenFactory.deployTokenV2 DeploymentConfig (name, symbol, totalSupply, initialLiquidityPercent, unlockDuration, epochDuration, router). |
| **Campaign Detail** | `/campaign/[id]` | **Before connect:** Fetch project by `id` from API (`GET /project/:id`), then milestones and contributors. Replace all mock data. **TokenPurchasePanel:** Connect wallet for balance; contribute tx when MilestoneEscrow exists. **FounderActionStrip:** Show only when `connectedAddress === project.creator`. Refund CTA when MilestoneEscrow and refundsEnabled. Fix `isOwner` from data. |
| **Milestone Submission** | `/campaign/[id]/submit-milestone` | **Page exists.** Content: campaign context, current milestone, form (summary, evidence, optional URL). Submit = POST to backend (e.g. "submissions" store) or off-chain for admin to review; on-chain verify via Admin + POST /verify-milestone. Gate: only campaign owner. |
| **Admin / Milestone Verification** | `/admin` | **Before connect:** Gate by admin address (from env or API). Load projects/milestones from API. "Approve" calls POST /verify-milestone (with x-admin-address header). "Release" calls POST /release-milestone (separate step). Both require projectId + milestoneIndex. |
| **User Dashboard** | `/dashboard` | **Before connect:** Use connected address. "My Investments": projects where user is in contributors (need API or derived list). "My Campaigns": projects where creator === address (filter GET /projects or add API). Links to `/campaign/:id` and "Submit Milestone" to `/campaign/:id/submit-milestone`. |
| **Connect Wallet** | Global (modal) | **Component missing.** Add global modal: trigger from Navbar and from any "Connect Wallet" CTA; wallet list (e.g. MetaMask); on success, close and keep user on same page. |

---

## Execution Notes

- This part is **reference** only; it does not prescribe a single execution order.
- Use it to validate each page before or after Parts 2–5.
- Parts 2–5 implement the wiring; this part describes the target state per page.
