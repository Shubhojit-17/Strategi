'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { logger, LogCategory } from '@/lib/logger';
import FloatingNode from '@/components/wallet/FloatingNode';
import { motion } from 'framer-motion';

// Extend window type for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const SOMNIA_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_SOMNIA_CHAIN_ID || '50312');

// Bioluminescent color palette
const colors = {
  coreGlow: '#3CF2FF',
  plasmaAccent: '#82FFD2',
  deepOcean: '#0F1423',
  biolightPurple: '#A37CFF',
};

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
      <div className="relative w-full h-full flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.deepOcean }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lg font-semibold"
          style={{ color: colors.coreGlow, textShadow: `0 0 10px ${colors.coreGlow}` }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  // Show connection options when not connected - BIOLUMINESCENT BLOOM INTERFACE
  if (!connectionMethod) {
    return (
      <div
        className="relative w-full min-h-screen flex flex-col items-center justify-center gap-12 p-8"
        style={{ backgroundColor: colors.deepOcean }}
      >
        {/* Background gradient effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.biolightPurple}10 0%, ${colors.deepOcean} 70%)`,
          }}
        />

        {/* Title Section */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{
              color: colors.coreGlow,
              textShadow: `0 0 20px ${colors.coreGlow}, 0 0 40px ${colors.plasmaAccent}`,
            }}
          >
            Strategi
          </h1>
          <p
            className="text-lg"
            style={{
              color: colors.plasmaAccent,
              textShadow: `0 0 10px ${colors.plasmaAccent}`,
            }}
          >
            Connect Your Wallet
          </p>
          <div
            className="w-24 h-1 mx-auto mt-4 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.coreGlow}, ${colors.plasmaAccent}, ${colors.biolightPurple})`,
              boxShadow: `0 0 20px ${colors.coreGlow}`,
            }}
          />
        </motion.div>

        {/* Floating Node Selection */}
        <div
          className="relative z-10 flex flex-col md:flex-row gap-20 md:gap-32 items-center justify-center"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(60, 242, 255, 0.2))',
          }}
        >
          {/* MetaMask Node */}
          <FloatingNode
            icon="🦊"
            label="MetaMask"
            onClick={handleMetaMaskConnect}
            isLoading={isConnectingMetaMask || isConnecting}
            isDisabled={crossmintWallet || isConnected}
          />

          {/* Crossmint Node */}
          <FloatingNode
            icon="📧"
            label="Crossmint"
            onClick={() => {
              // For now, show an email input modal or simple email prompt
              const email = prompt('Enter your email for Crossmint wallet:');
              if (email) {
                setCrossmintEmail(email);
                handleCrossmintLogin();
              }
            }}
            isLoading={crossmintLoading}
            isDisabled={isConnected || crossmintWallet}
          />
        </div>

        {/* Connection Status Messages */}
        {(isConnectingMetaMask || isConnecting) && (
          <motion.div
            className="relative z-10 p-4 rounded-lg text-center max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: `rgba(60, 242, 255, 0.1)`,
              border: `2px solid ${colors.coreGlow}`,
              boxShadow: `0 0 20px ${colors.coreGlow}40`,
            }}
          >
            <p style={{ color: colors.coreGlow }} className="font-semibold">
              ⏳ Waiting for MetaMask...
            </p>
            <p style={{ color: colors.plasmaAccent }} className="text-sm mt-2">
              Click the MetaMask fox icon 🦊 in your browser toolbar
            </p>
          </motion.div>
        )}

        {connectError && (
          <motion.div
            className="relative z-10 p-4 rounded-lg text-center max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255, 59, 48, 0.1)',
              border: '2px solid #FF3B30',
              boxShadow: '0 0 20px rgba(255, 59, 48, 0.4)',
            }}
          >
            <p style={{ color: '#FF6B6B' }} className="font-semibold">
              ❌ Connection Error
            </p>
            <p style={{ color: '#FFB3B3' }} className="text-sm mt-2">
              {connectError.message || 'Failed to connect'}
            </p>
          </motion.div>
        )}

        {/* Info Footer */}
        <motion.div
          className="relative z-10 text-center text-sm max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ color: colors.plasmaAccent }}
        >
          <p className="mb-2">
            💡 <strong>Choose ONE wallet connection method</strong>
          </p>
          <p className="text-xs" style={{ color: colors.coreGlow }}>
            MetaMask provides the most security. Crossmint offers email-based access.
          </p>
        </motion.div>
      </div>
    );
  }

  // Show connected wallet info - MetaMask
  if (connectionMethod === 'metamask' && isConnected && address) {
    return (
      <div
        className="relative w-full min-h-screen flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: colors.deepOcean }}
      >
        {/* Background gradient effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.biolightPurple}10 0%, ${colors.deepOcean} 70%)`,
          }}
        />

        <motion.div
          className="relative z-10 max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: 1 }}
              className="text-6xl mb-3"
            >
              ✅
            </motion.div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{
                color: colors.coreGlow,
                textShadow: `0 0 20px ${colors.coreGlow}`,
              }}
            >
              Connected
            </h2>
            <p style={{ color: colors.plasmaAccent }}>MetaMask Wallet</p>
          </div>

          {/* Network Warning */}
          {networkWarning && (
            <motion.div
              className="mb-6 p-4 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 107, 107, 0.1)',
                border: `2px solid #FF6B6B`,
                boxShadow: `0 0 20px rgba(255, 107, 107, 0.3)`,
              }}
            >
              <p style={{ color: '#FFB3B3' }} className="font-semibold mb-2">
                ⚠️ Wrong Network!
              </p>
              <p style={{ color: '#FFCCCC' }} className="text-sm mb-3">
                Please switch to <strong>Somnia L1</strong>
              </p>
              <p style={{ color: '#FFB3B3' }} className="text-xs mb-4">
                Current: {chain?.name || 'Unknown'} (ID: {chain?.id || 'N/A'})
                <br />
                Expected: Somnia L1 (ID: {SOMNIA_CHAIN_ID})
              </p>
              <button
                onClick={handleSwitchToSomnia}
                className="w-full px-4 py-2 rounded-lg font-medium transition"
                style={{
                  background: colors.plasmaAccent,
                  color: colors.deepOcean,
                  boxShadow: `0 0 15px ${colors.plasmaAccent}`,
                }}
              >
                Switch Network
              </button>
            </motion.div>
          )}

          {/* Wallet Info Cards */}
          <div className="space-y-4 mb-6">
            {/* Address Card */}
            <motion.div
              className="p-4 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: `rgba(60, 242, 255, 0.08)`,
                border: `1px solid ${colors.coreGlow}`,
                boxShadow: `0 0 15px ${colors.coreGlow}20`,
              }}
            >
              <p style={{ color: colors.plasmaAccent }} className="text-xs font-semibold mb-1">
                WALLET ADDRESS
              </p>
              <p className="font-mono text-sm break-all" style={{ color: colors.coreGlow }}>
                {address}
              </p>
            </motion.div>

            {/* Network Card */}
            <motion.div
              className="p-4 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: `rgba(130, 255, 210, 0.08)`,
                border: `1px solid ${colors.plasmaAccent}`,
                boxShadow: `0 0 15px ${colors.plasmaAccent}20`,
              }}
            >
              <p style={{ color: colors.coreGlow }} className="text-xs font-semibold mb-1">
                NETWORK
              </p>
              <p style={{ color: colors.plasmaAccent }} className="font-mono text-sm mb-2">
                {chain?.name || 'Unknown'} (ID: {chain?.id || 'N/A'})
              </p>
              {chain?.id === SOMNIA_CHAIN_ID && (
                <p style={{ color: colors.plasmaAccent }} className="text-xs">
                  ✅ Correct network
                </p>
              )}
            </motion.div>
          </div>

          {/* Disconnect Button */}
          <motion.button
            onClick={handleMetaMaskDisconnect}
            className="w-full px-6 py-3 rounded-lg font-semibold transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: `linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 59, 48, 0.1))`,
              border: `2px solid #FF6B6B`,
              color: '#FFB3B3',
              boxShadow: `0 0 15px rgba(255, 107, 107, 0.3)`,
            }}
          >
            Disconnect Wallet
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Show connected wallet info - Crossmint
  if (connectionMethod === 'crossmint' && crossmintWallet) {
    return (
      <div
        className="relative w-full min-h-screen flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: colors.deepOcean }}
      >
        {/* Background gradient effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.biolightPurple}10 0%, ${colors.deepOcean} 70%)`,
          }}
        />

        <motion.div
          className="relative z-10 max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: 1 }}
              className="text-6xl mb-3"
            >
              ✅
            </motion.div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{
                color: colors.coreGlow,
                textShadow: `0 0 20px ${colors.coreGlow}`,
              }}
            >
              Connected
            </h2>
            <p style={{ color: colors.plasmaAccent }}>Crossmint Wallet</p>
          </div>

          {/* Wallet Info Cards */}
          <div className="space-y-4 mb-6">
            {/* Email Card */}
            <motion.div
              className="p-4 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: `rgba(163, 124, 255, 0.08)`,
                border: `1px solid ${colors.biolightPurple}`,
                boxShadow: `0 0 15px ${colors.biolightPurple}20`,
              }}
            >
              <p style={{ color: colors.plasmaAccent }} className="text-xs font-semibold mb-1">
                EMAIL
              </p>
              <p style={{ color: colors.biolightPurple }} className="text-sm">
                {crossmintWallet.email}
              </p>
            </motion.div>

            {/* Address Card */}
            <motion.div
              className="p-4 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: `rgba(60, 242, 255, 0.08)`,
                border: `1px solid ${colors.coreGlow}`,
                boxShadow: `0 0 15px ${colors.coreGlow}20`,
              }}
            >
              <p style={{ color: colors.plasmaAccent }} className="text-xs font-semibold mb-1">
                WALLET ADDRESS
              </p>
              <p className="font-mono text-sm break-all" style={{ color: colors.coreGlow }}>
                {crossmintWallet.walletAddress}
              </p>
            </motion.div>

            {crossmintWallet.demo_mode && (
              <motion.div
                className="p-4 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: `rgba(255, 193, 7, 0.08)`,
                  border: `1px solid #FFC107`,
                  boxShadow: `0 0 15px rgba(255, 193, 7, 0.2)`,
                }}
              >
                <p style={{ color: '#FFD54F' }} className="text-sm font-medium">
                  ⚠️ Demo Mode - Crossmint API Unavailable
                </p>
              </motion.div>
            )}
          </div>

          {/* Disconnect Button */}
          <motion.button
            onClick={handleCrossmintDisconnect}
            className="w-full px-6 py-3 rounded-lg font-semibold transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: `linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 59, 48, 0.1))`,
              border: `2px solid #FF6B6B`,
              color: '#FFB3B3',
              boxShadow: `0 0 15px rgba(255, 107, 107, 0.3)`,
            }}
          >
            Disconnect Wallet
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return null;
}
