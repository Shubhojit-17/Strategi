'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/appStore';
import { StrategiLogoAnimated } from '@/components/branding/StrategiLogoAnimated';
import { RadialMenuItem } from './RadialMenuItem';
import { ParticleNeurons } from './ParticleNeurons';
import { EnergyRings } from './EnergyRings';
import EntryAnimation from '@/components/entry/EntryAnimation';
import EntryTransition from '@/components/entry/EntryTransition';
import { 
  Wallet, 
  BrainElectricity, 
  ColorPicker, 
  Folder, 
  UploadSquare 
} from 'iconoir-react';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  route: string;
  status: 'completed' | 'active' | 'locked';
  angle: number;
  distance: number;
}

export const RadialDashboard: React.FC = () => {
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
      setShowDashboard(true);
    } else {
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
    sessionStorage.setItem('hasSeenEntryAnimation', 'true');
  };

  // Determine card statuses
  const isWalletConnected = !!wallet.address;
  const hasNFT = wallet.hasNFT;
  const hasDocuments = documents.length > 0;

  // Menu items arranged in circular layout (5 items now, excluding demo)
  const menuItems: MenuItem[] = [
    {
      id: 'wallet',
      title: 'Connect Wallet',
      icon: Wallet,
      description: isWalletConnected 
        ? `${wallet.address?.substring(0, 6)}...${wallet.address?.substring(38)}`
        : 'MetaMask or Crossmint',
      route: '/wallet',
      status: isWalletConnected ? 'completed' : 'active',
      angle: -Math.PI / 2, // Top (12 o'clock)
      distance: 320,
    },
    {
      id: 'execute',
      title: 'AI Execution',
      icon: BrainElectricity,
      description: hasNFT
        ? 'Chat with AI'
        : 'Mint NFT first',
      route: '/execute',
      status: hasNFT ? 'active' : 'locked',
      angle: -Math.PI / 6, // Top-right (2 o'clock)
      distance: 320,
    },
    {
      id: 'mint',
      title: 'Mint NFT',
      icon: ColorPicker,
      description: hasNFT 
        ? `NFT #${wallet.tokenId || 'minted'}`
        : isWalletConnected 
          ? 'Get access to AI'
          : 'Connect wallet first',
      route: '/mint',
      status: hasNFT ? 'completed' : isWalletConnected ? 'active' : 'locked',
      angle: Math.PI / 6, // Right side (4 o'clock)
      distance: 320,
    },
    {
      id: 'documents',
      title: 'My Documents',
      icon: Folder,
      description: hasDocuments 
        ? `${documents.length} document${documents.length > 1 ? 's' : ''}`
        : hasNFT
          ? 'View files'
          : 'Mint NFT first',
      route: '/documents',
      status: hasDocuments ? 'active' : hasNFT ? 'active' : 'locked',
      angle: Math.PI - Math.PI / 6, // Left side (8 o'clock)
      distance: 320,
    },
    {
      id: 'upload',
      title: 'Upload Document',
      icon: UploadSquare,
      description: hasDocuments 
        ? `${documents.length} file${documents.length > 1 ? 's' : ''}`
        : hasNFT 
          ? 'Store on IPFS'
          : 'Mint NFT first',
      route: '/upload',
      status: hasDocuments ? 'completed' : hasNFT ? 'active' : 'locked',
      angle: -Math.PI + Math.PI / 6, // Left-top side (10 o'clock)
      distance: 320,
    },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-deep-space-blue">
      <AnimatePresence mode="wait">
        {/* Entry Animation */}
        {showEntry && (
          <EntryAnimation key="entry" onComplete={handleEntryComplete} />
        )}

        {/* Transition */}
        {showTransition && (
          <EntryTransition key="transition" onComplete={handleTransitionComplete} />
        )}

        {/* Main Radial Dashboard */}
        {showDashboard && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full relative"
          >
            {/* 3D Background Layer */}
            <div className="absolute inset-0 -z-10">
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 12]} />
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  autoRotate
                  autoRotateSpeed={0.2}
                />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={0.8} color="#3CF2FF" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#A37CFF" />

                {/* Background Elements */}
                <ParticleNeurons count={150} />
                <EnergyRings count={5} />
              </Canvas>
            </div>

            {/* Shimmering Gradient Overlay */}
            <div 
              className="absolute inset-0 -z-5 opacity-30"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(60, 242, 255, 0.1), transparent 70%)',
                animation: 'shimmer 8s ease-in-out infinite',
              }}
            />

            {/* Back Button */}
            <motion.button
              onClick={() => {
                sessionStorage.removeItem('hasSeenEntryAnimation');
                window.location.reload();
              }}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md text-white hover:text-cyan-400 transition-colors border border-cyan-400/30"
              style={{
                background: 'rgba(60, 242, 255, 0.05)',
                boxShadow: '0 0 20px rgba(60, 242, 255, 0.1)',
              }}
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

            {/* Central Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.3
                }}
                className="flex flex-col items-center relative"
              >
                {/* Logo */}
                <StrategiLogoAnimated size={280} status="idle" />
              </motion.div>
            </div>

            {/* Radial Menu Items */}
            <div className="absolute inset-0 flex items-center justify-center">
              {menuItems.map((item, index) => (
                <RadialMenuItem key={item.id} item={item} index={index} />
              ))}
            </div>

            {/* Description Text - Well Below Components */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none w-full px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-center max-w-2xl mx-auto"
              >
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
                  Strategi
                </h1>
                <p className="text-lg text-gray-300 mb-1 font-light">
                  NFT-Gated AI Agents on Somnia L1
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  A decentralized AI platform where your NFT unlocks access to powerful AI agents.
                  Store documents on IPFS, mint provenance NFTs, and execute AI-powered analysis
                  in a transparent, blockchain-secured ecosystem.
                </p>
              </motion.div>
            </div>

            {/* Status Footer */}
            <motion.div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-gray-500">
                {wallet.address ? (
                  <>
                    Connected: {wallet.address.substring(0, 6)}...{wallet.address.substring(38)}
                    {wallet.hasNFT && ` | NFT #${wallet.tokenId}`}
                  </>
                ) : (
                  'Not connected - Click "Connect Wallet" to begin'
                )}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Shimmer Animation */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>

      {/* Background gradient */}
      <div className="fixed inset-0 -z-20 bg-linear-to-br from-deep-space-blue via-[#1B2138] to-deep-space-blue" />
    </div>
  );
};
