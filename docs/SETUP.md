# Evolis — Setup & Run Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | v18+ | Frontend runtime |
| **Bun** | Latest | Backend runtime |
| **Foundry** (forge, cast, anvil) | Latest | Smart contract dev |
| **Git** | Latest | Version control |
| **MetaMask** | Browser extension | Wallet interaction |

### Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

---

## Repository Structure

```
Evolis/
├── frontend/            # Next.js 14 frontend
│   ├── src/app/         # Pages (home, create, campaign, dashboard, admin)
│   ├── src/components/  # React components
│   ├── src/lib/         # Wagmi config, utilities
│   └── .env.local       # Frontend environment variables
├── backend/             # Bun + Hono API server
│   ├── src/             # Source code (routes, db, indexer, chain client)
│   └── .env             # Backend environment variables
├── contracts/           # Foundry smart contracts (primary)
│   ├── src/             # Solidity source files
│   ├── test/            # Forge tests
│   └── script/          # Deployment scripts
├── contracts2/          # Secondary contracts workspace
├── docs/                # Documentation
└── LICENSE              # MIT License
```

---

## Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/ShauryaKesarwani/Evolis.git
cd Evolis
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
DATABASE_URL=file:./data/dev.sqlite
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
FACTORY_ADDRESS=0x2c281243A1013A9Be20a7415ee6D0CdCd8Aae39b
ADMIN_PRIVATE_KEY=<your-admin-private-key>
PORT=3001
ENABLE_INDEXER=true
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_FACTORY_ADDRESS=0x2c281243A1013A9Be20a7415ee6D0CdCd8Aae39b
```

> **⚠️ Never commit private keys.** Use `.env.example` files as templates.

### 3. Install Dependencies

```bash
# Backend
cd backend && bun install

# Frontend
cd ../frontend && bun install
```

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
bun dev
# → API running at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
bun dev
# → Frontend running at http://localhost:3000
```

### 5. Open in Browser
Visit [http://localhost:3000](http://localhost:3000)

---

## Smart Contract Development

### Build & Test
```bash
cd contracts
forge build       # Compile all contracts
forge test        # Run test suite (15+ tests)
forge test -vvv   # Verbose output
```

### Local Deployment (Anvil)

**Terminal 3 — Start local blockchain:**
```bash
anvil --port 8545
```

**Deploy contracts:**
```bash
cd contracts
source .env
forge script script/DeployEvolisSystem.s.sol:DeployEvolisSystem \
  --rpc-url http://127.0.0.1:8545 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

---

## BNB Chain Testnet Deployment

### 1. Get Testnet BNB
- [BSC Faucet](https://testnet.bnbchain.org/faucet-smart)
- Minimum ~0.01 BNB for deployment gas

### 2. Deploy
```bash
cd contracts
source .env

forge script script/DeployEvolisSystem.s.sol:DeployEvolisSystem \
  --rpc-url $BSC_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 3. Update Environment Files
Copy the output addresses into `backend/.env` and `frontend/.env.local`.

### 4. Verify Deployment
```bash
# Check factory contract
cast call $EVOLIS_FACTORY 'poolCount()(uint256)' --rpc-url $BSC_TESTNET_RPC

# Check pool configuration
cast call $EVOLIS_POOL 'projectToken()(address)' --rpc-url $BSC_TESTNET_RPC
cast call $EVOLIS_POOL 'goalReached()(bool)' --rpc-url $BSC_TESTNET_RPC
```

---

## MetaMask Configuration (BNB Testnet)

1. Open MetaMask → Networks → Add Network
2. Fill in:
   ```
   Network Name:     BNB Smart Chain Testnet
   RPC URL:          https://data-seed-prebsc-1-s1.binance.org:8545/
   Chain ID:         97
   Currency Symbol:  tBNB
   Explorer URL:     https://testnet.bscscan.com
   ```
3. Import a funded account with testnet BNB

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `connection refused` on API | Ensure backend is running (`bun dev` in `backend/`) |
| `Module not found` in frontend | Run `bun install` in `frontend/` |
| `Contract not deployed` | Re-deploy contracts and update addresses in `.env` |
| `Nonce too high` in MetaMask | Settings → Advanced → Clear activity tab data |
| Frontend not loading | Delete `.next/` and restart (`rm -rf .next && bun dev`) |
| `fetch failed` on campaign pages | Verify `NEXT_PUBLIC_API_URL` in `.env.local` is correct |
