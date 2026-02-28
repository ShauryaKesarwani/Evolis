# Evolis — Unimplemented Features

This document tracks features that are **planned or partially built but not yet production-ready**. These are separated into categories by proximity to completion.

---

## ⚠️ Code Exists, Not Integrated

These features have working code but are not wired into the production deployment or test path.

### Anti-Whale Dynamic Fee System (PLUPair + PLUFactory)
- `PLUPair.sol` implements size-based dynamic fees (0.25%–5%) with epoch-aware discounts
- `PLUFactory.sol` deploys custom pairs with anti-whale protection
- `LiquidityController` has dual-path support (`initializeWithPair()` + `unlockEpoch()` dual-path)
- **Status:** Code compiles, logic is implemented, but the production deployment uses `MockPancakeRouter` instead. Tests run on the traditional router path.
- **To activate:** Revert test configs to use `pluFactory`, wire `PLUFactory` into `EvolisFactory.createPool()`, add tests for dynamic fee calculations

### LiquidityControllerSelfTriggering (V3 Auto-Unlock)
- Self-triggering variant that automatically unlocks epochs when any interaction occurs
- 11/12 tests passing; 1 edge case failing (epoch count discrepancy: 28 vs 30)
- **Status:** Not used in production path

---

## ❌ Not Yet Built

### Smart Contracts
- **Chainlink Automation** — Automated epoch triggering without manual calls
- **Governance / DAO** — On-chain governance for protocol decisions
- **Post-launch incentive programs** — Farming, staking, rewards
- **AI-themed token templates** — Specialized token mechanics for AI projects
- **Real PancakeSwap integration** — Replace MockRouter with production PancakeSwap V2/V3

### Frontend
- **Status Filters** — "Upcoming" and "Funded" tab filters are not functional
- **Sorting Dropdown** — Sort logic not connected
- **Days Remaining Bug** — Calculation returning exponent values (e.g., `1.5e+43 days remaining`)
- **Zero Target/Progress** — Some campaigns show `0 BNB` and `0% of 0 BNB goal`
- **Milestone Submission Page** — Route exists but full proof-of-completion workflow not implemented
- **Global SVG noise overlay** — Planned textural enhancement
- **Custom geometric cursor** — Planned interaction improvement
- **Live action marquee banner** — Planned activity ticker
- **Avatar hover glitch animation** — Planned hover effect for campaign cards

### Backend
- **Event-based indexing** — Currently polls; could use WebSocket event listeners for real-time
- **Off-chain milestone proof validation** — Currently accepted as-is; planned: IPFS hash verification, oracle-based validation
- **Rate limiting** — No request rate limiting on API endpoints

### Infrastructure
- **Formal security audit** — Not yet conducted by third-party auditor
- **BNB Chain Mainnet deployment** — Only deployed on testnet
- **CI/CD pipeline** — No automated testing/deployment pipeline
- **Monitoring and alerting** — No production monitoring
- **Multi-chain support** — Currently BNB Chain only; Ethereum/Polygon/Arbitrum planned

### Documentation
- **API documentation** (OpenAPI/Swagger spec)
- **Contributing guide** (`CONTRIBUTING.md`)
- **Code of conduct**
