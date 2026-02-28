import { http, createConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
})

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
export const PANCAKE_ROUTER = (process.env.NEXT_PUBLIC_PANCAKE_ROUTER || '0x10ED43C718714eb63d5aA57B78B54704E256024E') as `0x${string}`;
