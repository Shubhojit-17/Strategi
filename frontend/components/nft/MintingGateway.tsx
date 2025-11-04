'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { MintingBubble } from './MintingBubble';
import { MintPanel } from './MintPanel';
import NeonText from '../ui/NeonText';
import { useMint } from '@/lib/hooks/useMint';

interface MintingGatewayProps {
  onMintComplete?: (tokenId: number) => void;
  onClose?: () => void;
}

export const MintingGateway: React.FC<MintingGatewayProps> = ({
  onMintComplete,
  onClose,
}) => {
  const {
    status: mintState,
    progress,
    transactionHash,
    tokenId,
    error,
    gasEstimate,
    mint,
  } = useMint();

  const handleMint = async () => {
    await mint();
  };

  const handleClose = () => {
    if (tokenId && onMintComplete) {
      onMintComplete(tokenId);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-black via-primary-darker to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-radial from-primary-dark/20 via-transparent to-transparent" />

      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-light/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 z-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <NeonText className="text-4xl md:text-5xl font-bold">
            NFT Minting Portal
          </NeonText>
        </motion.div>
      </div>

      {/* Main content layout */}
      <div className="relative h-screen flex items-center justify-center gap-12 px-8">
        {/* 3D Minting Bubble - Left side */}
        <motion.div
          className="flex-1 h-full max-w-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.0} />
            <pointLight position={[-10, -10, -10]} intensity={0.6} color="#A37CFF" />
            <spotLight
              position={[0, 15, 0]}
              angle={0.3}
              penumbra={1}
              intensity={0.8}
              castShadow
            />

            {/* Environment */}
            <Environment preset="night" />

            {/* Minting Bubble */}
            <MintingBubble state={mintState} progress={progress} />

            {/* Camera controls */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={mintState === 'idle' || mintState === 'success'}
              autoRotateSpeed={mintState === 'success' ? 2.0 : 0.5}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </motion.div>

        {/* Mint Panel - Right side */}
        <div className="flex-shrink-0">
          <MintPanel
            state={mintState}
            price="0.01"
            gasEstimate={gasEstimate}
            transactionHash={transactionHash}
            tokenId={tokenId}
            error={error}
            onMint={handleMint}
            onClose={mintState === 'success' ? handleClose : undefined}
          />
        </div>
      </div>

      {/* Status messages */}
      {mintState === 'preparing' && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="bg-primary-dark/80 backdrop-blur-md rounded-full px-6 py-3 border border-primary-light/30">
            <p className="text-primary-light text-sm font-medium">
              ✨ Preparing your unique NFT...
            </p>
          </div>
        </motion.div>
      )}

      {mintState === 'minting' && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="bg-pink-900/80 backdrop-blur-md rounded-full px-6 py-3 border border-pink-400/30">
            <p className="text-pink-300 text-sm font-medium">
              ⚡ Minting in progress... {Math.round(progress * 100)}%
            </p>
          </div>
        </motion.div>
      )}

      {mintState === 'success' && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <div className="bg-green-900/80 backdrop-blur-md rounded-full px-8 py-4 border border-green-400/30">
            <p className="text-green-300 text-lg font-bold">
              🎉 NFT Minted Successfully!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
