'use client';

import UnifiedWalletConnect from '@/components/UnifiedWalletConnect';
import DocumentUpload from '@/components/DocumentUpload';
import MintNFT from '@/components/MintNFT';
import AIExecution from '@/components/AIExecution';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white">Somnia AI Agents</h1>
            <p className="text-blue-200 text-lg">NFT-Authenticated AI Execution on Somnia L1</p>
          </div>
          
          {/* Unified Wallet Connection */}
          <UnifiedWalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 bg-blue-500/20 backdrop-blur-sm border border-blue-400/50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-3">🚀 Decentralized Dropbox with AI</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-100">
            <li className="text-white"><strong className="text-blue-200">Step 1: Connect Wallet</strong> <span className="text-gray-200">Choose MetaMask OR Email (one method only)</span></li>
            <li className="text-white"><strong className="text-blue-200">Step 2: Mint Access NFT</strong> <span className="text-gray-200">One-time authentication token (0.01 STM)</span></li>
            <li className="text-white"><strong className="text-blue-200">Step 3: Upload Documents</strong> <span className="text-gray-200">Store unlimited files on IPFS (NFT verifies access)</span></li>
            <li className="text-white"><strong className="text-blue-200">Step 4: Execute AI</strong> <span className="text-gray-200">Analyze any document using your NFT + Document CID</span></li>
            <li className="text-white"><strong className="text-blue-200">Step 5: Verify</strong> <span className="text-gray-200">All operations logged on Somnia blockchain</span></li>
          </ol>
          <p className="mt-4 text-sm text-blue-100 bg-blue-900/30 p-3 rounded">
            <strong className="text-white">💡 How it works:</strong> Your NFT acts like a membership card. Once you have it, you can upload and access multiple documents - just like Dropbox, but decentralized on IPFS with blockchain verification!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - NFT FIRST, then Upload */}
          <div className="space-y-6">
            <MintNFT />
            <DocumentUpload />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AIExecution />
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-xl mb-2 text-white">🔐 NFT-Gated</h3>
            <p className="text-gray-300 text-sm">
              Only NFT holders can execute AI on their documents
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-xl mb-2 text-white">✅ Verifiable</h3>
            <p className="text-gray-300 text-sm">
              All execution steps are recorded on Somnia blockchain
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-xl mb-2 text-white">💾 Decentralized</h3>
            <p className="text-gray-300 text-sm">
              Documents and results stored on IPFS
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-800/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-300">
          <p className="text-white font-medium">Built for Somnia AI Hackathon 2025</p>
          <div className="mt-2 space-x-4">
            <a href="https://github.com" className="text-blue-400 hover:text-blue-300 hover:underline">GitHub</a>
            <a href="https://docs.somnia.network" className="text-blue-400 hover:text-blue-300 hover:underline">Docs</a>
            <a href={process.env.NEXT_PUBLIC_BACKEND_URL} className="text-blue-400 hover:text-blue-300 hover:underline">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
