'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cid, setCid] = useState('');
  const [error, setError] = useState('');
  const [hasNFT, setHasNFT] = useState(false);
  const [checking, setChecking] = useState(true);
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
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check?user_address=${userAddress}`);
        const data = await response.json();
        setHasNFT(data.authenticated);
      } catch (err) {
        console.error('Failed to check NFT authentication:', err);
        setHasNFT(false);
      } finally {
        setChecking(false);
      }
    };

    if (mounted) {
      checkNFTAuth();
    }
  }, [userAddress, mounted]);

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!hasNFT) {
      alert('⚠️ You must mint an Access NFT before uploading documents');
      return;
    }

    setUploading(true);
    setError('');
    setCid('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_address', userAddress);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'NFT_AUTH_REQUIRED') {
          throw new Error('NFT authentication required. Please mint an Access NFT first.');
        }
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setCid(data.cid);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">📄 Upload Document</h2>
        <div className="mb-4 p-3 bg-gray-500/20 border border-gray-400/50 rounded-lg">
          <p className="text-gray-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">📄 Upload Document</h2>
      
      {/* NFT Authentication Status */}
      {userAddress ? (
        <div className={`mb-4 p-3 rounded-lg ${hasNFT ? 'bg-green-500/20 border border-green-500/50' : 'bg-yellow-500/20 border border-yellow-500/50'}`}>
          {checking ? (
            <p className="text-gray-200">🔍 Checking NFT authentication...</p>
          ) : hasNFT ? (
            <p className="text-green-200">✅ Authenticated - You can upload documents</p>
          ) : (
            <p className="text-yellow-200">⚠️ NFT Required - Please mint an Access NFT first</p>
          )}
        </div>
      ) : (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/50 rounded-lg">
          <p className="text-blue-200">🔐 Connect your wallet to upload documents</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">
            Select File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={!userAddress || !hasNFT}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            accept=".txt,.pdf,.doc,.docx,.json"
          />
          {file && (
            <p className="text-sm text-gray-300 mt-2">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !file || !userAddress || !hasNFT}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600 disabled:text-gray-400 font-medium"
        >
          {uploading ? 'Uploading to IPFS...' : hasNFT ? 'Upload to IPFS' : 'Mint NFT First to Upload'}
        </button>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">❌ Error: {error}</p>
          </div>
        )}

        {cid && (
          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p className="text-green-200 font-medium mb-2">✅ Upload Successful!</p>
            <p className="text-sm text-gray-300 break-all">CID: {cid}</p>
            <a
              href={`https://gateway.pinata.cloud/ipfs/${cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
            >
              View on IPFS →
            </a>
            <p className="text-sm text-gray-400 mt-2">
              💡 Document stored securely with blockchain verification
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
