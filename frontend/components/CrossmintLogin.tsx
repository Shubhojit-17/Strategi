"use client";

import { useState, useEffect } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function CrossmintLogin() {
  const [email, setEmail] = useState('');
  const [wallet, setWallet] = useState<{address: string; email: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/crossmint/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to create wallet');
      }

      const data = await response.json();
      setWallet({
        address: data.walletAddress,
        email: data.email
      });

      // Store in localStorage for session persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('crossmint_wallet', JSON.stringify({
          address: data.walletAddress,
          email: data.email
        }));
      }

    } catch (err: any) {
      console.error('Crossmint wallet creation error:', err);
      setError(err.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setWallet(null);
    setEmail('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crossmint_wallet');
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crossmint_wallet');
      if (stored) {
        try {
          setWallet(JSON.parse(stored));
        } catch {
          localStorage.removeItem('crossmint_wallet');
        }
      }
    }
  }, []);

  if (wallet) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="text-white font-mono text-sm break-all">{wallet.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
          <p className="text-white font-mono text-xs break-all">{wallet.address}</p>
        </div>
        <p className="text-xs text-gray-500 mt-3">✨ Custodial wallet via Crossmint</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-2">Login with Email</h3>
      <p className="text-sm text-gray-400 mb-4">
        No wallet needed! Sign in with email and get a custodial wallet via Crossmint.
      </p>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleLogin}
          disabled={loading || !email}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Wallet...' : 'Continue with Email'}
        </button>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Powered by <span className="text-purple-400">Crossmint</span> • Gasless transactions
      </p>
    </div>
  );
}
