'use client';

import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { MintingGateway } from '@/components/nft/MintingGateway';
import { useAppStore } from '@/lib/store/appStore';
import AnimatedButton from '@/components/ui/AnimatedButton';

// Background particles component
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

export default function MintPage() {
  const router = useRouter();
  const wallet = useAppStore((state) => state.wallet);
  const setWallet = useAppStore((state) => state.setWallet);

  const handleMintComplete = (tokenId: number) => {
    // Update store with NFT info
    setWallet({
      hasNFT: true,
      tokenId,
    });

    // Redirect to dashboard
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  const handleClose = () => {
    router.push('/');
  };

  // If user already has NFT, show success view
  if (wallet.hasNFT) {
    return (
      <div className="relative w-full min-h-screen bg-deep-space-blue overflow-hidden flex items-center justify-center">
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

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-12 max-w-3xl text-center relative"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-8xl mb-6"
          >
            ✓
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
            NFT Already Minted!
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8">
            You already own an Access NFT for this platform
          </p>

          {/* NFT Details */}
          <div className="bg-gradient-to-br from-green-900/20 to-primary-dark/20 rounded-2xl p-8 mb-8 border-2 border-green-400/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Token ID</p>
                <p className="text-4xl font-bold text-primary-light">
                  #{wallet.tokenId || 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Status</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-3xl font-bold text-green-400">
                    Active
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center pt-6 border-t border-gray-700/50">
              <p className="text-sm text-gray-400 mb-2">Wallet Address</p>
              <p className="text-sm font-mono text-gray-300 break-all">
                {wallet.address}
              </p>
            </div>
          </div>

          {/* Benefits List */}
          <div className="text-left mb-8">
            <p className="text-lg font-semibold text-white mb-4">Your Access Includes:</p>
            <div className="space-y-3">
              {[
                'Full access to AI document processing',
                'Secure IPFS document storage',
                'Unique digital identity on Somnia',
                'Lifetime platform membership'
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <AnimatedButton
              onClick={() => router.push('/')}
              className="px-8 py-3"
            >
              Back to Dashboard
            </AnimatedButton>
            <AnimatedButton
              onClick={() => router.push('/upload')}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600"
            >
              Start Uploading
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // Otherwise, show minting interface
  return (
    <MintingGateway 
      onMintComplete={handleMintComplete}
      onClose={handleClose}
    />
  );
}
