import { ProvidersClient } from '@/components/ProvidersClient';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ProvidersClient>{children}</ProvidersClient>;
}
