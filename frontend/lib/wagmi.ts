'use client';

import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Somnia L1 network configuration
export const somniaChain = {
  id: parseInt(process.env.NEXT_PUBLIC_SOMNIA_CHAIN_ID || '1234'),
  name: 'Somnia L1',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network'] },
    public: { http: [process.env.NEXT_PUBLIC_SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.somnia.network' },
  },
} as const;

export const config = createConfig({
  chains: [somniaChain],
  connectors: [injected()],
  transports: {
    [somniaChain.id]: http(),
  },
});
