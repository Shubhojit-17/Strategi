'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { logger, LogCategory, logTransaction } from '@/lib/logger';

// Simplified ABI for minting
const ACCESS_NFT_ABI = [
  {
    name: 'mintAccessNFT',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_tokenURI', type: 'string' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const SOMNIA_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_SOMNIA_CHAIN_ID || '50312');

export default function MintNFT() {
  const { address, isConnected, chain } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tokenId, setTokenId] = useState<number | null>(null);
  
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const contractAddress = process.env.NEXT_PUBLIC_ACCESS_NFT_ADDRESS as `0x${string}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user already has NFT
  useEffect(() => {
    const checkNFT = async () => {
      if (!address || !mounted) {
        setChecking(false);
        return;
      }

      setChecking(true);
      logger.debug(LogCategory.NFT, 'Checking NFT status', { address });
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check?user_address=${address}`);
        const data = await response.json();
        setHasNFT(data.authenticated);
        setTokenId(data.token_id);
        
        logger.auditNFTCheck(address, data.authenticated, data.token_id);
      } catch (err) {
        logger.error(LogCategory.NFT, 'Failed to check NFT status', err as Error, { address });
        setHasNFT(false);
      } finally {
        setChecking(false);
      }
    };

    checkNFT();
  }, [address, mounted, isSuccess]);

  // Log successful mint
  useEffect(() => {
    if (isSuccess && hash && address) {
      logger.auditNFTMint(address, hash, tokenId || undefined);
      logTransaction('NFT Minted', hash, address, {
        contract: contractAddress,
        mintPrice: '0.01 STM',
        network: 'Somnia Testnet',
      });
    }
  }, [isSuccess, hash, address]);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-2 border-purple-500/50 p-6 rounded-lg shadow-xl">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  const handleMint = async () => {
    logger.info(LogCategory.NFT, 'Initiating NFT mint', { address, chain: chain?.id });
    
    if (!contractAddress) {
      const error = 'Contract not deployed. Please check configuration.';
      alert(error);
      logger.error(LogCategory.NFT, 'Mint failed - contract not configured', new Error(error));
      return;
    }

    if (!address) {
      alert('Please connect your wallet first');
      logger.warn(LogCategory.NFT, 'Mint attempted without wallet connection');
      return;
    }

    if (chain?.id !== SOMNIA_CHAIN_ID) {
      alert('Please switch to Somnia Shannon Testnet first');
      logger.warn(LogCategory.NFT, 'Mint attempted on wrong network', {
        currentChain: chain?.id,
        expectedChain: SOMNIA_CHAIN_ID,
      });
      return;
    }

    try {
      // Simple token URI - could be enhanced with metadata
      const tokenURI = `ipfs://access-nft/${address}`;
      
      logger.debug(LogCategory.NFT, 'Writing contract for mint', {
        contract: contractAddress,
        value: '0.01 STM',
        tokenURI,
      });

      writeContract({
        address: contractAddress,
        abi: ACCESS_NFT_ABI,
        functionName: 'mintAccessNFT',
        args: [tokenURI],
        value: parseEther('0.01'), // 0.01 STM (Somnia testnet token)
      });
    } catch (err: any) {
      logger.error(LogCategory.NFT, 'Mint transaction failed', err, { address, contract: contractAddress });
      alert(`Failed to mint: ${err.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-2 border-purple-500/50 p-6 rounded-lg shadow-xl">
        <div className="flex items-start space-x-3 mb-4">
          <span className="text-4xl">🎫</span>
          <div>
            <h2 className="text-2xl font-bold text-white">Step 1: Mint Access NFT</h2>
            <p className="text-purple-200 text-sm mt-1">Authentication Token Required</p>
          </div>
        </div>
        <div className="p-4 bg-blue-500/20 border border-blue-400/50 rounded-lg">
          <p className="text-blue-200">🔐 Please connect your wallet first to mint an Access NFT</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-2 border-purple-500/50 p-6 rounded-lg shadow-xl">
      <div className="flex items-start space-x-3 mb-4">
        <span className="text-4xl">🎫</span>
        <div>
          <h2 className="text-2xl font-bold text-white">Step 1: Mint Access NFT</h2>
          <p className="text-purple-200 text-sm mt-1">Authentication Token Required</p>
        </div>
      </div>

      {checking ? (
        <div className="p-4 bg-gray-500/20 border border-gray-400/50 rounded-lg">
          <p className="text-gray-200">🔍 Checking NFT status...</p>
        </div>
      ) : hasNFT ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-200 font-medium mb-2">✅ You already own an Access NFT!</p>
            <p className="text-sm text-gray-300">Token ID: #{tokenId}</p>
            <p className="text-sm text-gray-400 mt-2">You can now upload documents and execute AI agents.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-200 font-medium mb-2">⚠️ No Access NFT Found</p>
            <p className="text-sm text-gray-300">You need to mint an Access NFT to use this system.</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• Cost: 0.01 STM (Somnia testnet token)</li>
              <li>• One-time mint per wallet</li>
              <li>• Soulbound (non-transferable)</li>
              <li>• Required for document upload & AI execution</li>
            </ul>
          </div>

          <button
            onClick={handleMint}
            disabled={isPending || isConfirming || !contractAddress}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:bg-gray-600 disabled:text-gray-400 font-bold text-lg shadow-lg"
          >
            {isPending ? '⏳ Confirming Transaction...' : isConfirming ? '⛏️ Minting NFT...' : '🎫 Mint Access NFT (0.01 STM)'}
          </button>

          {writeError && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200">❌ Error: {writeError.message}</p>
            </div>
          )}

          {isSuccess && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200 font-medium mb-2">✅ Access NFT minted successfully!</p>
              <p className="text-sm text-gray-300 mb-2">You can now upload documents and execute AI agents.</p>
              <a
                href={`https://explorer.somnia.network/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
              >
                View transaction on explorer →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
