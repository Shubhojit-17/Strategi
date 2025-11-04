'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Document {
  document_id: number;
  filename: string;
  ipfs_hash: string;
  document_hash: string;
  file_size?: number; // Optional since backend doesn't return it
  token_id: number;
  timestamp: number;
  tx_hash: string;
  block_number: number;
  gateway_url: string;
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasNFT, setHasNFT] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get connected wallet address
  const { address: metamaskAddress, isConnected } = useAccount();
  
  // Check for Crossmint wallet from localStorage
  const [crossmintWallet, setCrossmintWallet] = useState<any>(null);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crossmint_wallet');
      if (stored) {
        try {
          const wallet = JSON.parse(stored);
          setCrossmintWallet(wallet);
        } catch (e) {
          console.error('Failed to parse crossmint wallet:', e);
        }
      }
    }
  }, []);
  
  const userAddress = metamaskAddress || crossmintWallet?.address;

  // Check NFT authentication when wallet connects
  useEffect(() => {
    const checkNFTAuth = async () => {
      if (!userAddress) {
        setHasNFT(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check?user_address=${userAddress}`);
        const data = await response.json();
        setHasNFT(data.authenticated);
      } catch (err) {
        console.error('Failed to check NFT authentication:', err);
        setHasNFT(false);
      }
    };

    if (mounted) {
      checkNFTAuth();
    }
  }, [userAddress, mounted]);

  // Fetch documents function
  const fetchDocuments = async () => {
    if (!userAddress || !hasNFT) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/list?user_address=${userAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents when wallet connects and NFT is verified
  useEffect(() => {
    if (mounted && hasNFT) {
      fetchDocuments();
    }
  }, [userAddress, hasNFT, mounted]);

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Truncate hash for display
  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
  };

  if (!mounted) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">My Documents</h2>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">My Documents</h2>
        <p className="text-yellow-400">⚠️ Please connect your wallet to view documents</p>
      </div>
    );
  }

  if (!hasNFT) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">My Documents</h2>
        <p className="text-yellow-400">⚠️ You need an Access NFT to view documents</p>
        <p className="text-sm text-gray-400 mt-2">Mint an NFT above to get started</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Documents</h2>
        <div className="flex items-center gap-3">
          {documents.length > 0 && (
            <span className="text-sm text-gray-400">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
          )}
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-400">Loading documents from blockchain...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded p-4 mb-4">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {!loading && !error && documents.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-2">📁 No documents yet</p>
          <p className="text-sm">Upload your first document above to get started</p>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.document_id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-white">{doc.filename}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Uploaded: {formatTimestamp(doc.timestamp)}
                  </p>
                </div>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  #{doc.document_id}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm mt-3">
                <div>
                  <span className="text-gray-400">NFT Token ID:</span>
                  <span className="ml-2 text-white">#{doc.token_id}</span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 font-semibold">IPFS CID (for AI Agent):</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(doc.ipfs_hash);
                        alert('CID copied to clipboard!');
                      }}
                      className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-400 hover:border-blue-300"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <code className="text-green-400 font-mono bg-gray-800 px-2 py-1 rounded block break-all">
                    {doc.ipfs_hash}
                  </code>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-gray-400 w-20">Hash:</span>
                  <code className="text-purple-400 font-mono">{truncateHash(doc.document_hash)}</code>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-gray-400 w-20">TX:</span>
                  <code className="text-blue-400 font-mono">{truncateHash(doc.tx_hash)}</code>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <a
                  href={doc.gateway_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm text-center transition-colors"
                >
                  📄 View File
                </a>
                <a
                  href={`https://somnia-testnet.calderaexplorer.xyz/tx/${doc.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded text-sm text-center transition-colors"
                >
                  🔗 View TX
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
