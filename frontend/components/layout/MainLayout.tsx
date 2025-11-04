'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import EntryAnimation from '@/components/entry/EntryAnimation';
import EntryTransition from '@/components/entry/EntryTransition';
import NeonText from '@/components/ui/NeonText';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useAppStore } from '@/lib/store/appStore';

// Status Badge Component
const StatusBadge = ({ status }: { status: 'completed' | 'active' | 'locked' }) => {
  const styles = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/50',
    active: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    locked: 'bg-gray-500/20 text-gray-500 border-gray-500/50'
  };

  const icons = {
    completed: '✓',
    active: '○',
    locked: '🔒'
  };

  const labels = {
    completed: 'Completed',
    active: 'Available',
    locked: 'Locked'
  };

  return (
    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]} backdrop-blur-sm`}>
      <span className="mr-1">{icons[status]}</span>
      {labels[status]}
    </div>
  );
};

export default function MainLayout() {
  const router = useRouter();
  const [showEntry, setShowEntry] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const wallet = useAppStore((state) => state.wallet);
  const documents = useAppStore((state) => state.documents);

  // Check if user has seen the entry animation before
  useEffect(() => {
    const hasSeenEntry = sessionStorage.getItem('hasSeenEntryAnimation');
    if (hasSeenEntry) {
      // Skip animations and go straight to dashboard
      setShowDashboard(true);
    } else {
      // Show entry animation for first-time visit
      setShowEntry(true);
    }
  }, []);

  const handleEntryComplete = () => {
    setShowEntry(false);
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    setShowDashboard(true);
    // Mark that user has seen the entry animation
    sessionStorage.setItem('hasSeenEntryAnimation', 'true');
  };

  // Determine card statuses
  const isWalletConnected = !!wallet.address;
  const hasNFT = wallet.hasNFT;
  const hasDocuments = documents.length > 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-deep-space-blue">
      <AnimatePresence mode="wait">
        {/* Entry Animation - Circle tracing */}
        {showEntry && (
          <EntryAnimation key="entry" onComplete={handleEntryComplete} />
        )}

        {/* Bubble Expansion Transition */}
        {showTransition && (
          <EntryTransition key="transition" onComplete={handleTransitionComplete} />
        )}

        {/* Main Dashboard - Navigation Hub */}
        {showDashboard && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center"
          >
            {/* Back Button */}
            <motion.button
              onClick={() => {
                sessionStorage.removeItem('hasSeenEntryAnimation');
                window.location.reload();
              }}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 glass-panel text-white hover:text-cyan-400 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-semibold">Back</span>
            </motion.button>

            {/* Header */}
            <div className="text-center mb-16">
              <NeonText className="text-6xl font-bold mb-4">Strategi</NeonText>
              <p className="text-xl text-gray-400">
                NFT-Gated AI Agents on Somnia L1
              </p>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl px-8">
              {/* Wallet Connection */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-panel p-8 text-center cursor-pointer relative"
                onClick={() => router.push('/wallet')}
              >
                <StatusBadge status={isWalletConnected ? 'completed' : 'active'} />
                <div className="text-5xl mb-4">👛</div>
                <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
                <p className="text-gray-400">
                  {isWalletConnected 
                    ? `${wallet.address?.substring(0, 6)}...${wallet.address?.substring(38)}`
                    : 'MetaMask or Crossmint'
                  }
                </p>
              </motion.div>

              {/* NFT Minting */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className={`glass-panel p-8 text-center cursor-pointer relative ${!isWalletConnected ? 'opacity-60' : ''}`}
                onClick={() => isWalletConnected && router.push('/mint')}
              >
                <StatusBadge status={hasNFT ? 'completed' : isWalletConnected ? 'active' : 'locked'} />
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold text-white mb-2">Mint NFT</h3>
                <p className="text-gray-400">
                  {hasNFT 
                    ? `NFT #${wallet.tokenId || 'minted'}`
                    : isWalletConnected 
                      ? 'Get access to AI agents'
                      : 'Connect wallet first'
                  }
                </p>
              </motion.div>

              {/* Document Upload */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className={`glass-panel p-8 text-center cursor-pointer relative ${!hasNFT ? 'opacity-60' : ''}`}
                onClick={() => hasNFT && router.push('/upload')}
              >
                <StatusBadge status={hasDocuments ? 'completed' : hasNFT ? 'active' : 'locked'} />
                <div className="text-5xl mb-4">📤</div>
                <h3 className="text-2xl font-bold text-white mb-2">Upload Document</h3>
                <p className="text-gray-400">
                  {hasDocuments 
                    ? `${documents.length} file${documents.length > 1 ? 's' : ''} uploaded`
                    : hasNFT 
                      ? 'Store on IPFS'
                      : 'Mint NFT first'
                  }
                </p>
              </motion.div>

              {/* Document List */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className={`glass-panel p-8 text-center cursor-pointer relative ${!hasNFT ? 'opacity-60' : ''}`}
                onClick={() => hasNFT && router.push('/documents')}
              >
                <StatusBadge status={hasDocuments ? 'active' : hasNFT ? 'active' : 'locked'} />
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-2xl font-bold text-white mb-2">My Documents</h3>
                <p className="text-gray-400">
                  {hasDocuments 
                    ? `${documents.length} document${documents.length > 1 ? 's' : ''}`
                    : hasNFT
                      ? 'View and manage files'
                      : 'Mint NFT first'
                  }
                </p>
              </motion.div>

              {/* AI Execution */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className={`glass-panel p-8 text-center cursor-pointer relative ${!hasNFT ? 'opacity-60' : ''}`}
                onClick={() => hasNFT && router.push('/execute')}
              >
                <StatusBadge status={hasNFT ? 'active' : 'locked'} />
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Execution</h3>
                <p className="text-gray-400">
                  {hasNFT
                    ? 'Chat with AI agents'
                    : 'Mint NFT first'
                  }
                </p>
              </motion.div>

              {/* Test AI Bubble */}
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-panel p-8 text-center cursor-pointer bg-purple-900/20 relative"
                onClick={() => window.open('/demo', '_blank')}
              >
                <StatusBadge status="active" />
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Bubble Demo</h3>
                <p className="text-gray-400">
                  Phase 2 showcase
                </p>
              </motion.div>
            </div>

            {/* Status Info */}
            <div className="absolute bottom-8 text-center">
              <p className="text-sm text-gray-500">
                {wallet.address ? (
                  <>
                    Connected: {wallet.address.substring(0, 6)}...{wallet.address.substring(38)}
                    {wallet.hasNFT && ` | NFT #${wallet.tokenId}`}
                  </>
                ) : (
                  'Not connected - Click "Connect Wallet" to begin'
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-deep-space-blue via-[#1B2138] to-deep-space-blue" />
    </div>
  );
}
