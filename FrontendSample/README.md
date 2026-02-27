# Token Factory Frontend

Next.js frontend for deploying tokens with Progressive Liquidity Unlock (PLU) on BSC.

## Features

- **Connect Wallet**: Support for MetaMask, WalletConnect, Coinbase Wallet
- **Deploy Tokens**: One-click deployment with PLU configuration
- **Real-time Calculations**: Live preview of liquidity distribution
- **Transaction Tracking**: Monitor deployment status
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Next.js 14**: App Router with React Server Components
- **Wagmi v2**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library
- **TailwindCSS**: Utility-first CSS
- **TypeScript**: Type-safe development

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
- Get `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` from [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Set `NEXT_PUBLIC_FACTORY_ADDRESS` to your deployed factory address

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

```bash
# Build
npm run build

# Start production server
npm run start
```

## Usage

### Deploy a Token

1. **Connect Wallet**: Click "Connect" and choose your wallet
2. **Fill Form**:
   - Token name and symbol
   - Total supply
   - Initial liquidity percentage (1-99%)
   - BNB amount for initial liquidity
   - Unlock schedule (duration and epoch)
3. **Review Calculations**: Check derived values
4. **Sign Transaction**: Confirm in wallet
5. **Wait for Confirmation**: Token deploys atomically

### Configuration Examples

**Conservative Release (Long-term)**
- Total Supply: 1,000,000
- Initial Liquidity: 10%
- Unlock Duration: 180 days
- Epoch Duration: 7 days
- Result: 10% initial, 90% over 6 months (weekly unlocks)

**Moderate Release**
- Total Supply: 1,000,000
- Initial Liquidity: 20%
- Unlock Duration: 30 days
- Epoch Duration: 1 day
- Result: 20% initial, 80% over 1 month (daily unlocks)

**Aggressive Release**
- Total Supply: 1,000,000
- Initial Liquidity: 40%
- Unlock Duration: 7 days
- Epoch Duration: 1 day
- Result: 40% initial, 60% over 1 week (daily unlocks)

## Project Structure

```
Frontend/
├── app/
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Wagmi & React Query setup
│   └── globals.css        # Global styles
├── components/
│   ├── DeploymentForm.tsx # Main deployment form
│   └── ConnectWallet.tsx  # Wallet connection
├── lib/
│   ├── abi.ts            # Contract ABIs
│   └── config.ts         # Wagmi & chain config
├── public/               # Static assets
└── package.json
```

## Smart Contracts

This frontend interfaces with three contracts:

1. **TokenFactory**: Deploys tokens with PLU
   - `deployTokenV2()`: Main deployment function
   - `getUserDeployments()`: Get user's tokens
   - `deploymentInfo()`: Get token details

2. **LiquidityController**: Manages PLU
   - `unlockEpoch()`: Trigger epoch unlock
   - `getUnlockProgress()`: Check status

3. **Token**: ERC20 implementation
   - Standard ERC20 functions

## Customization

### Styling

Edit `tailwind.config.js` to customize colors:

```js
theme: {
  extend: {
    colors: {
      primary: '#F3BA2F',  // BNB yellow
      secondary: '#1E1E1E',
    },
  },
}
```

### Networks

Edit `lib/config.ts` to add networks:

```ts
chains: [bsc, bscTestnet, polygon],
transports: {
  [bsc.id]: http(),
  [bscTestnet.id]: http(),
  [polygon.id]: http(),
},
```

## Troubleshooting

### Wallet Not Connecting

- Check if wallet extension is installed
- Ensure you're on correct network (BSC/BSC Testnet)
- Try refreshing the page

### Transaction Failing

- Verify FACTORY_ADDRESS is correct
- Ensure sufficient BNB for gas + liquidity
- Check all input values are valid
- Make sure total supply > 0 and initial % < 100%

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

## Contributing

Contributions welcome! Please open an issue or submit a PR.

## License

MIT
