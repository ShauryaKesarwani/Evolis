# Anvil Local Testing Guide

## Overview
Your PLU (Progressive Liquidity Unlock) system is now deployed on **Anvil**, Foundry's local blockchain. Anvil is faster and more feature-complete than Ganache, supporting the latest EVM opcodes.

## Deployed Contracts (Anvil - Chain ID 31337)

```
MockPancakeRouter:  0x5FbDB2315678afecb367f032d93F642f64180aa3
TokenFactory:       0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

Test Token:         0xCafac3dD18aC6c6e92c921884f9E4176737C052c
Test Controller:    0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e
```

## Default Anvil Account
```
Address:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC URL:     http://127.0.0.1:8545
Chain ID:    31337
```

## Quick Start

### 1. Start Anvil (if not running)
```bash
anvil --port 8545
```
Keep this terminal open. Anvil provides 10 accounts each with 10,000 ETH.

### 2. Deploy Contracts
```bash
cd Contracts
source .env

# Deploy mock router
forge script script/DeployMockRouter.s.sol --rpc-url localhost --private-key $PRIVATE_KEY --broadcast

# Deploy factory
forge script script/DeployFactory.s.sol --rpc-url localhost --private-key $PRIVATE_KEY --broadcast

# Deploy test token
forge script script/DeployToken.s.sol --rpc-url localhost --private-key $PRIVATE_KEY --broadcast
```

### 3. Run Frontend
```bash
cd ../Frontend
npm install
npm run dev
```

Open http://localhost:3000

### 4. Connect MetaMask to Anvil

1. **Add Anvil Network**:
   - Network Name: `Anvil Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Import Test Account**:
   - Use private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account has 10,000 ETH for testing

3. **Connect Wallet** in the frontend

## Testing Progressive Liquidity Unlock

### Check Current State
```bash
cd Contracts
cast call 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e "nextUnlockTime()" --rpc-url localhost
```

### Advance Time (30 days forward)
```bash
cast rpc evm_increaseTime 2592000 --rpc-url localhost
cast rpc evm_mine --rpc-url localhost
```

### Trigger Epoch Unlock
```bash
cast send 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e "unlockEpoch()" \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url localhost
```

### Check Token Balance
```bash
# Check controller's token balance
cast call 0xCafac3dD18aC6c6e92c921884f9E4176737C052c "balanceOf(address)" 0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e --rpc-url localhost
```

## Why Anvil Over Ganache?

✅ **Native Foundry Integration** - Same toolchain  
✅ **Latest EVM Support** - Supports PUSH0 opcode (Solidity 0.8.20+)  
✅ **Faster** - Written in Rust, much faster than Ganache  
✅ **Better Control** - `evm_increaseTime`, `evm_mine` for time manipulation  
✅ **Auto-mining** - Instant transaction confirmation  

## Common Commands

### Check Block Number
```bash
cast block-number --rpc-url localhost
```

### Check Balance
```bash
cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url localhost
```

### Get Transaction Receipt
```bash
cast receipt <TX_HASH> --rpc-url localhost
```

### Reset Blockchain (restart from block 0)
Stop Anvil (Ctrl+C) and restart it.

## Deployment Parameters Used

- **Token**: Test Token (TEST)
- **Supply**: 1,000,000 tokens
- **Initial Liquidity**: 20% (200,000 tokens)
- **Unlock Duration**: 30 days total
- **Epoch Duration**: 1 day
- **Router**: MockPancakeRouter (simulates PancakeSwap)

## Next Steps

1. ✅ Contracts deployed successfully
2. ✅ Frontend configured with factory address
3. 🔄 Test token deployment via UI
4. 🔄 Test epoch unlock mechanism
5. 🔄 Deploy to BSC Testnet (when ready)

## Troubleshooting

### Anvil not responding
```bash
# Kill any existing anvil process
killall anvil
# Restart
anvil --port 8545
```

### Nonce issues
```bash
# Reset by restarting Anvil
```

### MetaMask issues
- Clear activity/nonce data in MetaMask settings
- Reset account in MetaMask (Settings → Advanced → Clear activity tab data)

## Resources

- [Anvil Documentation](https://book.getfoundry.sh/reference/anvil/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Cast Commands](https://book.getfoundry.sh/reference/cast/)
