# Evolis — Frontend

## Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework (App Router) |
| **Tailwind CSS** | Utility-first styling |
| **Wagmi** | Ethereum/BNB wallet hooks |
| **WalletConnect** | Wallet connection provider |
| **TanStack Query** | Server state management |
| **Martian Mono** | Heading typography |
| **Inter** | Body typography |

---

## Design System

| Token | Value |
|-------|-------|
| Primary Background | Cream White `#FCFAF6` |
| Primary Text | Dark Charcoal `#111111` |
| Accent | Lime-Leaf Green `#b5e315` |
| Style | Neo-brutalist / flat design with solid dark borders, rounded corners, high contrast |
| Headings Font | Martian Mono |
| Body Font | Inter |

---

## Pages

### Home (`/`)
Entry point for all users. Features:
- **Hero Section** — platform value proposition with animated escrow sphere
- **How It Works** — 3-step visual guide
- **Campaign Grid** — cards fetched from backend API showing project name, funding progress, status badge
- **Campaign Filters** — filter by category and status

### Create Campaign (`/create`)
5-step wizard for founders:
1. **Project Info** — name, tagline, logo URL, website, social links, category
2. **Token Configuration** — token name, symbol, total supply, allocation percentages (public/team/treasury)
3. **Funding Goal** — target BNB, deadline in days, unlock and epoch durations
4. **Milestones** — add/edit/remove milestones with descriptions and unlock amounts
5. **Review & Deploy** — full summary → deploy transaction via connected wallet on BNB Testnet

Includes **fast-fill test data** dropdown with 8 pre-configured sample campaigns.

### Campaign Detail (`/campaign/[id]`)
Central page for a specific campaign:
- **Campaign Header** — name, logo, status badge, creator address (with hover tooltip)
- **Funding Progress** — progress bar, BNB raised vs goal, time remaining
- **Token Info Panel** — token name, symbol, supply, allocation chart
- **Token Purchase Panel** — BNB input, calculated tokens, wallet balance, buy button
- **Milestone Tracker** — ordered list with status indicators (pending/submitted/verified/released)
- **Activity Feed** — recent purchases and milestone events
- **Project Description** — full project details and team info
- **Founder Action Strip** — visible only to campaign owner (submit milestone CTA)

### Dashboard (`/dashboard`)
Personal hub for connected users:
- My Investments — campaigns backed, tokens held
- My Campaigns — campaigns created, statuses, milestone actions

### Deployments (`/deployments`)
List of token deployments with management links.

### Admin (`/admin`)
Milestone verification panel. Admin-gated by wallet address.

---

## Component Tree

```
src/components/
├── Navbar.tsx                    # Global nav with wallet connect
├── Footer.tsx                    # Site footer
├── ShrinkingFooter.tsx           # Animated footer wrapper
├── ConnectWalletModal.tsx        # Wallet connection modal
├── SmoothScroll.tsx              # Smooth scrolling wrapper
├── AnchorScrollHandler.tsx       # Hash-based scroll navigation
│
├── home/
│   ├── HeroSection.tsx           # Landing hero with CTA
│   ├── HowItWorksSection.tsx     # Step-by-step visual guide
│   ├── EscrowSphere.tsx          # Animated 3D escrow visualization
│   ├── CampaignCard.tsx          # Individual campaign card
│   ├── CampaignGrid.tsx          # Grid container (fetches from API)
│   └── CampaignFilters.tsx       # Category and status filters
│
├── create-campaign/
│   ├── StepIndicator.tsx         # Progress stepper
│   ├── StepProjectInfo.tsx       # Step 1: Project info form
│   ├── StepTokenConfig.tsx       # Step 2: Token configuration
│   ├── StepFundingGoal.tsx       # Step 3: Funding goal
│   ├── StepMilestones.tsx        # Step 4: Milestone definitions
│   ├── StepReviewDeploy.tsx      # Step 5: Review & deploy
│   ├── CreateCampaignLayout.tsx  # Layout wrapper
│   └── types.ts                  # CampaignData type definitions
│
├── campaign/
│   ├── CampaignDetailLayout.tsx  # Layout wrapper
│   ├── CampaignHeader.tsx        # Campaign title, status, creator
│   ├── FundingProgress.tsx       # Progress bar and stats
│   ├── TokenInfoPanel.tsx        # Token details and allocation
│   ├── TokenPurchasePanel.tsx    # Buy tokens interface
│   ├── MilestoneTracker.tsx      # Milestone status list
│   ├── ActivityFeed.tsx          # Recent activity stream
│   ├── ProjectDescription.tsx   # Full project description
│   └── FounderActionStrip.tsx    # Founder-only actions
│
└── plu/                          # PLU-related components
```

---

## Wallet Integration

The frontend uses **Wagmi** with WalletConnect for wallet connectivity:

```typescript
// providers.tsx
<WagmiProvider config={config}>
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
</WagmiProvider>
```

**Configured chain:** BNB Smart Chain Testnet (Chain ID: 97)

**Hooks used:**
- `useAccount()` — connected wallet state
- `useWriteContract()` — send transactions (deploy, buy tokens)
- `useSwitchChain()` — switch to BNB Testnet if on wrong network

---

## API Integration

Frontend communicates with the backend at `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`):

| Action | Endpoint | When |
|--------|----------|------|
| List campaigns | `GET /projects` | Home page load |
| Save campaign metadata | `POST /projects` | After on-chain deployment |
| Get campaign details | `GET /project/:id` | Campaign detail page |
| Get milestones | `GET /project/:id/milestones` | Campaign detail page |
| Get contributors | `GET /project/:id/contributors` | Campaign detail page |
| Record contribution | `POST /project/:id/contribute` | After token purchase |
