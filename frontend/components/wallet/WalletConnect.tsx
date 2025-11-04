'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletGateway } from './WalletGateway';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAppStore } from '@/lib/store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';

interface WalletConnectProps {
  onAuthenticated?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onAuthenticated }) => {
  const router = useRouter();
  const {
    address,
    isConnected,
    isConnecting,
    hasNFT,
    isCheckingNFT,
    error,
    chainId,
    connectMetaMask,
    switchToSomniaNetwork,
    checkNFTOwnership,
  } = useWallet();

  const setWallet = useAppStore((state) => state.setWallet);
  const [selectedWallet, setSelectedWallet] = useState<'metamask' | 'crossmint' | null>(null);
  const [showNetworkPrompt, setShowNetworkPrompt] = useState(false);
  const [showNFTError, setShowNFTError] = useState(false);
  const [authenticationStep, setAuthenticationStep] = useState<
    'select' | 'connecting' | 'checking-network' | 'checking-nft' | 'success' | 'error'
  >('select');
  const [mounted, setMounted] = useState(false);

  // Somnia chain ID
  const SOMNIA_CHAIN_ID = 50311;

  // Fix hydration error - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle wallet selection
  const handleWalletSelect = async (type: 'metamask' | 'crossmint') => {
    setSelectedWallet(type);
    setAuthenticationStep('connecting');

    if (type === 'metamask') {
      await connectMetaMask();
    } else if (type === 'crossmint') {
      // Crossmint integration coming soon
      setAuthenticationStep('error');
    }
  };

  // Check network when connected
  useEffect(() => {
    if (isConnected && address && !isConnecting && mounted && authenticationStep === 'select') {
      console.log('🔌 Wallet connected, checking network...');
      if (chainId !== SOMNIA_CHAIN_ID) {
        setAuthenticationStep('checking-network');
        setShowNetworkPrompt(true);
      } else {
        // Network is correct, check NFT
        console.log('✅ Network correct, checking NFT ownership...');
        setAuthenticationStep('checking-nft');
        checkNFTOwnership()
          .then((hasNFT) => {
            console.log('🎯 NFT check completed. Result:', hasNFT);
            if (hasNFT) {
              setAuthenticationStep('success');
              setWallet({
                address,
                hasNFT: true,
                connectionMethod: 'metamask',
              });
              setTimeout(() => {
                console.log('Redirecting after success...');
                if (onAuthenticated) {
                  onAuthenticated();
                } else {
                  router.push('/');
                }
              }, 1500);
            } else {
              setAuthenticationStep('error');
              setShowNFTError(true);
            }
          })
          .catch((error) => {
            console.error('Error in checkNFTOwnership:', error);
            setAuthenticationStep('error');
          });
      }
    }
  }, [isConnected, address, chainId, isConnecting, mounted, authenticationStep]);

  // Handle network switch
  const handleSwitchNetwork = async () => {
    setShowNetworkPrompt(false);
    await switchToSomniaNetwork();
    // After switching, check NFT
    setTimeout(async () => {
      setAuthenticationStep('checking-nft');
      try {
        const hasNFT = await checkNFTOwnership();
        console.log('🎯 NFT check after network switch completed. Result:', hasNFT);
        if (hasNFT) {
          setAuthenticationStep('success');
          setWallet({
            address: address!,
            hasNFT: true,
            connectionMethod: 'metamask',
          });
          setTimeout(() => {
            console.log('Redirecting after success...');
            if (onAuthenticated) {
              onAuthenticated();
            } else {
              router.push('/');
            }
          }, 1500);
        } else {
          setAuthenticationStep('error');
          setShowNFTError(true);
        }
      } catch (error) {
        console.error('Error in checkNFTOwnership after network switch:', error);
        setAuthenticationStep('error');
      }
    }, 1000);
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      setAuthenticationStep('error');
    }
  }, [error]);

  // Don't render until mounted (fixes hydration)
  if (!mounted) {
    return null;
  }

  return (
    <>
      <WalletGateway
        onWalletSelect={handleWalletSelect}
        selectedWallet={selectedWallet}
        isConnecting={isConnecting || authenticationStep === 'connecting'}
      />

      {/* Network Switch Prompt */}
      <AnimatePresence>
        {showNetworkPrompt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <GlassPanel className="p-8 max-w-md">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🔄</div>
                  <h2 className="text-2xl font-bold text-primary-light">
                    Switch to Somnia Network
                  </h2>
                  <p className="text-gray-300">
                    This application requires the Somnia network. Please switch your network to
                    continue.
                  </p>
                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={handleSwitchNetwork}
                      className="px-6 py-3 bg-primary-light text-black rounded-lg font-semibold hover:bg-primary-lighter transition-colors"
                    >
                      Switch Network
                    </button>
                    <button
                      onClick={() => {
                        setShowNetworkPrompt(false);
                        setAuthenticationStep('select');
                        setSelectedWallet(null);
                      }}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT Error */}
      <AnimatePresence>
        {showNFTError && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <GlassPanel className="p-8 max-w-md">
                <div className="text-center space-y-4">
                  <div className="text-6xl mb-4">🎫</div>
                  <h2 className="text-2xl font-bold text-red-400">NFT Required</h2>
                  <p className="text-gray-300">
                    You need to own an NFT from our collection to access this platform.
                  </p>
                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={() => router.push('/mint')}
                      className="px-6 py-3 bg-primary-light text-black rounded-lg font-semibold hover:bg-primary-lighter transition-colors"
                    >
                      Mint NFT
                    </button>
                    <button
                      onClick={() => {
                        setShowNFTError(false);
                        setAuthenticationStep('select');
                        setSelectedWallet(null);
                      }}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checking NFT Status */}
      <AnimatePresence>
        {authenticationStep === 'checking-nft' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassPanel className="p-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
                <span className="text-primary-light font-medium text-lg">
                  Verifying NFT ownership...
                </span>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {authenticationStep === 'success' && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassPanel className="p-8">
                <div className="text-center space-y-4">
                  <motion.div
                    className="text-8xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.6 }}
                  >
                    ✓
                  </motion.div>
                  <h2 className="text-2xl font-bold text-green-400">Authenticated!</h2>
                  <p className="text-gray-300">Taking you to the dashboard...</p>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && authenticationStep === 'error' && !showNFTError && !showNetworkPrompt && (
          <motion.div
            className="fixed bottom-8 right-8 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <GlassPanel className="p-4 bg-red-900/50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-red-300">Connection Error</h3>
                  <p className="text-sm text-gray-300">{error}</p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
