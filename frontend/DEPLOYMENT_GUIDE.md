# Evolis Frontend Deployment Guide

## Issue Found
The frontend was calling `deployTokenV2()` which doesn't exist on EvolisFactory (0x8EAb99cc7C69E83f3e84E4253EDB45DC0b9Acdb0).

## Current Architecture

EvolisFactory only has `createPool()` which requires an **existing token address**.

### Proper Deployment Flow

#### Step 1: Deploy Token & Controller (Using Forge)

```bash
cd contracts
source .env

# Edit script/DeployToken.s.sol with your token details, then:
forge script script/DeployToken.s.sol:DeployToken \
  --rpc-url $BSC_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BSC_API_KEY \
  -vvvv
```

This deploys:
- Token contract
- LiquidityController contract  
- Transfers tokens to controller

Save the addresses from the output!

#### Step 2: Fund the Pool with Tokens

```bash
# Withdraw tokens from controller
cast send $CONTROLLER_ADDRESS \
  "withdrawTokens(uint256)" 400000000000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC \
  --chain 97

# Create .env with TOKEN_ADDRESS and EVOLIS_POOL
# Deploy pool first (Step 3), then transfer tokens to it
cast send $TOKEN_ADDRESS \
  "transfer(address,uint256)" $EVOLIS_POOL 400000000000000000000000 \
 --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC \
  --chain 97
```

#### Step 3: Create Pool via Factory (Frontend or Script)

**Option A: Using Forge Script**
```bash
# Edit script/DeployPool.s.sol with pool config, then:
forge script script/DeployPool.s.sol:DeployPool \
  --rpc-url $BSC_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

**Option B: Using Frontend (after updates)**
- Connect wallet
- Enter your pre-deployed token address
- Fill in pool configuration
- Click "Create Pool"

## Frontend Usage

### For Users
1. **Deploy your token first** using the forge commands above
2. **Note your token address**
3. Open the Evolis frontend
4. **Connect wallet** to BSC Testnet
5. Go to "Create Campaign"
6. **Enter your token address** in the token field
7. Fill in pool details:
   - Bonding supply (e.g., 400,000 tokens)
   - Initial price (e.g., 0.000001 BNB per token)
   - Funding goal (e.g., 1 BNB)
   - Deadlines
8. Click "Create Pool"

## Contract Addresses (BSC Testnet)

```
Factory:    0x8EAb99cc7C69E83f3e84E4253EDB45DC0b9Acdb0
Token:      0x0215750eE2e2Be92f4F5091579709A357e37fB4a
Controller: 0x1c7e4029FB7728a2A0E30d3aa2AfB09cb0613D5f
Pool:       0x6f434378dCf0269dC67AE2A53B79DF65aac89F2A
Router:     0x0B306BF915C4d645ff596e518fAf3F9669b97016
```

## Testing

```bash
# Preview buy
cast call $EVOLIS_POOL "previewBuy(uint256)(uint256,uint256)" 10000000000000000 --rpc-url $BSC_TESTNET_RPC

# Buy tokens
cast send $EVOLIS_POOL \
  "buyBondingCurve(uint256)" 1 \
  --value 10000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $BSC_TESTNET_RPC \
  --chain 97
```

✅ **Contracts are fully functional on BSC Testnet!**
