#!/bin/bash

# Load environment
source .env

RPC="https://data-seed-prebsc-1-s1.binance.org:8545/"
CHAIN_ID=97
TOKEN_ADDRESS="0x81dC09fd1068B5E17A71837f022EF5E64d687733"
CONTROLLER_ADDRESS="0x2cDF43E979E39f72c0214487e6E30AcD2dA91Bef"
ROUTER_ADDRESS="0x58c2F3Cc5589d5F55b19Da33f90257A38E364F02"

# Get wallet address
MY_ADDR=$(cast wallet show --private-key $PRIVATE_KEY 2>/dev/null | head -1)

echo "========================================"
echo "  BSC TESTNET CONTRACT TESTS"
echo "========================================"
echo ""
echo "Wallet: $MY_ADDR"
echo "RPC: BSC Testnet"
echo ""

# Test 1: Check balances
echo "[TEST 1] Check Token Balances"
echo "================================"
echo "Your balance:"
BALANCE=$(cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $MY_ADDR --rpc-url $RPC)
echo "  Raw: $BALANCE Wei"
BALANCE_DEC=$(cast --to-dec $BALANCE)
echo "  Decimal: $BALANCE_DEC tokens"
echo ""

echo "Controller balance (locked):"
CTRL_BALANCE=$(cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $CONTROLLER_ADDRESS --rpc-url $RPC)
echo "  Raw: $CTRL_BALANCE Wei"
CTRL_BALANCE_DEC=$(cast --to-dec $CTRL_BALANCE)
echo "  Decimal: $CTRL_BALANCE_DEC tokens"
echo ""

echo "Total supply:"
TOTAL=$(cast call $TOKEN_ADDRESS 'totalSupply()(uint256)' --rpc-url $RPC)
echo "  Raw: $TOTAL Wei"
TOTAL_DEC=$(cast --to-dec $TOTAL)
echo "  Decimal: $TOTAL_DEC tokens"
echo ""

# Test 2: Check epoch status
echo "[TEST 2] Check Epoch Status"
echo "================================"
EPOCH=$(cast call $CONTROLLER_ADDRESS 'currentEpoch()(uint256)' --rpc-url $RPC)
echo "Current epoch: $EPOCH"
echo ""

LOCKED=$(cast call $CONTROLLER_ADDRESS 'totalLocked()(uint256)' --rpc-url $RPC)
LOCKED_DEC=$(cast --to-dec $LOCKED)
echo "Total locked tokens: $LOCKED_DEC"
echo ""

# Test 3: Check anti-whale settings
echo "[TEST 3] Check Anti-Whale Protection"
echo "================================"
WHALE_ENABLED=$(cast call $TOKEN_ADDRESS 'whaleProtectionEnabled()(bool)' --rpc-url $RPC)
echo "Whale protection enabled: $WHALE_ENABLED"

WHALE_FEE=$(cast call $TOKEN_ADDRESS 'whaleFeeBPS()(uint256)' --rpc-url $RPC)
echo "Whale fee (BPS): $WHALE_FEE ($(echo "scale=2; $WHALE_FEE / 100" | bc)%)"
echo ""

# Test 4: Check allowance
echo "[TEST 4] Check Router Allowance"
echo "================================"
ALLOWANCE=$(cast call $TOKEN_ADDRESS 'allowance(address,address)(uint256)' $MY_ADDR $ROUTER_ADDRESS --rpc-url $RPC)
ALLOWANCE_DEC=$(cast --to-dec $ALLOWANCE)
echo "Current allowance to router: $ALLOWANCE_DEC tokens"
echo ""

# Test 5: Check gas price
echo "[TEST 5] Current Network Conditions"
echo "================================"
BLOCK=$(cast block-number --rpc-url $RPC)
echo "Block number: $BLOCK"

GASPRICE=$(cast gas-price --rpc-url $RPC)
GASPRICE_GWEI=$(cast --to-unit $GASPRICE gwei)
echo "Gas price: $GASPRICE_GWEI gwei"
echo ""

echo "========================================"
echo "✅ ALL READ-ONLY TESTS COMPLETED (FREE)"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Review the balances above"
echo "2. If balances look good, proceed with transaction tests:"
echo "   - Transfer test (costs ~50k gas = ~0.005 BNB)"
echo "   - Approve router (costs ~50k gas = ~0.005 BNB)"
echo "   - Unlock epoch (costs ~80k gas = ~0.008 BNB)"
echo ""
echo "Total estimated cost for all: ~0.02 BNB (you have 0.4 BNB, so plenty!)"
echo ""
