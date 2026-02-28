# Evolis — User Journey

## Overview

Evolis serves two primary user types: **Supporters** (backers who fund campaigns) and **Founders** (startup creators who raise capital). Both flows converge through the platform's milestone-gated escrow system.

---

## Complete User Journey

```mermaid
journey
    title Supporter Journey
    section Discovery
      Visit homepage: 5: Supporter
      Browse active campaigns: 4: Supporter
      Filter by category/status: 3: Supporter
    section Investment
      Connect wallet (MetaMask): 5: Supporter
      View campaign details: 4: Supporter
      Buy tokens via bonding curve: 5: Supporter
      Receive project tokens: 5: Supporter
    section Tracking
      Track funding progress: 4: Supporter
      View milestone completions: 4: Supporter
      Monitor token value: 3: Supporter
    section Post-Funding
      Claim EvoLP tokens: 5: Supporter
      Claim IL compensation: 4: Supporter
```

```mermaid
journey
    title Founder Journey
    section Campaign Creation
      Connect wallet: 5: Founder
      Fill project info (name, tagline, logo): 4: Founder
      Configure token (name, symbol, supply): 4: Founder
      Set funding goal and deadline: 4: Founder
      Define milestones: 5: Founder
      Review and deploy on-chain: 5: Founder
    section Fundraising
      Share campaign link: 4: Founder
      Watch contributions grow: 4: Founder
      Reach funding goal: 5: Founder
    section Execution
      Receive 50% of funds on goal: 5: Founder
      Submit milestone completion proof: 4: Founder
      Receive remaining funds per milestone: 5: Founder
```

---

## Detailed Flow Diagram

```mermaid
flowchart TD
    START([User visits Evolis]) --> BROWSE[Browse Campaigns]
    START --> CREATE[Create Campaign]

    %% Supporter Flow
    BROWSE --> CONNECT_S[Connect Wallet]
    CONNECT_S --> VIEW[View Campaign Detail]
    VIEW --> BUY[Buy Tokens via Bonding Curve]
    BUY --> FEE{Fees deducted}
    FEE --> |1% Platform| PLATFORM[Platform Treasury]
    FEE --> |0.5% IL Fund| IL[IL Protection Pool]
    FEE --> |98.5% Net| ESCROW[Funds held in EvolisPool Escrow]

    ESCROW --> GOAL{Funding Goal Reached?}
    GOAL --> |No + Deadline passed| REFUND[Refund BNB to Supporters]
    GOAL --> |Yes| SPLIT[50/50 Split]

    SPLIT --> OWNER_FUNDS[50% → Project Owner]
    SPLIT --> LIQUIDITY[50% → Progressive Liquidity via Controller]

    %% Founder Flow
    CREATE --> WIZARD[5-Step Campaign Wizard]
    WIZARD --> |Step 1| INFO[Project Info]
    WIZARD --> |Step 2| TOKEN_CFG[Token Configuration]
    WIZARD --> |Step 3| FUNDING[Funding Goal & Deadline]
    WIZARD --> |Step 4| MILESTONES[Define Milestones]
    WIZARD --> |Step 5| DEPLOY[Review & Deploy]
    DEPLOY --> CHAIN[Deploy to BNB Chain]
    CHAIN --> FACTORY[EvolisFactory creates Pool + Token + Controller]

    %% Milestone Flow
    OWNER_FUNDS --> SUBMIT[Founder Submits Milestone Proof]
    SUBMIT --> ADMIN[Admin Verifies Milestone]
    ADMIN --> RELEASE[Release Milestone Funds]

    %% PLU Flow
    LIQUIDITY --> EPOCH[Epoch Unlocks over Time]
    EPOCH --> AMM[Tokens injected into AMM Pool]
    AMM --> DEEPER[Deeper Liquidity → Lower Slippage]
```

---

## Page-by-Page User Actions

### Home / Explore (`/`)
- Browse campaign cards with name, progress bar, status badge
- Filter campaigns (by category, status)
- Click through to campaign details
- CTA to create your own campaign

### Create Campaign (`/create`)
1. **Project Info** — Name, tagline, logo URL, website/social links, category
2. **Token Configuration** — Token name, symbol, total supply, allocation split (public/team/treasury)
3. **Funding Goal** — Target amount (BNB), deadline (days), unlock/epoch duration
4. **Milestones** — Add milestone descriptions and unlock amounts
5. **Review & Deploy** — Summary of all inputs → deploy transaction via connected wallet

### Campaign Detail (`/campaign/[id]`)
- **Supporters:** View funding progress, buy tokens, see milestone status, activity feed
- **Founders:** Access founder action strip to submit milestone completions
- **Admins:** Navigate to admin panel for milestone verification

### Dashboard (`/dashboard`)
- "My Investments" — campaigns backed, tokens held
- "My Campaigns" — campaigns created, funding status, milestone actions

### Admin Panel (`/admin`)
- Milestone verification interface
- Fund release controls
- Access-gated by admin wallet address
