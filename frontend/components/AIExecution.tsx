'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function AIExecution() {
  const { address, isConnected } = useAccount();
  const [nftTokenId, setNftTokenId] = useState('');
  const [documentCid, setDocumentCid] = useState('');
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('mistral');
  const [model, setModel] = useState('mistralai/mistral-7b-instruct:free');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Model options based on provider
  const modelOptions = {
    gemini: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Fast, Free)' },
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Latest)' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Best Quality)' },
    ],
    moonshot: [
      { value: 'moonshot-v1-8k', label: 'Moonshot v1 8K' },
      { value: 'moonshot-v1-32k', label: 'Moonshot v1 32K' },
      { value: 'moonshot-v1-128k', label: 'Moonshot v1 128K' },
    ],
    deepseek: [
      { value: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 (Free, Reasoning)' },
      { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat (Conversational)' },
    ],
    mistral: [
      { value: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B Instruct (Free)' },
      { value: 'mistralai/mistral-7b-instruct', label: 'Mistral 7B Instruct (Standard)' },
    ],
  };

  // Update model when provider changes
  useEffect(() => {
    if (provider === 'gemini') {
      setModel('gemini-2.0-flash');
    } else if (provider === 'moonshot') {
      setModel('moonshot-v1-8k');
    } else if (provider === 'deepseek') {
      setModel('deepseek/deepseek-r1:free');
    } else if (provider === 'mistral') {
      setModel('mistralai/mistral-7b-instruct:free');
    }
  }, [provider]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  const handleExecute = async () => {
    if (!nftTokenId || !documentCid || !prompt) {
      alert('Please enter NFT token ID, document CID, and prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      console.log('Backend URL:', backendUrl);
      console.log('Full URL:', `${backendUrl}/execute`);
      
      const response = await fetch(`${backendUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nft_token_id: parseInt(nftTokenId),
          user_address: address,
          document_cid: documentCid,
          prompt: prompt,
          provider: provider,
          model: model,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <p className="text-gray-300">Connect your wallet to run AI agents</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Execute AI Agent</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">
            NFT Token ID
          </label>
          <input
            type="number"
            value={nftTokenId}
            onChange={(e) => setNftTokenId(e.target.value)}
            placeholder="1"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">Your Access NFT token ID (authentication)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">
            Document CID
          </label>
          <input
            type="text"
            value={documentCid}
            onChange={(e) => setDocumentCid(e.target.value)}
            placeholder="QmcTxJrFVzezkn4cpEuwG9PN4SEcE6SMFZZi4pX0XWvspV"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400 font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">IPFS CID from your uploaded document</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Summarize this document..."
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
            >
              <option value="mistral">Mistral 7B (Free)</option>
              <option value="deepseek">DeepSeek R1 (Free)</option>
              <option value="gemini">Google Gemini (Free)</option>
              <option value="moonshot">Moonshot AI (Kimi)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
            >
              {modelOptions[provider as keyof typeof modelOptions].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-300">
            <strong>Selected:</strong> {provider === 'gemini' ? 'Google Gemini' : provider === 'deepseek' ? 'DeepSeek R1' : 'Moonshot Kimi'} - {model}
          </p>
        </div>

        <button
          onClick={handleExecute}
          disabled={loading}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-600 disabled:text-gray-400 font-medium"
        >
          {loading ? 'Executing...' : 'Run AI Agent'}
        </button>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">❌ Error: {error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200 font-medium mb-2">✅ Execution Complete!</p>
              <p className="text-sm text-gray-300">Record ID: {result.record_id}</p>
              <p className="text-sm text-gray-300">Output CID: {result.output_cid}</p>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${result.output_cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
              >
                View on IPFS →
              </a>
            </div>

            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">AI Response:</h3>
              <p className="text-gray-200 whitespace-pre-wrap">{result.output_text}</p>
            </div>

            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">Verification:</h3>
              <p className="text-sm text-gray-300">Execution Root: {result.execution_root}</p>
              <p className="text-sm text-gray-300">Trace CID: {result.trace_cid}</p>
              <a
                href={`https://explorer.somnia.network/tx/${result.tx_hash.replace(/^0x/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
              >
                View transaction →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
