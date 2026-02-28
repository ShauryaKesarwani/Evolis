# Progressive Liquidity Unlock (PLU) Token System - Complete Setup Guide

> **Complete deployment and testing guide for the PLU token factory with automated liquidity management**

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Initial Setup](#initial-setup)
4. [Smart Contract Development](#smart-contract-development)
5. [Local Blockchain Setup (Anvil)](#local-blockchain-setup-anvil)
6. [Contract Deployment](#contract-deployment)
7. [Frontend Setup](#frontend-setup)
8. [MetaMask Configuration](#metamask-configuration)
9. [Testing the System](#testing-the-system)
10. [Trading Tokens](#trading-tokens)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **Foundry** (Forge, Cast, Anvil) - [Installation Guide](https://book.getfoundry.sh/getting-started/installation)
- **Git** - [Download](https://git-scm.com/)
- **MetaMask** Browser Extension - [Install](https://metamask.io/)

### Verify Installation

```bash
# Check Node.js
node --version  # Should be v18+

# Check npm
npm --version

# Check Foundry
forge --version
cast --version
anvil --version

# Check Git
git --version
```

---

## Project Overview

### What is PLU (Progressive Liquidity Unlock)?

PLU is a mechanism to gradually release locked tokens into a liquidity pool over time, helping to:
- **Reduce volatility** by controlling liquidity depth
- **Build trust** through transparent, automated unlocking
- **Grow sustainably** with predictable token release schedules

### Project Structure

```
BNB_HACK/
├── contracts/                    # Smart contracts (Foundry)
│   ├── src/
│   │   ├── Token.sol            # ERC20 token
│   │   ├── TokenFactory.sol     # Factory for atomic deployment
│   │   ├── LiquidityController.sol  # PLU core logic
│   │   └── MockPancakeRouter.sol    # Local DEX simulation
│   ├── script/                  # Deployment scripts
│   ├── test/                    # Contract tests
│   └── .env                     # Contract configuration
└── FrontendSample/              # Next.js frontend
    ├── app/                     # Pages
    ├── components/              # React components
    ├── lib/                     # Configuration & ABIs
    └── .env                     # Frontend configuration
```

### Smart Contract Architecture

```
┌─────────────────┐
│  TokenFactory   │ ← User deploys via UI
└────────┬────────┘
         │ Creates atomically:
         ├─────────────────┐
         ▼                 ▼
    ┌─────────┐    ┌──────────────────┐
    │  Token  │───▶│ Liquidity        │
    │ (ERC20) │    │ Controller (PLU) │
    └─────────┘    └─────────┬────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  PancakeRouter   │
                   │  (DEX/AMM)       │
                   └──────────────────┘
```

---

## Initial Setup

### 1. Clone or Create Project Directory

```bash
# Navigate to your workspace
cd ~/Desktop/GitHub

# If cloning existing repo:
git clone <your-repo-url> BNB_HACK
cd BNB_HACK

# If starting fresh:
mkdir BNB_HACK && cd BNB_HACK
```

### 2. Initialize Foundry Project (Contracts)

```bash
# Create contracts directory
mkdir contracts && cd contracts

# Initialize Foundry project
forge init --no-git

# Install dependencies
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts@v5.6.0

# Verify installation
ls lib/
# Should show: forge-std, openzeppelin-contracts
```

### 3. Create Contract Configuration File

```bash
# Create .env file in contracts directory
cat > .env << 'EOF'
# Private key for deployment (DO NOT COMMIT)
# Local blockchain (Anvil)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ANVIL_RPC=http://127.0.0.1:8545
ANVIL_ACCOUNT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Deployed contract addresses (updated after deployment)
FACTORY_ADDRESS=
MOCK_ROUTER=
EOF
```

**⚠️ Important:** The private key above is Anvil's default test account. **NEVER use this in production!**

---

## Smart Contract Development

### Key Contracts

#### 1. Token.sol (ERC20)
Simple ERC20 token that mints entire supply to the LiquidityController.

#### 2. LiquidityController.sol (PLU Core)
Manages progressive liquidity unlocking:
- **Constructor params:** token, owner, lockedTokens, unlockDuration, epochDuration, router
- **initialize():** Adds initial liquidity to DEX
- **unlockEpoch():** Progressively unlocks tokens over time
- **manualAddLiquidity():** Owner can manually add liquidity
- **getUnlockProgress():** Returns unlock status

#### 3. TokenFactory.sol
Atomic deployment of Token + LiquidityController in one transaction.

#### 4. MockPancakeRouter.sol
Local DEX simulator with:
- `addLiquidityETH()` - Add liquidity
- `swapExactETHForTokens()` - Buy tokens
- `swapExactTokensForETH()` - Sell tokens

### Build Contracts

```bash
cd contracts

# Compile all contracts
forge build

# Should see:
# ✅ "Compiler run successful"
```

---

## Local Blockchain Setup (Anvil)

### Start Anvil

Open a **dedicated terminal** and run:

```bash
anvil --port 8545
```

**Keep this terminal running!** You should see:

```
Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000.000000000000000000 ETH)
...

Private Keys
==================
(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...

Listening on 127.0.0.1:8545
```

### Verify Anvil is Running

In a **new terminal**:

```bash
# Check if port 8545 is open
lsof -i :8545

# Test RPC connection
cast block-number --rpc-url http://127.0.0.1:8545
# Should return: 0 (genesis block)
```

---

## Contract Deployment

### 1. Deploy MockPancakeRouter

```bash
cd contracts

forge script script/DeployMockRouter.s.sol:DeployMockRouter \
  --rpc-url http://127.0.0.1:8545 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

**Expected Output:**
```
✅ [Success] Hash: 0x...
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Copy the contract address!**

### 2. Deploy TokenFactory

```bash
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url http://127.0.0.1:8545 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

**Expected Output:**
```
✅ [Success] Hash: 0x...
Contract Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Copy the contract address!**

### 3. Update .env Files

**contracts/.env:**
```bash
FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
MOCK_ROUTER=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4. Verify Deployment

```bash
# Check factory contract exists
cast code $FACTORY_ADDRESS --rpc-url http://127.0.0.1:8545

# Check router contract exists
cast code $MOCK_ROUTER --rpc-url http://127.0.0.1:8545

# Both should return bytecode (long hex strings)
```

---

## Frontend Setup

### 1. Initialize Next.js Frontend

```bash
# From project root
cd ../FrontendSample

# Install dependencies
npm install
```

### 2. Create Configuration Files

#### Create `lib/config.ts`:

```typescript
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Contract addresses
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') as `0x${string}`
export const PANCAKE_ROUTER = (process.env.NEXT_PUBLIC_PANCAKE_ROUTER || '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`

// Define Anvil local testnet
export const anvil = {
  id: 31337,
  name: 'Anvil',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
} as const

export const config = createConfig({
  chains: [anvil, mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [anvil.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
```

### 3. Update .env File

**FrontendSample/.env:**
```bash
# Contract addresses (update with your deployed addresses)
NEXT_PUBLIC_FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_PANCAKE_ROUTER=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4. Start Development Server

```bash
# From FrontendSample directory
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000

✓ Ready in 3s
```

---

## MetaMask Configuration

### 1. Add Anvil Network to MetaMask

1. Open MetaMask
2. Click network dropdown (top center)
3. Click "Add Network" → "Add a network manually"
4. Fill in:

```
Network Name:     Anvil Local
RPC URL:          http://127.0.0.1:8545
Chain ID:         31337
Currency Symbol:  ETH
```

5. Click "Save"

### 2. Import Test Account

1. Click account icon (top right)
2. Select "Import Account"
3. Choose "Private Key"
4. Paste:
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
5. Click "Import"

**You now have 10,000 ETH for testing!**

### 3. Switch to Anvil Network

1. Click network dropdown
2. Select "Anvil Local"
3. Verify you see your 10,000 ETH balance

---

## Testing the System

### Test 1: Deploy a Token via UI

1. **Open Browser:** http://localhost:3000
2. **Connect Wallet:** Click "Connect Wallet" → Select MetaMask
3. **Fill Deployment Form:**
   ```
   Token Name:              Test Token
   Token Symbol:            TEST
   Total Supply:            10000000 (10M tokens)
   Initial Liquidity:       20% (2M tokens)
   Locked Tokens:           80% (8M tokens)
   Unlock Duration:         30 days
   Epoch Duration:          1 day
   Initial ETH:             0.1 ETH
   ```
4. **Click "Deploy Token"**
5. **Confirm in MetaMask** (2 confirmations needed)
6. **Copy Addresses:** Note Token and Controller addresses

### Test 2: Initialize Liquidity

```bash
# Using cast (replace addresses with your deployed contracts)
TOKEN=0x... # Your token address
CONTROLLER=0x... # Your controller address

cast send $CONTROLLER \
  "initialize(uint256)" \
  1000000000000000000000000 \
  --value 0.1ether \
  --private-key $PRIVATE_KEY \
  --rpc-url http://127.0.0.1:8545
```

**Verify:**
```bash
# Check liquidity was added
cast call $CONTROLLER "tokensRemaining()" --rpc-url http://127.0.0.1:8545
```

### Test 3: Unlock Epochs (Time-based)

#### Fast-forward time in Anvil:

```bash
# Increase time by 1 day (86400 seconds)
cast rpc evm_increaseTime 86400 --rpc-url http://127.0.0.1:8545

# Mine a new block to apply time change
cast rpc evm_mine --rpc-url http://127.0.0.1:8545
```

#### Unlock epoch:

```bash
cast send $CONTROLLER \
  "unlockEpoch()" \
  --value 0.05ether \
  --private-key $PRIVATE_KEY \
  --rpc-url http://127.0.0.1:8545
```

#### Check progress:

```bash
cast call $CONTROLLER "getUnlockProgress()" --rpc-url http://127.0.0.1:8545
# Returns: (epochsUnlocked, totalEpochs, tokensUnlocked, tokensRemaining)
```

### Test 4: View in Dashboard

1. Navigate to http://localhost:3000/deployments
2. Click "Manage Liquidity" on your token
3. See:
   - ✅ Unlock progress (e.g., "1 / 30 epochs")
   - ✅ Tokens unlocked vs remaining
   - ✅ Transaction history
   - ✅ Countdown to next epoch

---

## Trading Tokens

### Add Token to MetaMask

1. Open MetaMask
2. Click "Import tokens"
3. Paste your token address
4. It should auto-fill: Name, Symbol, Decimals
5. Click "Add custom token"

### Method 1: Trade via UI

#### Navigate to Trading Page:
```
http://localhost:3000/trade
```

#### Buy Tokens:
1. Enter ETH amount (e.g., `0.01`)
2. See estimated tokens: `~100 TEST`
3. Click "Buy Tokens"
4. Confirm in MetaMask
5. Balance updates automatically

#### Sell Tokens:
1. Switch to "Sell Tokens" tab
2. Enter token amount (e.g., `50`)
3. Click "Approve Router" → Confirm in MetaMask
4. Click "Sell Tokens" → Confirm in MetaMask
5. ETH balance increases

### Method 2: Trade via Command Line

#### Buy tokens:

```bash
ROUTER=0x5FbDB2315678afecb367f032d93F642f64180aa3  # Your router
TOKEN=0x...  # Your token address
BUYER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  # Your address

cast send $ROUTER \
  "swapExactETHForTokens(uint256,address[],address,uint256)" \
  1 \
  "[0x0000000000000000000000000000000000000000,$TOKEN]" \
  $BUYER \
  999999999999 \
  --value 0.01ether \
  --private-key $PRIVATE_KEY \
  --rpc-url http://127.0.0.1:8545
```

#### Check balance:

```bash
cast call $TOKEN "balanceOf(address)" $BUYER --rpc-url http://127.0.0.1:8545
```

#### Approve router for selling:

```bash
cast send $TOKEN \
  "approve(address,uint256)" \
  $ROUTER \
  100000000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url http://127.0.0.1:8545
```

#### Sell tokens:

```bash
cast send $ROUTER \
  "swapExactTokensForETH(uint256,uint256,address[],address,uint256)" \
  50000000000000000000 \
  1 \
  "[$TOKEN,0x0000000000000000000000000000000000000000]" \
  $BUYER \
  999999999999 \
  --private-key $PRIVATE_KEY \
  --rpc-url http://127.0.0.1:8545
```

### Exchange Rate

Mock router uses: **1 ETH = 10,000 tokens**

---

## Troubleshooting

### Issue 1: Anvil Not Running

**Symptom:** `connection refused` errors

**Solution:**
```bash
# Check if Anvil is running
lsof -i :8545

# If not, restart Anvil
anvil --port 8545
```

### Issue 2: Contracts Not Found

**Symptom:** `contract not deployed` or `0x bytecode`

**Solution:** Anvil state is ephemeral. Redeploy contracts:
```bash
cd contracts
forge script script/DeployMockRouter.s.sol --rpc-url localhost --private-key $PRIVATE_KEY --broadcast
forge script script/DeployFactory.s.sol --rpc-url localhost --private-key $PRIVATE_KEY --broadcast
```

Update `.env` files with new addresses.

### Issue 3: MetaMask Transaction Errors

**Symptom:** "nonce too high" or "transaction failed"

**Solution:** Reset MetaMask account:
1. Settings → Advanced → Clear activity tab data
2. OR manually set nonce in transaction confirmation

### Issue 4: Frontend Can't Find Contracts

**Symptom:** "Module not found: @/lib/config"

**Solution:**
```bash
cd FrontendSample
mkdir -p lib
# Create lib/config.ts and lib/abi.ts (see Frontend Setup section)
```

### Issue 5: Time-based Epoch Not Unlocking

**Symptom:** `unlockEpoch()` reverts

**Solution:** Fast-forward Anvil time:
```bash
cast rpc evm_increaseTime 86400 --rpc-url http://127.0.0.1:8545
cast rpc evm_mine --rpc-url http://127.0.0.1:8545
```

### Issue 6: Port Already in Use

**Symptom:** `address already in use`

**Solution:**
```bash
# Kill process on port 8545
lsof -ti:8545 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## Quick Reference Commands

### Restart Everything

```bash
# Terminal 1: Anvil
anvil --port 8545

# Terminal 2: Deploy contracts
cd contracts
forge build
forge script script/DeployMockRouter.s.sol --rpc-url localhost --private-key $PRIVATE_KEY --broadcast
forge script script/DeployFactory.s.sol --rpc-url localhost --private-key $PRIVATE_KEY --broadcast

# Update .env files with new addresses!

# Terminal 3: Frontend
cd FrontendSample
npm run dev
```

### Check System Status

```bash
# Anvil running?
lsof -i :8545

# Frontend running?
lsof -i :3000

# Contracts deployed?
cast code $FACTORY_ADDRESS --rpc-url http://127.0.0.1:8545
cast code $MOCK_ROUTER --rpc-url http://127.0.0.1:8545

# Account balance?
cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url http://127.0.0.1:8545
```

### Useful Cast Commands

```bash
# Get block number
cast block-number --rpc-url http://127.0.0.1:8545

# Get contract bytecode
cast code <address> --rpc-url http://127.0.0.1:8545

# Call view function
cast call <contract> "functionName()" --rpc-url http://127.0.0.1:8545

# Send transaction
cast send <contract> "functionName(args)" --value 0.1ether --private-key $PRIVATE_KEY --rpc-url http://127.0.0.1:8545

# Decode hex to decimal
cast --to-dec 0x...

# Time travel (Anvil only)
cast rpc evm_increaseTime 86400 --rpc-url http://127.0.0.1:8545
cast rpc evm_mine --rpc-url http://127.0.0.1:8545
```

---

## Architecture Deep Dive

### PLU Mechanism Explained

1. **Deploy:** TokenFactory creates Token + LiquidityController atomically
2. **Initialize:** Add initial liquidity (e.g., 20% of supply + ETH)
3. **Lock:** Remaining 80% locked in controller
4. **Unlock:** Over 30 epochs (days), tokens progressively unlock
5. **Each Epoch:** ~2.67% of locked tokens added as liquidity
6. **Result:** Gradual liquidity increase, reduced volatility

### Benefits

- **For Projects:** Sustainable growth, reduced sell pressure
- **For Investors:** Transparent unlocking schedule, less volatility
- **For Liquidity:** Predictable depth increases, better price stability

### Gas Costs (Anvil)

- Deploy token: ~0.0025 ETH
- Initialize liquidity: ~0.0001 ETH
- Unlock epoch: ~0.00005 ETH

---

## Production Deployment (BSC Testnet/Mainnet)

### Environment Setup

**.env for BSC Testnet:**
```bash
PRIVATE_KEY=<your-private-key>
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
BSC_API_KEY=<your-bscscan-api-key>
```

### Deploy to BSC Testnet

```bash
# Deploy router
forge script script/DeployMockRouter.s.sol \
  --rpc-url $BSC_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify

# Deploy factory
forge script script/DeployFactory.s.sol \
  --rpc-url $BSC_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

### Frontend Configuration

Update `.env` with production addresses and use real PancakeSwap router on mainnet.

---

## Security Considerations

⚠️ **WARNING:** This is a development/testing setup. For production:

1. **Never commit private keys** - Use hardware wallets or key management services
2. **Audit smart contracts** - Get professional security audit before mainnet
3. **Test extensively** - Test on testnet before mainnet deployment
4. **Use real PancakeSwap router** - Don't use MockRouter in production
5. **Set proper access controls** - Review onlyOwner functions
6. **Monitor transactions** - Set up alerts for suspicious activity

---

## Support & Resources

- **Foundry Book:** https://book.getfoundry.sh/
- **Wagmi Docs:** https://wagmi.sh/
- **OpenZeppelin:** https://docs.openzeppelin.com/
- **BNB Chain Docs:** https://docs.bnbchain.org/

---

## Summary Checklist

- [ ] Foundry installed (`forge`, `cast`, `anvil`)
- [ ] Node.js & npm installed
- [ ] MetaMask browser extension installed
- [ ] Anvil running on port 8545
- [ ] Contracts compiled (`forge build`)
- [ ] MockRouter deployed & address saved
- [ ] TokenFactory deployed & address saved
- [ ] `.env` files updated with contract addresses
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend running on port 3000
- [ ] MetaMask configured with Anvil network (Chain ID: 31337)
- [ ] Test account imported to MetaMask
- [ ] Token deployed via UI
- [ ] Liquidity initialized
- [ ] Epochs unlocked successfully
- [ ] Tokens traded (buy & sell)

---

**🎉 Congratulations!** You now have a fully functional Progressive Liquidity Unlock token system running locally. Happy testing!

---

*Last updated: February 28, 2026*
