'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmi';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const queryClient = new QueryClient();

export function ProvidersClient({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}
