# Quick Start Guide

## Prerequisites

- **Foundry**: Smart contract development framework
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

- **Node.js 18+**: JavaScript runtime
  ```bash
  # Download from https://nodejs.org/
  node --version  # Should be 18+
  ```

- **Local Blockchain** (choose one):
  - **Anvil** (Recommended - comes with Foundry, supports latest EVM)
    ```bash
    anvil --port 8545
    ```
  - **Ganache** (Alternative)
    - Download from [Truffle Suite](https://trufflesuite.com/ganache/)
    - Note: Ganache doesn't support Solidity 0.8.20+ (PUSH0 opcode)

- **Wallet with BNB**: MetaMask recommended
  - Get testnet BNB from [BSC Faucet](https://testnet.bnbchain.org/faucet-smart)

## Automated Setup

Run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
1. Install Foundry dependencies
2. Build smart contracts
3. Run tests
4. Install frontend dependencies
5. Create environment files

## Manual Setup

### 1. Smart Contracts

```bash
cd Contracts

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts

# Setup environment
cp .env.example .env
nano .env  # Add your PRIVATE_KEY and Ganache RPC

# Build
forge build

# Test
forge test

# Load environment variables (required before deployment)
source .env
```

### 2. Frontend

```bash
cd Frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
nano .env.local  # Add WalletConnect Project ID
```

## Deployment

### Deploy Factory (One-time)

```bash
cd Contracts

# Load environment variables
source .env

# Option 1: Deploy to Ganache (Local Testing)
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url ganache \
  --private-key $PRIVATE_KEY \
  --broadcast

# Option 2: Deploy to BSC Testnet
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url bsc_testnet \
  --broadcast \
  --private-key $PRIVATE_KEY

# Option 3: Deploy to BSC Mainnet (Production)
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url bsc_mainnet \
  --broadcast \
  --private-key $PRIVATE_KEY \
  --verify

# Save the factory address from output
```

### Update Frontend Config

Edit `Frontend/.env.local`:
```env
NEXT_PUBLIC_FACTORY_ADDRESS=0x...  # Your deployed factory address
```

### Start Frontend

```bash
cd Frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deploy Your First Token

1. **Connect Wallet**: Click "Connect" button
2. **Fill Form**:
   - Name: "Test Token"
   - Symbol: "TEST"
   - Total Supply: 1000000
   - Initial Liquidity: 20%
   - BNB Amount: 0.1
   - Unlock Duration: 30 days
   - Epoch Duration: 1 day

3. **Review Calculations**: Check derived values
4. **Deploy**: Sign transaction
5. **Success**: View on "My Deployments"

## Testing Unlocks

After deployment, you can trigger epoch unlocks:

```bash
# Using cast (Foundry CLI)
cast send <CONTROLLER_ADDRESS> "unlockEpoch()" \
  --value 0.01ether \
  --rpc-url $BSC_TESTNET_RPC \
  --private-key $PRIVATE_KEY
```

Or wait for time to pass and trigger via frontend.

## Troubleshooting

### "Insufficient funds"
- Get testnet BNB from faucet
- Ensure you have enough for gas + liquidity

### "Contract not found"
- Verify factory address in `.env.local`
- Check you're on correct network (BSC Testnet)

### "Transaction reverted"
- Check all inputs are valid
- Ensure unlock duration >= epoch duration
- Verify initial liquidity % is 1-99%

### Frontend not loading
- Ensure Node version is 18+
- Delete `node_modules` and reinstall
- Clear Next.js cache: `rm -rf .next`

## Next Steps

- Deploy to BSC Mainnet (update RPC URLs)
- Customize frontend styling
- Add more features (charts, analytics, etc.)
- Integrate with additional AMMs

## Support

For issues:
1. Check existing documentation
2. Review error messages carefully
3. Test on BSC Testnet first
4. Open an issue on GitHub

---

Happy Building! 🚀
