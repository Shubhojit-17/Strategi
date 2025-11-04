'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import AnimatedButton from '../ui/AnimatedButton';

interface MintPanelProps {
  state: 'idle' | 'preparing' | 'minting' | 'success' | 'error';
  price?: string;
  gasEstimate?: string;
  transactionHash?: string;
  tokenId?: number;
  error?: string;
  onMint: () => void;
  onClose?: () => void;
}

export const MintPanel: React.FC<MintPanelProps> = ({
  state,
  price = '0.01',
  gasEstimate = '0.002',
  transactionHash,
  tokenId,
  error,
  onMint,
  onClose,
}) => {
  const totalCost = (parseFloat(price) + parseFloat(gasEstimate)).toFixed(4);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg"
    >
      <GlassPanel className="p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-light mb-2">
            Mint Your NFT
          </h2>
          <p className="text-gray-300 text-sm">
            Get access to the AI-powered document system
          </p>
        </div>

        {/* State-specific content */}
        {state === 'idle' && (
          <>
            {/* Pricing Information */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">NFT Price</span>
                <span className="text-white font-semibold">{price} STT</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Estimated Gas</span>
                <span className="text-white font-semibold">{gasEstimate} STT</span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-30" />
              
              <div className="flex justify-between items-center">
                <span className="text-primary-light font-semibold">Total Cost</span>
                <span className="text-primary-light font-bold text-xl">{totalCost} STT</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3 bg-black/30 rounded-lg p-4">
              <h3 className="text-primary-light font-semibold text-sm mb-2">
                What You Get:
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Full access to AI document processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Secure IPFS document storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Unique digital identity on Somnia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Lifetime platform membership</span>
                </li>
              </ul>
            </div>

            {/* Mint Button */}
            <AnimatedButton
              onClick={onMint}
              className="w-full py-4 text-lg font-bold"
              variant="primary"
            >
              Mint NFT
            </AnimatedButton>
          </>
        )}

        {state === 'preparing' && (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-primary-light border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-center text-primary-light font-medium">
              Preparing transaction...
            </p>
            <p className="text-center text-gray-400 text-sm">
              Please confirm in your wallet
            </p>
          </div>
        )}

        {state === 'minting' && (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
            </div>
            <p className="text-center text-pink-400 font-medium text-lg">
              Minting Your NFT...
            </p>
            <p className="text-center text-gray-400 text-sm">
              Transaction is being processed on Somnia
            </p>
            {transactionHash && (
              <div className="bg-black/40 rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                <p className="text-xs text-primary-light font-mono break-all">
                  {transactionHash}
                </p>
              </div>
            )}
          </div>
        )}

        {state === 'success' && tokenId !== undefined && (
          <div className="space-y-6 py-8">
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="text-7xl mb-2"
              >
                ✓
              </motion.div>
            </div>
            <h3 className="text-center text-green-400 font-bold text-3xl">
              NFT Minted Successfully!
            </h3>
            <p className="text-center text-gray-300 text-lg">
              You now have full access to the platform
            </p>
            
            {/* Token Details Card */}
            <div className="bg-gradient-to-br from-green-900/30 to-primary-dark/30 rounded-xl p-8 border-2 border-green-400/30">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm mb-2">Your Token ID</p>
                <p className="text-primary-light font-bold text-5xl mb-4">
                  #{tokenId !== undefined ? tokenId : 'Pending...'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Active</span>
                </div>
              </div>
              
              {/* Benefits */}
              <div className="space-y-3 pt-4 border-t border-gray-700/50">
                <p className="text-gray-300 text-sm font-semibold mb-3">Access Includes:</p>
                {[
                  'AI document processing',
                  'IPFS secure storage',
                  'Unique digital identity',
                  'Lifetime membership'
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <span className="text-green-400">✓</span>
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {transactionHash && (
              <a
                href={`https://somnia-devnet.socialscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-primary-light hover:text-primary-lighter text-sm underline transition-colors"
              >
                View Transaction on Explorer →
              </a>
            )}
            {onClose && (
              <AnimatedButton
                onClick={onClose}
                className="w-full py-4 text-lg font-semibold"
                variant="primary"
              >
                Continue to Dashboard
              </AnimatedButton>
            )}
          </div>
        )}

        {state === 'error' && error && (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <div className="text-6xl">⚠️</div>
            </div>
            <h3 className="text-center text-red-400 font-bold text-xl">
              Minting Failed
            </h3>
            <div className="bg-red-900/20 rounded-lg p-4">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
            <div className="flex gap-3">
              <AnimatedButton
                onClick={onMint}
                className="flex-1 py-3"
                variant="primary"
              >
                Try Again
              </AnimatedButton>
              {onClose && (
                <AnimatedButton
                  onClick={onClose}
                  className="flex-1 py-3"
                  variant="secondary"
                >
                  Cancel
                </AnimatedButton>
              )}
            </div>
          </div>
        )}

        {/* Network indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Somnia Network</span>
        </div>
      </GlassPanel>
    </motion.div>
  );
};
