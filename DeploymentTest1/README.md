# Token Factory with Progressive Liquidity Unlock (PLU)

Complete system for deploying ERC20 tokens with automatic progressive liquidity unlock on BSC.

## 🎯 What is Progressive Liquidity Unlock?

Progressive Liquidity Unlock (PLU) is a mechanism that:
- Starts with limited liquidity in the AMM pool
- Gradually releases locked tokens over time
- Injects them into the liquidity pool at regular intervals
- Reduces early-stage volatility
- Builds trust through predictable, deterministic releases

## 🏗️ Architecture

### Smart Contracts (Foundry)

```
Contracts/
├── src/
│   ├── Token.sol               # ERC20 token template
│   ├── LiquidityController.sol # PLU mechanism
│   └── TokenFactory.sol        # Atomic deployment orchestrator
├── script/
│   ├── DeployFactory.s.sol     # Deploy factory
│   └── DeployToken.s.sol       # Deploy token via factory
└── test/
    └── TokenFactory.t.sol      # Test suite
```

### Frontend (Next.js + Wagmi)

```
Frontend/
├── app/
│   ├── page.tsx               # Home & deployment interface
│   └── deployments/page.tsx   # View user deployments
├── components/
│   ├── DeploymentForm.tsx     # Main deployment form
│   ├── ConnectWallet.tsx      # Wallet connection
│   └── MyDeployments.tsx      # Deployment list
└── lib/
    ├── abi.ts                 # Contract ABIs
    └── config.ts              # Wagmi configuration
```

## 🚀 Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js 18+](https://nodejs.org/)
- [MetaMask](https://metamask.io/) or compatible wallet

### 1. Deploy Smart Contracts

```bash
cd Contracts

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts

# Setup environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# Deploy Factory to BSC Testnet
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545/ \
  --broadcast \
  --verify

# Save the factory address for frontend
```

### 2. Setup Frontend

```bash
cd Frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with:
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (from https://cloud.walletconnect.com/)
# - NEXT_PUBLIC_FACTORY_ADDRESS (from step 1)

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 How It Works

### Deployment Flow

1. **User submits configuration:**
   - Token name & symbol
   - Total supply
   - Initial liquidity % (e.g., 20%)
   - BNB deposit amount
   - Unlock duration (e.g., 30 days)
   - Epoch duration (e.g., 1 day)

2. **System derives parameters:**
   ```
   initialTokens = totalSupply × (initialLiquidityPercent / 100)
   lockedTokens = totalSupply - initialTokens
   totalEpochs = unlockDuration / epochDuration
   unlockPerEpoch = lockedTokens / totalEpochs
   ```

3. **Factory executes atomically:**
   - ✅ Deploy Token contract
   - ✅ Deploy LiquidityController
   - ✅ Mint full supply to controller
   - ✅ Add initial liquidity (tokens + BNB) to PancakeSwap
   - ✅ Configure unlock schedule

### Progressive Unlock

After deployment:
- Remaining tokens locked in LiquidityController
- Time-based deterministic releases
- Every epoch: `unlockPerEpoch` tokens released
- Anyone can trigger unlock (permissionless)
- Tokens automatically added to AMM pool

### Example Configuration

**Scenario:** Conservative long-term launch
```
Token: MyToken (MTK)
Total Supply: 1,000,000 MTK
Initial Liquidity: 20% (200,000 MTK)
Locked Tokens: 80% (800,000 MTK)
Unlock Duration: 30 days
Epoch Duration: 1 day
→ Total Epochs: 30
→ Unlock Per Epoch: 26,666.67 MTK
```

**Timeline:**
- Day 0: 200,000 MTK in pool (20%)
- Day 1: +26,667 MTK (22.67%)
- Day 2: +26,667 MTK (25.33%)
- ...
- Day 30: Full 1,000,000 MTK in pool (100%)

## 🔧 Smart Contract Details

### Token.sol
Simple ERC20 implementation using OpenZeppelin. Mints entire supply to LiquidityController on deployment.

### LiquidityController.sol
Manages PLU mechanism:
- `initialize()`: Add initial liquidity (called by factory)
- `unlockEpoch()`: Release and inject epoch tokens (public)
- `getUnlockableEpochs()`: Check how many epochs ready
- `getTimeUntilNextEpoch()`: Countdown to next unlock
- `getUnlockProgress()`: View unlock status

### TokenFactory.sol
Orchestrates atomic deployment:
- `deployTokenV2()`: Main deployment function
- `getUserDeployments()`: Get user's tokens
- `getTotalDeployments()`: Total deployed tokens
- `deploymentInfo()`: Token details

## 🛡️ Security Features

- ✅ **Atomic deployment**: All-or-nothing transaction
- ✅ **Immutable parameters**: Cannot change after deployment
- ✅ **Time-based**: No admin control over unlocks
- ✅ **Deterministic**: Predictable release schedule
- ✅ **Permissionless**: Anyone can trigger unlocks
- ✅ **Verified contracts**: On-chain verification

## 📊 Use Cases

### New Token Launches
- Reduce initial volatility
- Build trust with gradual liquidity
- Prevent liquidity dumps

### Community Tokens
- Fair distribution over time
- Predictable market depth
- Transparent tokenomics

### Project Tokens
- Align with development milestones
- Grow liquidity as project matures
- Community-triggered unlocks

## 🎨 Frontend Features

- **Wallet Integration**: MetaMask, WalletConnect, Coinbase
- **Real-time Calculations**: Live parameter preview
- **Transaction Tracking**: Monitor deployment status
- **Deployment Dashboard**: View all your tokens
- **PancakeSwap Links**: Direct trading integration
- **BSCScan Integration**: Verify on explorer
- **Responsive Design**: Mobile & desktop

## 🧪 Testing

```bash
cd Contracts

# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test testDeployToken
```

## 📝 Configuration Examples

### Conservative (Long-term)
```json
{
  "initialLiquidityPercent": 10,
  "unlockDuration": "180 days",
  "epochDuration": "7 days"
}
```
90% unlocks over 6 months (weekly)

### Moderate (Mid-term)
```json
{
  "initialLiquidityPercent": 20,
  "unlockDuration": "30 days",
  "epochDuration": "1 day"
}
```
80% unlocks over 1 month (daily)

### Aggressive (Short-term)
```json
{
  "initialLiquidityPercent": 40,
  "unlockDuration": "7 days",
  "epochDuration": "1 day"
}
```
60% unlocks over 1 week (daily)

## 🌐 Networks

- **BSC Mainnet**: Production deployments
- **BSC Testnet**: Testing & development
- Router: PancakeSwap V2

## 📚 Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Wagmi Docs](https://wagmi.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [PancakeSwap Docs](https://docs.pancakeswap.finance/)
- [BSC Docs](https://docs.bnbchain.org/)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **BSCScan**: [Verify contracts](https://bscscan.com/)
- **PancakeSwap**: [Trade tokens](https://pancakeswap.finance/)
- **WalletConnect**: [Get Project ID](https://cloud.walletconnect.com/)

## ⚠️ Disclaimer

This is educational/experimental software. Use at your own risk. Always audit smart contracts before mainnet deployment.

---

Built for BNB Chain Hackathon 🚀
