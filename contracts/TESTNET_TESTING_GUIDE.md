# BSC Testnet Manual Testing Guide

## Quick Setup

```bash
cd /Users/utkarshmani/Desktop/GitHub/BNB_HACK/contracts
source .env
```

## Deployed Testnet Addresses

```bash
TOKEN_ADDRESS="0x81dC09fd1068B5E17A71837f022EF5E64d687733"
CONTROLLER_ADDRESS="0x2cDF43E979E39f72c0214487e6E30AcD2dA91Bef"
ROUTER_ADDRESS="0x58c2F3Cc5589d5F55b19Da33f90257A38E364F02"
FACTORY_ADDRESS="0x8ad0254e5b12A713f1c9E486C73eBF449562B210"

RPC="https://data-seed-prebsc-1-s1.binance.org:8545/"
CHAIN_ID=97
```

---

## Test 1: Check Token Balance

```bash
# Get your wallet address
MY_ADDR=$(cast wallet show --private-key $PRIVATE_KEY 2>/dev/null | head -1)

# Check your token balance
cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $MY_ADDR --rpc-url $RPC

# Convert to readable format
cast --to-dec $(cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $MY_ADDR --rpc-url $RPC)
```

**Expected:** Your deployer should have tokens from the initial deployment

---

## Test 2: Check Controller Balance

```bash
# Check how many tokens the controller holds (locked tokens)
cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $CONTROLLER_ADDRESS --rpc-url $RPC

# Convert to readable
cast --to-dec $(cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $CONTROLLER_ADDRESS --rpc-url $RPC)
```

**Expected:** Controller should hold ~80% of total supply (locked)

---

## Test 3: Check Total Supply

```bash
# Check total token supply
cast call $TOKEN_ADDRESS 'totalSupply()(uint256)' --rpc-url $RPC

# Convert to readable
cast --to-dec $(cast call $TOKEN_ADDRESS 'totalSupply()(uint256)' --rpc-url $RPC)
```

**Expected:** Should show your initial token amount (e.g., 10M tokens = 10000000000000000000000000 Wei)

---

## Test 4: Transfer Tokens

Replace `RECIPIENT` with an actual address:

```bash
RECIPIENT="0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
AMOUNT="100000000000000000000"  # 100 tokens (18 decimals)

cast send $TOKEN_ADDRESS 'transfer(address,uint256)(bool)' $RECIPIENT $AMOUNT \
  --rpc-url $RPC \
  --private-key $PRIVATE_KEY \
  --chain $CHAIN_ID
```

**What to expect:**
- ✅ Transaction hash returned
- ✅ Transfer successful
- Verify: Check recipient balance after transaction

---

## Test 5: Approve Token Spending

```bash
APPROVE_AMOUNT="5000000000000000000000"  # 5000 tokens

cast send $TOKEN_ADDRESS 'approve(address,uint256)(bool)' $ROUTER_ADDRESS $APPROVE_AMOUNT \
  --rpc-url $RPC \
  --private-key $PRIVATE_KEY \
  --chain $CHAIN_ID
```

**What to expect:**
- ✅ Transaction hash
- Router can now use up to 5000 of your tokens

---

## Test 6: Check Allowance

```bash
MY_ADDR=$(cast wallet show --private-key $PRIVATE_KEY 2>/dev/null | head -1)

cast call $TOKEN_ADDRESS 'allowance(address,address)(uint256)' $MY_ADDR $ROUTER_ADDRESS --rpc-url $RPC

# Convert to readable
cast --to-dec $(cast call $TOKEN_ADDRESS 'allowance(address,address)(uint256)' $MY_ADDR $ROUTER_ADDRESS --rpc-url $RPC)
```

**Expected:** Should show the approved amount (5000 tokens)

---

## Test 7: Check Current Epoch

```bash
cast call $CONTROLLER_ADDRESS 'currentEpoch()(uint256)' --rpc-url $RPC
```

**Expected:** Should return 0 or low number (starts at 0)

---

## Test 8: Check Locked Tokens in Controller

```bash
cast call $CONTROLLER_ADDRESS 'totalLocked()(uint256)' --rpc-url $RPC

# Convert to readable
cast --to-dec $(cast call $CONTROLLER_ADDRESS 'totalLocked()(uint256)' --rpc-url $RPC)
```

**Expected:** Should show amount of locked tokens

---

## Test 9: Unlock One Epoch

```bash
cast send $CONTROLLER_ADDRESS 'unlockEpoch()(bool)' \
  --rpc-url $RPC \
  --private-key $PRIVATE_KEY \
  --chain $CHAIN_ID
```

**What to expect:**
- ✅ Transaction hash on success
- ⚠️ May fail if less than 1 day has passed
- Check epoch after unlock (should increase by 1)

---

## Test 10: Check Your Balance After Unlock

```bash
MY_ADDR=$(cast wallet show --private-key $PRIVATE_KEY 2>/dev/null | head -1)

cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $MY_ADDR --rpc-url $RPC

# Convert
cast --to-dec $(cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $MY_ADDR --rpc-url $RPC)
```

**Expected:** Balance should increase slightly (1/30 of locked amount per epoch)

---

## Test 11: Check Router State

```bash
# Check if router has any liquidity
cast call $ROUTER_ADDRESS 'getReserves()(uint112,uint112,uint32)' --rpc-url $RPC
```

**Expected:** Returns (reserve0, reserve1, lastUpdate)
- If all zeros: no liquidity yet
- If non-zero: pool has liquidity

---

## Test 12: Check Anti-Whale Status

```bash
# Check if whale protection is enabled
cast call $TOKEN_ADDRESS 'whaleProtectionEnabled()(bool)' --rpc-url $RPC

# Check whale fee percentage (in basis points)
cast call $TOKEN_ADDRESS 'whaleFeeBPS()(uint256)' --rpc-url $RPC
```

**Expected:**
- `true` or `false` for enabled status
- Fee in BPS (500 = 5%, 1000 = 10%, etc.)

---

## Bonus: Get Current Block Info

```bash
# Current block number
cast block-number --rpc-url $RPC

# Current timestamp
cast block timestamp --rpc-url $RPC

# Gas price
cast gas-price --rpc-url $RPC
```

---

## Troubleshooting

### "Insufficient balance" error
- You need test BNB for gas
- Get from: https://testfaucet.binance.org/

### "VM Execution Reverted"
- Could mean contract logic rejected the transaction
- Check token balance is sufficient
- Check allowance is set before transferFrom

### "Environment variable not found"
- Make sure you're in the contracts directory
- Run: `source .env` to load variables

### Transaction taking long time
- BSC Testnet can be slow (5-30 seconds)
- Check status on: https://testnet.bscscan.com/
- Paste tx hash to verify

---

## Verification on BscScan

Once transactions complete, verify them:

1. **Token Contract**: https://testnet.bscscan.com/address/0x81dC09fd1068B5E17A71837f022EF5E64d687733
2. **Controller**: https://testnet.bscscan.com/address/0x2cDF43E979E39f72c0214487e6E30AcD2dA91Bef
3. **Router**: https://testnet.bscscan.com/address/0x58c2F3Cc5589d5F55b19Da33f90257A38E364F02
4. **Factory**: https://testnet.bscscan.com/address/0x8ad0254e5b12A713f1c9E486C73eBF449562B210

---

## Next Steps After Testing

If all tests pass:
1. ✅ Update frontend with contract addresses
2. ✅ Test frontend interaction with contracts
3. ✅ Deploy to BSC Mainnet (real stakes)
4. ✅ Launch token publicly

