'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  hasNFT: boolean;
  isCheckingNFT: boolean;
  error: string | null;
  chainId: number | null;
}

interface UseWalletReturn extends WalletState {
  connectMetaMask: () => Promise<void>;
  disconnect: () => void;
  checkNFTOwnership: () => Promise<boolean>;
  switchToSomniaNetwork: () => Promise<void>;
}

// Somnia network configuration
const SOMNIA_CHAIN_ID = 50311; // Somnia testnet
const SOMNIA_RPC_URL = 'https://dream-rpc.somnia.network';

export const useWallet = (): UseWalletReturn => {
  const { address, isConnected: wagmiConnected } = useAccount();
  const { connect, isPending: isConnectLoading, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    hasNFT: false,
    isCheckingNFT: false,
    error: null,
    chainId: null,
  });

  // Update state when wagmi connection changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      address: address || null,
      isConnected: wagmiConnected,
      chainId: chainId || null,
      isConnecting: isConnectLoading,
    }));

    // Store wallet address in localStorage for uploads
    if (address && wagmiConnected) {
      localStorage.setItem('wallet_address', address);
      console.log('💾 Wallet address stored in localStorage:', address);
    } else {
      localStorage.removeItem('wallet_address');
    }
  }, [address, wagmiConnected, chainId, isConnectLoading]);

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      setState((prev) => ({
        ...prev,
        error: connectError.message,
        isConnecting: false,
      }));
    }
  }, [connectError]);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install it to continue.');
      }

      // Connect using wagmi
      await connect({
        connector: injected(),
      });

      setState((prev) => ({ ...prev, isConnecting: false }));
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to connect to MetaMask',
        isConnecting: false,
      }));
    }
  }, [connect]);

  // Check NFT ownership
  const checkNFTOwnership = useCallback(async (): Promise<boolean> => {
    if (!address) {
      console.error('No wallet address connected');
      return false;
    }

    try {
      setState((prev) => ({ ...prev, isCheckingNFT: true, error: null }));

      console.log('Checking NFT ownership for address:', address);

      // Call backend authentication endpoint
      const response = await fetch(`http://localhost:8000/auth/check?user_address=${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Auth check response status:', response.status);

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `Authentication check failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
          console.error('Auth check error:', errorData);
        } catch (e) {
          // Response is not JSON, use status text
          console.error('Auth check error (non-JSON):', errorMessage);
        }
        
        setState((prev) => ({
          ...prev,
          hasNFT: false,
          isCheckingNFT: false,
          error: errorMessage,
        }));
        return false;
      }

      const data = await response.json();
      console.log('✅ Auth check response data:', data);
      
      const hasNFT = data.authenticated || data.hasAccess || data.hasNFT || false;
      console.log('🔍 Computed hasNFT:', hasNFT);

      setState((prev) => {
        console.log('📝 Updating state - hasNFT:', hasNFT, ', isCheckingNFT: false');
        return {
          ...prev,
          hasNFT,
          isCheckingNFT: false,
        };
      });

      console.log('✅ checkNFTOwnership returning:', hasNFT);
      return hasNFT;
    } catch (error: any) {
      console.error('NFT ownership check error:', error);
      
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to check NFT ownership',
        isCheckingNFT: false,
        hasNFT: false,
      }));
      return false;
    }
  }, [address]);

  // Switch to Somnia network
  const switchToSomniaNetwork = useCallback(async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: 'MetaMask is not installed',
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null }));

      // Try to switch using wagmi first
      if (switchChain) {
        await switchChain({ chainId: SOMNIA_CHAIN_ID });
      } else {
        // Fallback to manual switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SOMNIA_CHAIN_ID.toString(16)}` }],
        });
      }
    } catch (error: any) {
      // If network not found, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${SOMNIA_CHAIN_ID.toString(16)}`,
                chainName: 'Somnia Testnet',
                nativeCurrency: {
                  name: 'STT',
                  symbol: 'STT',
                  decimals: 18,
                },
                rpcUrls: [SOMNIA_RPC_URL],
                blockExplorerUrls: ['https://somnia-devnet.socialscan.io/'],
              },
            ],
          });
        } catch (addError: any) {
          console.error('Failed to add Somnia network:', addError);
          setState((prev) => ({
            ...prev,
            error: 'Failed to add Somnia network',
          }));
        }
      } else {
        console.error('Failed to switch network:', error);
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to switch network',
        }));
      }
    }
  }, [switchChain]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    wagmiDisconnect();
    
    // Clear localStorage
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('auth_token');
    console.log('🗑️ Cleared wallet data from localStorage');
    
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      hasNFT: false,
      isCheckingNFT: false,
      error: null,
      chainId: null,
    });
  }, [wagmiDisconnect]);

  // Auto-check NFT when address changes
  useEffect(() => {
    if (address && wagmiConnected) {
      checkNFTOwnership();
    }
  }, [address, wagmiConnected, checkNFTOwnership]);

  return {
    ...state,
    connectMetaMask,
    disconnect,
    checkNFTOwnership,
    switchToSomniaNetwork,
  };
};
