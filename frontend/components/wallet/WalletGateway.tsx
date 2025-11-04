'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import NeonText from '../ui/NeonText';

// Dynamically import Canvas to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false });
const OrbitControls = dynamic(() => import('@react-three/drei').then(mod => mod.OrbitControls), { ssr: false });
const PerspectiveCamera = dynamic(() => import('@react-three/drei').then(mod => mod.PerspectiveCamera), { ssr: false });
const Environment = dynamic(() => import('@react-three/drei').then(mod => mod.Environment), { ssr: false });

const FloatingNode = dynamic(() => import('./FloatingNode').then(mod => ({ default: mod.FloatingNode })), { ssr: false });
const NodeConnector = dynamic(() => import('./NodeConnector').then(mod => ({ default: mod.NodeConnector })), { ssr: false });

interface WalletGatewayProps {
  onWalletSelect: (type: 'metamask' | 'crossmint') => void;
  selectedWallet?: 'metamask' | 'crossmint' | null;
  isConnecting?: boolean;
}

export const WalletGateway: React.FC<WalletGatewayProps> = ({
  onWalletSelect,
  selectedWallet = null,
  isConnecting = false,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fix hydration - only render 3D after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const metamaskNode = {
    position: [-3, 0, 0] as [number, number, number],
    color: '#f6851b',
    icon: '🦊',
    label: 'MetaMask',
    type: 'metamask' as const,
  };

  const crossmintNode = {
    position: [3, 0, 0] as [number, number, number],
    color: '#00d4ff',
    icon: '✉️',
    label: 'Crossmint',
    type: 'crossmint' as const,
  };

  const handleNodeClick = (type: 'metamask' | 'crossmint') => {
    if (!isConnecting) {
      onWalletSelect(type);
    }
  };

  return (
    <div className="relative w-full h-screen bg-linear-to-b from-black via-primary-darker to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-radial from-primary-dark/20 via-transparent to-transparent" />
      
      {/* Header */}
      <div className="absolute top-8 left-0 right-0 z-10 flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <NeonText className="text-4xl md:text-5xl font-bold">
            Connect Your Wallet
          </NeonText>
        </motion.div>
        
        <motion.p
          className="text-gray-300 text-lg max-w-2xl text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Choose your preferred method to access the AI-powered document system
        </motion.p>
      </div>

      {/* 3D Scene - Only render after mount */}
      {mounted && (
        <div className="absolute inset-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            
            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
            <spotLight
              position={[0, 10, 0]}
              angle={0.3}
              penumbra={1}
              intensity={0.5}
            castShadow
          />

          {/* Environment */}
          <Environment preset="night" />

          {/* Floating Nodes */}
          <FloatingNode
            {...metamaskNode}
            onClick={() => handleNodeClick('metamask')}
            isSelected={selectedWallet === 'metamask'}
            isActive={!isConnecting}
          />
          
          <FloatingNode
            {...crossmintNode}
            onClick={() => handleNodeClick('crossmint')}
            isSelected={selectedWallet === 'crossmint'}
            isActive={false} // Crossmint coming soon
          />

          {/* Connection line between nodes */}
          <NodeConnector
            start={metamaskNode.position}
            end={crossmintNode.position}
            color="#00ffff"
            isActive={selectedWallet !== null}
          />

          {/* Interactive camera controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            autoRotate={!selectedWallet}
            autoRotateSpeed={0.5}
          />
        </Canvas>
        </div>
      )}

      {/* Connection Status Panel */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassPanel className="px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
                <span className="text-primary-light font-medium">
                  Connecting to {selectedWallet === 'metamask' ? 'MetaMask' : 'Crossmint'}...
                </span>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        className="absolute bottom-8 left-8 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <GlassPanel className="px-6 py-4 max-w-sm">
          <h3 className="text-primary-light font-semibold mb-2">Getting Started</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Click on a node to connect</li>
            <li>• You'll need an NFT to access the system</li>
            <li>• Somnia network required</li>
          </ul>
        </GlassPanel>
      </motion.div>

      {/* Particles background effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-light/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};
