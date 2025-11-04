'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import GlassPanel from '../ui/GlassPanel';
import AnimatedButton from '../ui/AnimatedButton';

const BackgroundParticles = () => {
  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.05, 16, 16]}
          position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
          ]}
        >
          <meshStandardMaterial
            color={Math.random() > 0.5 ? '#3CF2FF' : '#82FFD2'}
            emissive={Math.random() > 0.5 ? '#3CF2FF' : '#82FFD2'}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </>
  );
};

interface WalletGatewayProps {
  onWalletSelect: (wallet: 'metamask' | 'crossmint') => void;
  selectedWallet?: 'metamask' | 'crossmint' | null;
  isConnecting?: boolean;
  onClose?: () => void;
}

export const WalletGateway: React.FC<WalletGatewayProps> = ({ 
  onWalletSelect, 
  selectedWallet = null, 
  isConnecting = false,
  onClose 
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-deep-space-blue">
      <div className="absolute inset-0 -z-10">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.2} 
          />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#3CF2FF" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#A37CFF" />
          <BackgroundParticles />
        </Canvas>
      </div>

      <motion.div 
        className="absolute top-8 left-8 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatedButton onClick={handleBack} variant="ghost">
          ← Back
        </AnimatedButton>
      </motion.div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="w-full max-w-4xl px-8">
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-accent to-primary-light">
              Connect Your Wallet
            </h1>
            <p className="text-gray-300 text-lg">
              Choose your preferred wallet to access the platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => !isConnecting && onWalletSelect('metamask')}
                disabled={isConnecting}
                className={`w-full glass-panel p-8 rounded-2xl transition-all duration-300 ${
                  isConnecting && selectedWallet === 'metamask'
                    ? 'border-primary-light cursor-not-allowed'
                    : isConnecting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-primary-light hover:scale-105 cursor-pointer'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="text-6xl mb-2">🦊</div>
                  <h3 className="text-2xl font-bold text-white">MetaMask</h3>
                  <p className="text-gray-400 text-sm text-center">
                    Connect using MetaMask browser extension
                  </p>
                  {isConnecting && selectedWallet === 'metamask' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-primary-light"
                    >
                      <div className="w-4 h-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Connecting...</span>
                    </motion.div>
                  )}
                </div>
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button 
                disabled 
                className="w-full glass-panel p-8 rounded-2xl opacity-50 cursor-not-allowed"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="text-6xl mb-2">✉️</div>
                  <h3 className="text-2xl font-bold text-white">Crossmint</h3>
                  <p className="text-gray-400 text-sm text-center">
                    Email-based wallet
                  </p>
                  <span className="text-xs text-accent mt-2">Coming Soon</span>
                </div>
              </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <GlassPanel className="p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">ℹ️</span>
                <div>
                  <h4 className="text-white font-semibold mb-2">
                    Important Information
                  </h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• You need to connect to the Somnia network</li>
                    <li>• An NFT is required to access the platform</li>
                    <li>• If you don't have an NFT, you can mint one after connecting</li>
                  </ul>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>

      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-deep-space-blue via-[#1B2138] to-deep-space-blue" />
    </div>
  );
};
