'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { MintPanel } from './MintPanel';
import { useMint } from '@/lib/hooks/useMint';

// Background particles component matching upload page
const BackgroundParticles: React.FC = () => {
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
    <div className="relative w-full min-h-screen bg-deep-space-blue overflow-hidden">
      {/* 3D Canvas Background */}
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

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 z-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
            NFT Minting Portal
          </h1>
        </motion.div>
      </div>

      {/* Main content layout - Centered */}
      <div className="relative h-screen flex items-center justify-center px-8">
        {/* Mint Panel - Centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
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
        </motion.div>
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
