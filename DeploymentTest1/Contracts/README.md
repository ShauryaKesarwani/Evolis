# Token Factory - Progressive Liquidity Unlock

Smart contracts for deploying tokens with automatic progressive liquidity unlock on BSC.

## Features

- **One-click deployment**: Deploy token + liquidity controller in single transaction
- **Progressive Liquidity Unlock (PLU)**: Gradual liquidity addition over time
- **Deterministic unlocks**: Time-based, predictable liquidity schedule
- **AMM integrated**: Direct PancakeSwap integration

## Architecture

### Contracts

1. **Token.sol**: Simple ERC20 template
2. **LiquidityController.sol**: Manages PLU mechanism
3. **TokenFactory.sol**: Orchestrates atomic deployment

### Deployment Flow

1. User submits configuration (name, symbol, supply, etc.)
2. Factory atomically:
   - Deploys token contract
   - Deploys liquidity controller
   - Mints tokens to controller
   - Adds initial liquidity to PancakeSwap
   - Configures unlock schedule

## Installation

```bash
# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts

# Build
forge build

# Test
forge test
```

## Deployment

### 1. Deploy Factory

```bash
# Setup environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# Deploy to BSC Testnet
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_TESTNET_RPC \
  --broadcast \
  --verify

# Deploy to BSC Mainnet
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BSC_MAINNET_RPC \
  --broadcast \
  --verify
```

### 2. Deploy Token via Factory

```bash
# Set FACTORY_ADDRESS in .env

# Deploy token
forge script script/DeployToken.s.sol:DeployToken \
  --rpc-url $BSC_TESTNET_RPC \
  --broadcast
```

## Usage

### Deploy Token with PLU

```solidity
TokenFactory.DeploymentConfig memory config = TokenFactory.DeploymentConfig({
    name: "My Token",
    symbol: "MTK",
    totalSupply: 1_000_000 * 10**18,    // 1M tokens
    initialLiquidityPercent: 2000,       // 20%
    unlockDuration: 30 days,             // 30 day unlock period
    epochDuration: 1 days                // Unlock every day
});

(address token, address controller) = factory.deployTokenV2{value: 0.1 ether}(config);
```

### Unlock Epochs

Anyone can trigger unlocks when epochs pass:

```solidity
LiquidityController(controller).unlockEpoch{value: 0.01 ether}();
```

### Query Status

```solidity
// Get unlockable epochs
uint256 unlockable = controller.getUnlockableEpochs();

// Get time until next unlock
uint256 timeLeft = controller.getTimeUntilNextEpoch();

// Get progress
(uint256 epochsUnlocked, uint256 total, uint256 tokensUnlocked, uint256 remaining) 
    = controller.getUnlockProgress();
```

## Parameters

- **totalSupply**: Total token supply
- **initialLiquidityPercent**: % of tokens for initial liquidity (basis points, e.g. 2000 = 20%)
- **unlockDuration**: Total time for all unlocks (seconds)
- **epochDuration**: Time between unlocks (seconds)

## Calculations

```
initialTokens = (totalSupply * initialLiquidityPercent) / 10000
lockedTokens = totalSupply - initialTokens
totalEpochs = unlockDuration / epochDuration
unlockPerEpoch = lockedTokens / totalEpochs
```

## Security

- All calculations validated on-chain
- Atomic deployment prevents front-running
- Time-based deterministic releases
- No admin controls after deployment

## License

MIT
