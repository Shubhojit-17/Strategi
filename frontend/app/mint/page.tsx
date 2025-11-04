'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MintingGateway } from '@/components/nft/MintingGateway';
import { useAppStore } from '@/lib/store/appStore';
import NeonText from '@/components/ui/NeonText';
import AnimatedButton from '@/components/ui/AnimatedButton';

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
      <div className="relative w-full min-h-screen bg-linear-to-b from-black via-primary-darker to-black overflow-hidden flex items-center justify-center">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute inset-0 bg-gradient-radial from-primary-dark/20 via-transparent to-transparent" />

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-12 max-w-2xl text-center relative"
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
          <NeonText className="text-4xl font-bold mb-4">
            NFT Already Minted!
          </NeonText>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-6">
            You already own an Access NFT for this platform
          </p>

          {/* NFT Details */}
          <div className="bg-black/30 rounded-xl p-6 mb-8 border border-primary-dark/30">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-left">
                <p className="text-sm text-gray-500 mb-1">Token ID</p>
                <p className="text-2xl font-bold text-primary-light">
                  #{wallet.tokenId || 'N/A'}
                </p>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="text-2xl font-bold text-green-400">
                  Active
                </p>
              </div>
            </div>
            <div className="mt-4 text-left">
              <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
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
              className="px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600"
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
