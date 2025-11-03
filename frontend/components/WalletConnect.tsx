'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <button
          disabled
          className="px-6 py-2 bg-gray-600 text-gray-400 rounded-lg font-medium cursor-not-allowed"
        >
          Loading...
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-200">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Connect Wallet
        </button>
      ))}
    </div>
  );
}
