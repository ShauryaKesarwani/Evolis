# Evolis — Vision & Strategy

## The Problem

### Traditional Crowdfunding
- Funds released **instantly** to creators — no accountability
- Backers get **no liquidity** — can't exit if project fails
- **No upside** — backers don't benefit if project succeeds

### Web3 Token Launches
- **No milestone gating** — creators dump treasury immediately
- **Instant liquidity drain** — rug pulls are trivial
- **High volatility** — all liquidity enters market at once
- **Whale manipulation** — large trades distort price discovery

---

## The Solution: Evolis

**A milestone-gated, refund-protected, AMM-liquid crowdfunding protocol on BNB Chain.**

Evolis combines the accountability of traditional crowdfunding with the liquidity and upside of DeFi:

1. **Bonding Curve Fundraise** — Supporters buy tokens at a fair, transparent price
2. **Escrow Protection** — Funds locked until funding goal is reached; refunds available if not
3. **Milestone Gating** — Capital released to founders only after verified milestone completion
4. **Progressive Liquidity Unlock (PLU)** — Token liquidity deepens gradually over 30+ days, reducing volatility
5. **IL Protection** — Backers who provide liquidity receive impermanent loss compensation

---

## Value Proposition

| Stakeholder | Benefit |
|-------------|---------|
| **Startup Founders** | Raise capital without giving up equity; funds released on milestone proof |
| **Supporters/Backers** | Refund protection, token upside, transparent milestone tracking |
| **Token Holders** | Progressive liquidity ensures stable price discovery |
| **Liquidity Providers** | IL protection incentivizes long-term liquidity provision |

---

## Target Users

### Primary
- **Web3 Startup Founders** — seeking non-dilutive funding with built-in community alignment
- **DeFi Community Backers** — looking for accountable, transparent investment opportunities with token upside

### Secondary
- **DAOs & Collectives** — funding community initiatives with milestone accountability
- **Hackathon Teams** — launching MVPs with crowdfunded backing and progressive liquidity

---

## Token & Business Model

### Token Economics
```
Total Supply: Configurable per campaign (e.g., 1,000,000 tokens)

Distribution:
├── 40% — Bonding Curve Sale (available to backers)
└── 60% — Locked for Progressive Liquidity Unlock

Fees on Purchase:
├── 1.0% — Platform fee
└── 0.5% — IL Protection fund
```

### Revenue Model
- **1% platform fee** on every bonding curve purchase
- Fee accrues to platform treasury
- Future: governance token for platform fee redistribution

### Escrow Flow
```
Bonding Curve Sale
    ↓
Goal Reached?
├── No  → Refunds enabled for all backers
└── Yes → 50% to founder immediately
          50% reserved for progressive liquidity via Controller
              ↓
          Epoch unlocks inject tokens + BNB into AMM
              ↓
          Remaining funds released per verified milestone
```

---

## Go-To-Market Strategy

### Phase 1: Hackathon & Community (Current)
- Deploy on BNB Chain Testnet for demonstration
- Build initial user base through hackathon exposure
- Open-source the protocol for community trust

### Phase 2: Testnet Launch
- Onboard 5–10 pilot projects for live testnet campaigns
- Gather feedback on UX, milestone verification, and PLU mechanics
- Iterate on smart contract security and gas optimization

### Phase 3: Mainnet & Growth
- Security audit by reputable firm
- Deploy to BNB Chain Mainnet
- Partner with BNB Chain ecosystem projects for launch campaigns
- Integrate real PancakeSwap for AMM liquidity
- Launch governance token for protocol decentralization

### Phase 4: Ecosystem Expansion
- Multi-chain deployment (Ethereum, Polygon, Arbitrum)
- Advanced milestone verification (on-chain oracles, community voting)
- Automated epoch execution via Chainlink Automation
- Analytics dashboard and growth tools

---

## Roadmap

### ✅ Implemented
- EvolisFactory + EvolisPool + Token + LiquidityController smart contracts
- Bonding curve fundraise with configurable parameters
- Milestone-gated escrow with refund protection
- Progressive Liquidity Unlock (PLU) engine with epoch-based releases
- IL protection mechanism (duration-based coverage)
- Circuit breaker for extreme price movements
- Next.js frontend with 6 pages and 27+ components
- Multi-step campaign creation wizard (5 steps)
- Campaign browsing with filtering
- Campaign detail page with token purchase, milestone tracker, activity feed
- User dashboard (investments + campaigns)
- Wallet integration (Wagmi + WalletConnect + MetaMask)
- BNB Chain Testnet deployment with live contracts
- Backend REST API (Hono + SQLite + chain indexer)
- Admin milestone verification routes
- ERC-20 token with fixed supply

### ⏳ In Progress / Planned
- Anti-whale dynamic fee system (PLUPair code exists, needs integration)
- Status filters and sorting on campaign grid
- Remaining frontend polish (micro-animations, UI bugs)

### 🔮 Future
- Formal security audit
- BNB Chain Mainnet deployment
- Governance / DAO system
- Post-launch growth tools and incentive programs
- AI-themed token templates
- Chainlink Automation for epoch triggers
- Analytics and indexing (subgraph)
- Multi-chain expansion

---

## Regulatory Positioning

Tokens issued through Evolis represent:
- ✅ **Utility** — access to platform features
- ✅ **Participation** — backing a project
- ✅ **Governance** — future voting rights

Tokens do **NOT** represent:
- ❌ Equity or ownership
- ❌ Revenue share or dividends
- ❌ Profit claims
