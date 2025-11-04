'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'viem';

interface MintState {
  status: 'idle' | 'preparing' | 'minting' | 'success' | 'error';
  progress: number;
  transactionHash?: string;
  tokenId?: number;
  error?: string;
  gasEstimate?: string;
}

interface UseMintReturn extends MintState {
  mint: () => Promise<void>;
  reset: () => void;
  estimateGas: () => Promise<void>;
}

// NFT Contract configuration
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x...';
const MINT_PRICE = '0.01'; // 0.01 STT

export const useMint = (): UseMintReturn => {
  const { address } = useAccount();
  const chainId = useChainId();

  const [state, setState] = useState<MintState>({
    status: 'idle',
    progress: 0,
    gasEstimate: '0.002',
  });

  // Estimate gas for minting
  const estimateGas = useCallback(async () => {
    if (!address) return;

    try {
      // In a real implementation, this would call the contract's estimateGas
      // For now, using a fixed estimate
      setState((prev) => ({
        ...prev,
        gasEstimate: '0.002',
      }));
    } catch (error) {
      console.error('Gas estimation failed:', error);
      setState((prev) => ({
        ...prev,
        gasEstimate: '0.003', // Fallback estimate
      }));
    }
  }, [address]);

  // Auto-estimate gas when address changes
  useEffect(() => {
    if (address) {
      estimateGas();
    }
  }, [address, estimateGas]);

  // Main mint function
  const mint = useCallback(async () => {
    if (!address) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Please connect your wallet first',
      }));
      return;
    }

    try {
      // Step 1: Preparing
      setState((prev) => ({
        ...prev,
        status: 'preparing',
        error: undefined,
        progress: 0,
      }));

      // Call backend to initiate minting
      const response = await fetch('http://localhost:8000/nft/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          price: MINT_PRICE,
        }),
      });

      if (!response.ok) {
        throw new Error(`Minting failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Step 2: Minting
      setState((prev) => ({
        ...prev,
        status: 'minting',
        transactionHash: data.transactionHash || data.txHash,
        progress: 0.1,
      }));

      // Simulate progress updates (in real app, this would poll transaction status)
      const progressInterval = setInterval(() => {
        setState((prev) => {
          const newProgress = Math.min(prev.progress + 0.1, 0.9);
          return {
            ...prev,
            progress: newProgress,
          };
        });
      }, 500);

      // Wait for transaction confirmation (simulated)
      await new Promise(resolve => setTimeout(resolve, 5000));

      clearInterval(progressInterval);

      // Step 3: Success
      setState((prev) => ({
        ...prev,
        status: 'success',
        progress: 1.0,
        tokenId: data.tokenId || Math.floor(Math.random() * 10000) + 1,
      }));

    } catch (error: any) {
      console.error('Minting error:', error);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to mint NFT. Please try again.',
        progress: 0,
      }));
    }
  }, [address]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      gasEstimate: '0.002',
    });
  }, []);

  return {
    ...state,
    mint,
    reset,
    estimateGas,
  };
};

// Helper hook for checking if user already has NFT
export const useHasNFT = (): {
  hasNFT: boolean;
  isChecking: boolean;
  tokenId?: number;
} => {
  const { address } = useAccount();
  const [hasNFT, setHasNFT] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [tokenId, setTokenId] = useState<number>();

  useEffect(() => {
    const checkNFT = async () => {
      if (!address) {
        setHasNFT(false);
        setTokenId(undefined);
        return;
      }

      setIsChecking(true);

      try {
        const response = await fetch(`http://localhost:8000/auth/check?address=${address}`);
        const data = await response.json();

        setHasNFT(data.hasNFT || data.hasAccess || false);
        setTokenId(data.tokenId);
      } catch (error) {
        console.error('NFT check failed:', error);
        setHasNFT(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkNFT();
  }, [address]);

  return { hasNFT, isChecking, tokenId };
};
