'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { logger, LogCategory } from '@/lib/logger';

// Extend window type for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const SOMNIA_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_SOMNIA_CHAIN_ID || '50312');

export default function UnifiedWalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error: connectError, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const [mounted, setMounted] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<'metamask' | 'crossmint' | null>(null);
  const [crossmintWallet, setCrossmintWallet] = useState<any>(null);
  const [crossmintEmail, setCrossmintEmail] = useState('');
  const [crossmintLoading, setCrossmintLoading] = useState(false);
  const [crossmintError, setCrossmintError] = useState('');
  const [networkWarning, setNetworkWarning] = useState(false);
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState(0);

  useEffect(() => {
    setMounted(true);
    logger.info(LogCategory.SYSTEM, 'UnifiedWalletConnect mounted');
    logger.debug(LogCategory.SYSTEM, 'Available connectors', { 
      connectors: connectors.map(c => ({ id: c.id, name: c.name })) 
    });
    
    // Check for existing Crossmint wallet
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crossmint_wallet');
      if (stored) {
        try {
          const wallet = JSON.parse(stored);
          setCrossmintWallet(wallet);
          setConnectionMethod('crossmint');
          logger.info(LogCategory.WALLET, 'Restored Crossmint wallet from storage', { address: wallet.address });
        } catch {
          localStorage.removeItem('crossmint_wallet');
          logger.warn(LogCategory.WALLET, 'Failed to restore Crossmint wallet');
        }
      }
    }
  }, []);

  useEffect(() => {
    // If MetaMask connects, set method and check network
    if (isConnected && address) {
      if (!connectionMethod) {
        setConnectionMethod('metamask');
        logger.auditWalletConnect('metamask', address, chain?.id || 0);
      }
      
      // Reset connecting state when connected
      setIsConnectingMetaMask(false);

      // Check if on correct network
      if (chain && chain.id !== SOMNIA_CHAIN_ID) {
        setNetworkWarning(true);
        logger.warn(
          LogCategory.NETWORK,
          'Wrong network detected',
          { currentChain: chain.id, expectedChain: SOMNIA_CHAIN_ID, chainName: chain.name }
        );
      } else {
        setNetworkWarning(false);
      }
    }
  }, [isConnected, address, chain]);

  useEffect(() => {
    if (connectError) {
      // Reset connecting state on error
      setIsConnectingMetaMask(false);
      
      // Ignore "already pending" errors completely
      const errorMessage = connectError.message || (connectError as any).shortMessage || '';
      if (errorMessage.includes('already pending')) {
        // Don't log or show - just silently handle
        return;
      }
      
      // Only log other actual errors
      if (errorMessage) {
        logger.error(LogCategory.WALLET, 'Connection error', connectError);
      }
    }
  }, [connectError]);
  
  // Reset connecting state when successfully connected
  useEffect(() => {
    if (isConnected) {
      setIsConnectingMetaMask(false);
    }
  }, [isConnected]);

  const handleMetaMaskConnect = async () => {
    // Debounce - prevent rapid clicks (2 second cooldown)
    const now = Date.now();
    if (now - lastConnectionAttempt < 2000) {
      logger.warn(LogCategory.WALLET, 'Connection attempt too soon - debouncing');
      return;
    }
    setLastConnectionAttempt(now);
    
    // Prevent duplicate connection attempts
    if (isConnectingMetaMask || isConnecting) {
      logger.warn(LogCategory.WALLET, 'Connection already in progress - check MetaMask');
      alert('Connection request in progress. Please check MetaMask extension (click the fox icon in your browser toolbar).');
      return;
    }
    
    if (crossmintWallet) {
      alert('Please disconnect Crossmint wallet first');
      logger.warn(LogCategory.WALLET, 'Attempted MetaMask connect while Crossmint active');
      return;
    }
    
    if (isConnected) {
      logger.warn(LogCategory.WALLET, 'Already connected to wallet');
      return;
    }

    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install MetaMask extension from https://metamask.io');
      logger.error(LogCategory.WALLET, 'MetaMask not installed', new Error('window.ethereum undefined'));
      return;
    }

    setIsConnectingMetaMask(true);
    logger.info(LogCategory.WALLET, 'Initiating MetaMask connection');
    
    const metamaskConnector = connectors.find(c => c.id === 'injected' || c.id === 'io.metamask');
    
    if (!metamaskConnector) {
      const error = 'MetaMask connector not found. Please install MetaMask.';
      alert(error);
      logger.error(LogCategory.WALLET, 'MetaMask connector not available', new Error(error));
      setIsConnectingMetaMask(false);
      return;
    }

    try {
      logger.debug(LogCategory.WALLET, 'Connecting with connector', { id: metamaskConnector.id });
      
      // Try direct MetaMask connection first
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        logger.info(LogCategory.WALLET, 'MetaMask accounts received', { accountCount: accounts?.length });
      } catch (ethError: any) {
        // Handle specific MetaMask errors
        if (ethError.code === 4001) {
          logger.info(LogCategory.WALLET, 'User rejected MetaMask connection');
          setIsConnectingMetaMask(false);
          return;
        }
        if (ethError.code === -32002 || ethError.message?.includes('already pending')) {
          logger.warn(LogCategory.WALLET, 'Request already pending in MetaMask');
          alert('You already have a pending connection request in MetaMask.\n\nPlease:\n1. Click the MetaMask fox icon 🦊\n2. Approve or reject the pending request\n3. Refresh the page\n4. Try again');
          setIsConnectingMetaMask(false);
          return;
        }
        logger.warn(LogCategory.WALLET, 'eth_requestAccounts failed, trying wagmi', { error: ethError.message });
      }
      
      // Use wagmi to complete the connection
      await connect({ 
        connector: metamaskConnector, 
        chainId: SOMNIA_CHAIN_ID 
      });
      
      logger.info(LogCategory.WALLET, 'MetaMask connection request sent');
    } catch (err: any) {
      setIsConnectingMetaMask(false);
      
      // Don't show error for "already pending" - user just needs to check MetaMask
      if (err.message?.includes('already pending') || err.code === -32002) {
        logger.warn(LogCategory.WALLET, 'Connection request pending');
        alert('A connection request is already pending.\n\nPlease:\n1. Click the MetaMask fox icon 🦊 in your browser\n2. Check for any pending requests\n3. Approve or reject the request\n4. Refresh the page (F5)\n5. Try again');
        return;
      }
      
      logger.error(LogCategory.WALLET, 'Failed to connect MetaMask', err);
      
      // Check if error is about unsupported chain
      if (err.message?.includes('chain') || err.message?.includes('network')) {
        alert('Please add Somnia Shannon Testnet to MetaMask first.\n\nNetwork Details:\nName: Somnia L1\nChain ID: 50312\nRPC: https://dream-rpc.somnia.network\nSymbol: STM');
      } else if (err.message?.includes('rejected') || err.message?.includes('denied') || err.code === 4001) {
        logger.info(LogCategory.WALLET, 'User rejected connection request');
      } else {
        alert(`Failed to connect: ${err.message}`);
      }
    }
  };

  const handleSwitchToSomnia = async () => {
    if (!switchChain) {
      logger.error(LogCategory.NETWORK, 'Switch chain not available', new Error('switchChain undefined'));
      alert('Network switching not supported');
      return;
    }

    logger.info(LogCategory.NETWORK, 'Attempting to switch to Somnia', { chainId: SOMNIA_CHAIN_ID });

    try {
      await switchChain({ chainId: SOMNIA_CHAIN_ID });
      logger.audit(LogCategory.NETWORK, 'Switched to Somnia network', address || '', { chainId: SOMNIA_CHAIN_ID });
      setNetworkWarning(false);
    } catch (err: any) {
      logger.error(LogCategory.NETWORK, 'Failed to switch network', err);
      alert(`Failed to switch network: ${err.message}`);
    }
  };

  const handleMetaMaskDisconnect = () => {
    logger.audit(LogCategory.WALLET, 'Wallet disconnected', address || '');
    disconnect();
    setConnectionMethod(null);
    setNetworkWarning(false);
  };

  const handleCrossmintLogin = async () => {
    if (isConnected) {
      alert('Please disconnect MetaMask wallet first');
      logger.warn(LogCategory.WALLET, 'Attempted Crossmint login while MetaMask active');
      return;
    }

    if (!crossmintEmail) {
      alert('Please enter your email');
      return;
    }

    logger.info(LogCategory.WALLET, 'Initiating Crossmint login', { email: crossmintEmail });
    setCrossmintLoading(true);
    setCrossmintError('');

    try {
      const response = await fetch(`${BACKEND_URL}/crossmint/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: crossmintEmail }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`);
      }

      const data = await response.json();
      setCrossmintWallet(data);
      setConnectionMethod('crossmint');
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('crossmint_wallet', JSON.stringify(data));
      }

      logger.auditWalletConnect('crossmint', data.address, SOMNIA_CHAIN_ID);
      setCrossmintEmail('');
    } catch (err: any) {
      setCrossmintError(err.message);
      logger.error(LogCategory.WALLET, 'Crossmint login failed', err);
    } finally {
      setCrossmintLoading(false);
    }
  };

  const handleCrossmintDisconnect = () => {
    logger.audit(LogCategory.WALLET, 'Crossmint wallet disconnected', crossmintWallet?.address || '');
    setCrossmintWallet(null);
    setConnectionMethod(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crossmint_wallet');
    }
  };

  if (!mounted) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  // Show connection options when not connected
  if (!connectionMethod) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">Connect Wallet</h2>
        <p className="text-gray-300 mb-6">Choose ONE method to connect:</p>
        
        <div className="space-y-4">
          {/* MetaMask Option */}
          <div className="border border-blue-500/50 rounded-lg p-4 bg-blue-500/10">
            <h3 className="text-lg font-semibold text-white mb-2">🦊 Option 1: MetaMask</h3>
            <p className="text-gray-300 text-sm mb-3">Connect using your MetaMask browser extension</p>
            
            {(isConnectingMetaMask || isConnecting) && (
              <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded">
                <p className="text-yellow-200 text-sm font-medium">
                  ⏳ Waiting for MetaMask...
                </p>
                <p className="text-yellow-100 text-xs mt-1">
                  Click the MetaMask fox icon 🦊 in your browser toolbar to approve the connection
                </p>
              </div>
            )}
            
            <button
              onClick={handleMetaMaskConnect}
              disabled={isConnectingMetaMask || isConnecting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isConnectingMetaMask || isConnecting ? '⏳ Connecting...' : 'Connect MetaMask'}
            </button>
          </div>

          {/* Crossmint Option */}
          <div className="border border-purple-500/50 rounded-lg p-4 bg-purple-500/10">
            <h3 className="text-lg font-semibold text-white mb-2">📧 Option 2: Email (Crossmint)</h3>
            <p className="text-gray-300 text-sm mb-3">Create a wallet using just your email</p>
            <input
              type="email"
              value={crossmintEmail}
              onChange={(e) => setCrossmintEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 mb-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button
              onClick={handleCrossmintLogin}
              disabled={crossmintLoading || !crossmintEmail}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-gray-600 disabled:text-gray-400"
            >
              {crossmintLoading ? 'Creating Wallet...' : 'Create/Login with Email'}
            </button>
            {crossmintError && (
              <p className="mt-2 text-red-300 text-sm">{crossmintError}</p>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-200 text-sm">
            ⚠️ <strong>Note:</strong> You can only use ONE wallet connection method at a time.
          </p>
        </div>
      </div>
    );
  }

  // Show connected wallet info
  if (connectionMethod === 'metamask' && isConnected && address) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-3 text-white">✅ Connected (MetaMask)</h2>
        
        {/* Network Warning */}
        {networkWarning && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 font-medium mb-2">⚠️ Wrong Network!</p>
            <p className="text-sm text-gray-300 mb-3">
              Please switch to <strong>Somnia Shannon Testnet</strong>
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Current: {chain?.name || 'Unknown'} (ID: {chain?.id || 'N/A'})
              <br />
              Expected: Somnia L1 (ID: {SOMNIA_CHAIN_ID})
            </p>
            <button
              onClick={handleSwitchToSomnia}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
            >
              Switch to Somnia Network
            </button>
          </div>
        )}

        {/* Wallet Info */}
        <div className="space-y-3">
          <div className="bg-blue-500/20 p-3 rounded border border-blue-500/50">
            <p className="text-sm text-gray-300">Wallet Address:</p>
            <p className="text-white font-mono text-sm break-all">{address}</p>
          </div>
          <div className="bg-green-500/20 p-3 rounded border border-green-500/50">
            <p className="text-sm text-gray-300">Network:</p>
            <p className="text-white font-mono text-sm">
              {chain?.name || 'Unknown'} (Chain ID: {chain?.id || 'N/A'})
            </p>
            {chain?.id === SOMNIA_CHAIN_ID && (
              <p className="text-xs text-green-300 mt-1">✅ Correct network</p>
            )}
          </div>
          <button
            onClick={handleMetaMaskDisconnect}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Disconnect MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (connectionMethod === 'crossmint' && crossmintWallet) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-3 text-white">✅ Connected (Crossmint)</h2>
        <div className="space-y-3">
          <div className="bg-purple-500/20 p-3 rounded border border-purple-500/50">
            <p className="text-sm text-gray-300">Email:</p>
            <p className="text-white text-sm">{crossmintWallet.email}</p>
          </div>
          <div className="bg-purple-500/20 p-3 rounded border border-purple-500/50">
            <p className="text-sm text-gray-300">Wallet Address:</p>
            <p className="text-white font-mono text-sm break-all">{crossmintWallet.walletAddress}</p>
          </div>
          {crossmintWallet.demo_mode && (
            <div className="bg-yellow-500/20 p-3 rounded border border-yellow-500/50">
              <p className="text-yellow-200 text-sm">
                ⚠️ Demo mode - Crossmint API unavailable
              </p>
            </div>
          )}
          <button
            onClick={handleCrossmintDisconnect}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Disconnect Email Wallet
          </button>
        </div>
      </div>
    );
  }

  return null;
}
