#!/bin/bash

# ================================================================
# BSC TESTNET MANUAL TESTING SCRIPT
# ================================================================
# This script provides step-by-step commands to test your deployed
# contracts on BSC Testnet using cast (from Foundry)
#
# Setup: Load your .env file first
# source .env
# ================================================================

echo "=========================================="
echo "  BSC TESTNET MANUAL TESTING"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
    echo "✓ Loaded .env file"
else
    echo "✗ .env file not found!"
    exit 1
fi

# Testnet Configuration
RPC="https://data-seed-prebsc-1-s1.binance.org:8545/"
CHAIN_ID=97

# Deployed Addresses (update these with your deployment results)
TOKEN_ADDRESS="0x81dC09fd1068B5E17A71837f022EF5E64d687733"
CONTROLLER_ADDRESS="0x2cDF43E979E39f72c0214487e6E30AcD2dA91Bef"
ROUTER_ADDRESS="0x58c2F3Cc5589d5F55b19Da33f90257A38E364F02"
FACTORY_ADDRESS="0x8ad0254e5b12A713f1c9E486C73eBF449562B210"

# Your wallet
DEPLOYER="0x$(cast wallet show --private-key $PRIVATE_KEY | head -1)"

echo ""
echo "Configuration:"
echo "  RPC: $RPC"
echo "  Chain ID: $CHAIN_ID"
echo "  Deployer: $DEPLOYER"
echo "  Token: $TOKEN_ADDRESS"
echo "  Controller: $CONTROLLER_ADDRESS"
echo "  Router: $ROUTER_ADDRESS"
echo ""
echo "=========================================="

# ================================================================
# SECTION 1: CHECK TOKEN BALANCES
# ================================================================
section_check_balances() {
    echo ""
    echo "[ SECTION 1: CHECK INITIAL BALANCES ]"
    echo ""
    
    echo "1.1 Check your token balance:"
    echo "Command:"
    echo "cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $DEPLOYER --rpc-url $RPC"
    echo ""
    BALANCE=$(cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $DEPLOYER --rpc-url $RPC)
    echo "Result: $BALANCE tokens (in Wei)"
    echo "To convert: cast --to-dec $BALANCE"
    echo ""
    
    echo "1.2 Check controller balance:"
    echo "Command:"
    echo "cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $CONTROLLER_ADDRESS --rpc-url $RPC"
    echo ""
    CONTROLLER_BALANCE=$(cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $CONTROLLER_ADDRESS --rpc-url $RPC)
    echo "Result: $CONTROLLER_BALANCE tokens (in Wei)"
    echo ""
    
    echo "1.3 Check total supply:"
    echo "Command:"
    echo "cast call $TOKEN_ADDRESS 'totalSupply()(uint256)' --rpc-url $RPC"
    echo ""
    TOTAL_SUPPLY=$(cast call $TOKEN_ADDRESS 'totalSupply()(uint256)' --rpc-url $RPC)
    echo "Result: $TOTAL_SUPPLY tokens (in Wei)"
    echo ""
}

# ================================================================
# SECTION 2: TEST TOKEN TRANSFERS
# ================================================================
section_token_transfer() {
    echo ""
    echo "[ SECTION 2: TEST TOKEN TRANSFERS ]"
    echo ""
    
    echo "2.1 Transfer 100 tokens to another address"
    TEST_ADDRESS="0x..."  # Replace with a test address
    AMOUNT="100000000000000000000"  # 100 tokens in Wei (18 decimals)
    
    echo "Command:"
    echo "cast send $TOKEN_ADDRESS 'transfer(address,uint256)(bool)' $TEST_ADDRESS $AMOUNT --rpc-url $RPC --private-key $PRIVATE_KEY --chain $CHAIN_ID"
    echo ""
    echo "⚠️  Uncomment the command above to execute (costs gas)"
    echo ""
}

# ================================================================
# SECTION 3: TEST APPROVALS & TRANSFERFROM
# ================================================================
section_approvals() {
    echo ""
    echo "[ SECTION 3: TEST APPROVALS & TRANSFERFROM ]"
    echo ""
    
    echo "3.1 Approve router to spend your tokens (for swaps)"
    APPROVE_AMOUNT="1000000000000000000000"  # 1000 tokens in Wei
    
    echo "Command:"
    echo "cast send $TOKEN_ADDRESS 'approve(address,uint256)(bool)' $ROUTER_ADDRESS $APPROVE_AMOUNT --rpc-url $RPC --private-key $PRIVATE_KEY --chain $CHAIN_ID"
    echo ""
    echo "⚠️  Uncomment the command above to execute (costs gas)"
    echo ""
    
    echo "3.2 Check approved amount:"
    echo "Command:"
    echo "cast call $TOKEN_ADDRESS 'allowance(address,address)(uint256)' $DEPLOYER $ROUTER_ADDRESS --rpc-url $RPC"
    echo ""
}

# ================================================================
# SECTION 4: TEST AMM SWAPS
# ================================================================
section_amm_swaps() {
    echo ""
    echo "[ SECTION 4: TEST AMM SWAPS ]"
    echo ""
    
    echo "4.1 Check router reserves (pool state):"
    echo "Command:"
    echo "cast call $ROUTER_ADDRESS 'getReserves()(uint112,uint112,uint32)' --rpc-url $RPC"
    echo ""
    echo "⚠️  If this returns (0,0,0), the AMM pool is empty"
    echo ""
    
    echo "4.2 Add liquidity to the pool:"
    echo "Command:"
    echo "cast send $ROUTER_ADDRESS 'addLiquidity(address,uint256,uint256)(uint256)' $TOKEN_ADDRESS 100000000000000000000 0 --rpc-url $RPC --private-key $PRIVATE_KEY --chain $CHAIN_ID"
    echo ""
    echo "⚠️  Requires 100 tokens + enough ETH for the swap"
    echo ""
    
    echo "4.3 Perform a token-to-ETH swap:"
    TOKEN_AMOUNT="50000000000000000000"  # 50 tokens in Wei
    echo "Command:"
    echo "cast send $ROUTER_ADDRESS 'swapExactTokensForETH(uint256,uint256,address[],address,uint256)(uint256[])' $TOKEN_AMOUNT 0 '[$TOKEN_ADDRESS]' $DEPLOYER $(date +%s)000 --rpc-url $RPC --private-key $PRIVATE_KEY --chain $CHAIN_ID"
    echo ""
    echo "⚠️  This will swap 50 tokens for ETH"
    echo ""
}

# ================================================================
# SECTION 5: TEST EPOCH UNLOCKING
# ================================================================
section_epoch_unlock() {
    echo ""
    echo "[ SECTION 5: TEST EPOCH UNLOCKING ]"
    echo ""
    
    echo "5.1 Check current epoch:"
    echo "Command:"
    echo "cast call $CONTROLLER_ADDRESS 'currentEpoch()(uint256)' --rpc-url $RPC"
    echo ""
    
    echo "5.2 Check total locked tokens:"
    echo "Command:"
    echo "cast call $CONTROLLER_ADDRESS 'totalLocked()(uint256)' --rpc-url $RPC"
    echo ""
    
    echo "5.3 Unlock one epoch:"
    echo "Command:"
    echo "cast send $CONTROLLER_ADDRESS 'unlockEpoch()(bool)' --rpc-url $RPC --private-key $PRIVATE_KEY --chain $CHAIN_ID"
    echo ""
    echo "⚠️  Can only unlock if 1 day has passed since last unlock"
    echo ""
    
    echo "5.4 Check released tokens after unlock:"
    echo "Command:"
    echo "cast call $TOKEN_ADDRESS 'balanceOf(address)(uint256)' $DEPLOYER --rpc-url $RPC"
    echo ""
    echo "Note: Balance should increase by ~3.33% per epoch (100/30 epochs)"
    echo ""
}

# ================================================================
# SECTION 6: TEST ANTI-WHALE PROTECTION
# ================================================================
section_anti_whale() {
    echo ""
    echo "[ SECTION 6: TEST ANTI-WHALE PROTECTION ]"
    echo ""
    
    echo "6.1 Check if anti-whale is enabled:"
    echo "Command:"
    echo "cast call $TOKEN_ADDRESS 'whaleProtectionEnabled()(bool)' --rpc-url $RPC"
    echo ""
    
    echo "6.2 Check whale fee percentage:"
    echo "Command:"
    echo "cast call $TOKEN_ADDRESS 'whaleFeeBPS()(uint256)' --rpc-url $RPC"
    echo ""
    echo "Note: This is in basis points (bps). 500 bps = 5%"
    echo ""
    
    echo "6.3 Try a large transfer (to test whale detection):"
    LARGE_AMOUNT="500000000000000000000"  # 500 tokens
    TEST_ADDR="0x..."  # Replace with test address
    echo "Command:"
    echo "cast send $TOKEN_ADDRESS 'transfer(address,uint256)(bool)' $TEST_ADDR $LARGE_AMOUNT --rpc-url $RPC --private-key $PRIVATE_KEY --chain $CHAIN_ID"
    echo ""
    echo "⚠️  If whale protection is active, a fee will be deducted"
    echo ""
}

# ================================================================
# DISPLAY MENU
# ================================================================
echo ""
echo "Available test sections:"
echo "  1) Check token balances"
echo "  2) Test token transfers"
echo "  3) Test approvals"
echo "  4) Test AMM swaps"
echo "  5) Test epoch unlocking"
echo "  6) Test anti-whale protection"
echo "  7) Run all tests (display only - no execution)"
echo ""

# Run sections based on user input or run all if no argument
if [ "$1" == "all" ]; then
    section_check_balances
    section_token_transfer
    section_approvals
    section_amm_swaps
    section_epoch_unlock
    section_anti_whale
elif [ "$1" == "1" ]; then
    section_check_balances
elif [ "$1" == "2" ]; then
    section_token_transfer
elif [ "$1" == "3" ]; then
    section_approvals
elif [ "$1" == "4" ]; then
    section_amm_swaps
elif [ "$1" == "5" ]; then
    section_epoch_unlock
elif [ "$1" == "6" ]; then
    section_anti_whale
else
    section_check_balances
fi

echo ""
echo "=========================================="
echo "  ✓ Test commands displayed above"
echo "  ✓ Copy-paste commands into your terminal"
echo "  ✓ Each command shows expected output"
echo "=========================================="
echo ""
echo "Need help? Review the comments in this script"
echo ""
