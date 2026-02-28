# Evolis Contract Deployment Guide

Complete guide for deploying the Evolis milestone-based crowdfunding system.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Deployment (Anvil)](#local-deployment-anvil)
- [BSC Testnet Deployment](#bsc-testnet-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Testing Buy Functionality](#testing-buy-functionality)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- **Foundry** (forge, cast, anvil)
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- **Node.js** v18+ (for frontend integration)
- **Git** for version control

### Required Accounts
- **BSC Testnet BNB**: Get from [official faucet](https://testnet.bnbchain.org/faucet-smart)
- **Private Key**: Deployer wallet with sufficient testnet BNB (~1 BNB recommended)

---

## Environment Setup

### 1. Configure Environment Variables

Navigate to the contracts directory and edit `.env`:

```bash
cd contracts
cp .env.example .env  # if needed
```

Update the following variables in `.env`:

```bash
# Private key for deployment (DO NOT COMMIT REAL KEYS)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# RPC URLs
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
ANVIL_RPC=http://127.0.0.1:8545

# BSC API Key for contract verification (optional)
BSC_API_KEY=YOUR_BSCSCAN_API_KEY
```

### 2. Load Environment Variables

```bash
source .env
```

### 3. Verify Foundry Installation

```bash
forge --version
cast --version
anvil --version
```

---

## Local Deployment (Anvil)

For local testing with instant transactions and unlimited funds.

### 1. Start Local Blockchain

```bash
# Start Anvil on port 8545
anvil --port 8545
```

Keep this terminal running. Anvil provides 10 pre-funded accounts with 10,000 ETH each.

### 2. Deploy Evolis System

In a new terminal:

```bash
cd contracts
source .env

# Deploy full system (Factory, Token, Pool, Controller)
forge script script/DeployEvolisSystem.s.sol:DeployEvolisSystem \
  --rpc-url $ANVIL_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 3. Save Deployment Addresses

The script will output:
```
EvolisFactory deployed at: 0x...
Token: 0x...
EvolisPool: 0x...
LiquidityController: 0x...
```

Export these for testing:
```bash
export EVOLIS_FACTORY=0x...
export TOKEN_ADDRESS=0x...
export EVOLIS_POOL=0x...
export CONTROLLER_ADDRESS=0x...
```

---

## BSC Testnet Deployment

### 1. Check Deployer Balance

```bash
cast balance 0x3C7569F913ed311D77b1e5fF1778617ba1db0492 \
  --rpc-url $BSC_TESTNET_RPC
```

Convert to BNB:
```bash
cast --to-unit <BALANCE_WEI> ether
```

**Minimum required**: ~0.01 BNB for deployment gas

### 2. Deploy to BSC Testnet

```bash
cd contracts
source .env

forge script script/DeployEvolisSystem.s.sol:DeployEvolisSystem \
  --rpc-url $BSC_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

**Expected Output:**
```
== Logs ==
  EvolisFactory deployed at: 0x2c281243A1013A9Be20a7415ee6D0CdCd8Aae39b
  === EVOLIS SYSTEM DEPLOYED ===
  Token: 0x4762610940Ad0aA5Aa7c6911E8EE690f8BDc2ed7
  EvolisPool: 0xc956ccb7E961FDE8689f54895F6c67e4E44C05F8
  LiquidityController: 0x3DCB43994B3e03b40F8FFba12a9950D1c968d761

✅ Sequence #1 on bsc-testnet | Total Paid: 0.0008329591 BNB
```

### 3. Update .env with Deployed Addresses

```bash
# Add to contracts/.env
EVOLIS_FACTORY=0x2c281243A1013A9Be20a7415ee6D0CdCd8Aae39b
TOKEN_ADDRESS=0x4762610940Ad0aA5Aa7c6911E8EE690f8BDc2ed7
EVOLIS_POOL=0xc956ccb7E961FDE8689f54895F6c67e4E44C05F8
CONTROLLER_ADDRESS=0x3DCB43994B3e03b40F8FFba12a9950D1c968d761
```

### 4. Export Variables for Current Session

```bash
export EVOLIS_FACTORY=0x2c281243A1013A9Be20a7415ee6D0CdCd8Aae39b
export TOKEN_ADDRESS=0x4762610940Ad0aA5Aa7c6911E8EE690f8BDc2ed7
export EVOLIS_POOL=0xc956ccb7E961FDE8689f54895F6c67e4E44C05F8
export CONTROLLER_ADDRESS=0x3DCB43994B3e03b40F8FFba12a9950D1c968d761
```

---

## Post-Deployment Verification

### 1. Verify Token Distribution

Check total supply (should be 1,000,000 tokens = 1e24 wei):
```bash
cast call $TOKEN_ADDRESS 'totalSupply()(uint256)' \
  --rpc-url $BSC_TESTNET_RPC
```

Check pool token balance (should be 400,000 tokens = 4e23 wei):
```bash
cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $EVOLIS_POOL \
  --rpc-url $BSC_TESTNET_RPC
```

Check controller token balance (should be 600,000 tokens = 6e23 wei):
```bash
cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $CONTROLLER_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC
```

### 2. Verify Pool Configuration

Check project owner:
```bash
cast call $EVOLIS_POOL 'projectOwner()(address)' \
  --rpc-url $BSC_TESTNET_RPC
```

Check linked token:
```bash
cast call $EVOLIS_POOL 'projectToken()(address)' \
  --rpc-url $BSC_TESTNET_RPC
```

Check linked controller:
```bash
cast call $EVOLIS_POOL 'controller()(address)' \
  --rpc-url $BSC_TESTNET_RPC
```

Check goal status:
```bash
cast call $EVOLIS_POOL 'goalReached()(bool)' \
  --rpc-url $BSC_TESTNET_RPC
```

### 3. Sanity Check: Verify Variables Point to Deployed Pool

```bash
# Echo current vars
echo $TOKEN_ADDRESS $EVOLIS_POOL

# Verify pool's token matches your TOKEN_ADDRESS
cast call $EVOLIS_POOL 'projectToken()(address)' \
  --rpc-url $BSC_TESTNET_RPC
```

---

## Testing Buy Functionality

### 1. Small Test Buy (0.01 BNB)

```bash
cast send $EVOLIS_POOL 'buyBondingCurve(uint256)' 1 \
  --value 10000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC \
  --chain 97
```

**Expected Result:**
- Transaction succeeds
- `to` field in receipt = your `$EVOLIS_POOL` address
- Tokens transferred to buyer

### 2. Verify Buy Results

Check total raised (should be 9.85e15 wei = 0.00985 BNB after 1.5% fees):
```bash
cast call $EVOLIS_POOL 'totalRaised()(uint256)' \
  --rpc-url $BSC_TESTNET_RPC
```

Check IL fund (should be 5e13 wei = 0.00005 BNB):
```bash
cast call $EVOLIS_POOL 'ilFund()(uint256)' \
  --rpc-url $BSC_TESTNET_RPC
```

Check buyer token balance (should be 9.85e18 wei = 9.85 tokens):
```bash
cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' YOUR_BUYER_ADDRESS \
  --rpc-url $BSC_TESTNET_RPC
```

### 3. Larger Buy (0.1 BNB)

```bash
cast send $EVOLIS_POOL 'buyBondingCurve(uint256)' 1 \
  --value 100000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC \
  --chain 97
```

**Expected Result:**
- Receive ~98.5 tokens (0.1 BNB * 1000 tokens/BNB * 0.985 after fees)

### 4. Convert Wei to Human-Readable

```bash
# Example: Convert token balance
cast --to-unit 98500000000000000000 ether
# Output: 98.500000000000000000

# Example: Convert BNB amount
cast --to-unit 9850000000000000 ether
# Output: 0.009850000000000000
```

---

## Troubleshooting

### Issue: "insufficient funds for transfer"

**Cause**: Deployer account lacks sufficient BNB for transaction.

**Solution**: Get testnet BNB from faucet:
- https://testnet.bnbchain.org/faucet-smart
- https://www.bnbchain.org/en/testnet-faucet

### Issue: Buy transaction goes to wrong pool

**Cause**: Environment variables pointing to old deployment addresses.

**Solution**:
1. Verify current addresses:
   ```bash
   echo $TOKEN_ADDRESS $EVOLIS_POOL
   ```

2. Re-export correct addresses from latest deployment:
   ```bash
   export EVOLIS_POOL=0xc956ccb7E961FDE8689f54895F6c67e4E44C05F8
   export TOKEN_ADDRESS=0x4762610940Ad0aA5Aa7c6911E8EE690f8BDc2ed7
   ```

3. Verify pool's token matches:
   ```bash
   cast call $EVOLIS_POOL 'projectToken()(address)' --rpc-url $BSC_TESTNET_RPC
   ```

### Issue: "server returned an error response: error code -32000"

**Cause**: RPC rate limiting or network issues.

**Solution**:
1. Try alternative BSC testnet RPC:
   ```bash
   export BSC_TESTNET_RPC=https://data-seed-prebsc-2-s1.binance.org:8545/
   ```

2. Add delay between transactions:
   ```bash
   sleep 2 && cast send ...
   ```

### Issue: Contract bytecode size exceeds 24KB

**Cause**: Contract too large for EVM deployment.

**Solution**: Already handled in `DeployEvolisSystem.s.sol` by:
- Using direct deployment (not TokenFactory wrapper)
- Enabling IR compilation pipeline in `foundry.toml`

### Issue: "a value is required for '--rpc-url <URL>'"

**Cause**: Environment variable not loaded or contains spaces.

**Solution**:
1. Re-source the `.env` file:
   ```bash
   source contracts/.env
   ```

2. Verify variable is set:
   ```bash
   echo $BSC_TESTNET_RPC
   ```

3. Use explicit URL if needed:
   ```bash
   --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545/
   ```

---

## Contract Addresses (Latest Deploy - Block 92932964)

**BSC Testnet:**
- EvolisFactory: `0x2c281243A1013A9Be20a7415ee6D0CdCd8Aae39b`
- Token: `0x4762610940Ad0aA5Aa7c6911E8EE690f8BDc2ed7`
- EvolisPool: `0xc956ccb7E961FDE8689f54895F6c67e4E44C05F8`
- LiquidityController: `0x3DCB43994B3e03b40F8FFba12a9950D1c968d761`

**Explorer Links:**
- [Factory](https://testnet.bscscan.com/address/0x2c281243A1013A9Be20a7415ee6D0CdCd8Aae39b)
- [Token](https://testnet.bscscan.com/address/0x4762610940Ad0aA5Aa7c6911E8EE690f8BDc2ed7)
- [Pool](https://testnet.bscscan.com/address/0xc956ccb7E961FDE8689f54895F6c67e4E44C05F8)
- [Controller](https://testnet.bscscan.com/address/0x3DCB43994B3e03b40F8FFba12a9950D1c968d761)

---

## Next Steps

After successful deployment:

1. **Frontend Integration**: Update frontend config with deployed addresses
2. **Test Campaign Flow**:
   - Multiple buys from different accounts
   - Reach funding goal (300 BNB)
   - Trigger epoch unlocks
   - Submit milestones
   - Claim LP tokens and IL compensation
3. **Mainnet Deployment**: Follow same process with mainnet RPC and real BNB

---

## Campaign Parameters

**Current Configuration:**
- Total Supply: 1,000,000 tokens
- Bonding Curve: 400,000 tokens (40%)
- Locked for Liquidity: 600,000 tokens (60%)
- Bonding Price: Fixed at 0.001 BNB per token (slope = 0)
- Funding Goal: 300 BNB
- Platform Fee: 1% of purchases
- IL Protection Fund: 0.5% of purchases
- Fundraise Deadline: 30 days from pool creation
- Milestone Deadline: 90 days after goal reached
- Unlock Schedule: 180 days total, 6 epochs of 30 days each
- Escrow Split: 50% to owner on goal, 50% for progressive liquidity

**To Customize:** Edit parameters in `script/DeployEvolisSystem.s.sol` before deployment.

---

## Support

For issues or questions:
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Review [BACKEND_SUMMARY.md](BACKEND_SUMMARY.md) for contract details
- See [CONTRACTS_SUMMARY.md](CONTRACTS_SUMMARY.md) for endpoint reference
