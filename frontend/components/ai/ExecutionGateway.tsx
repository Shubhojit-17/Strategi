'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExecutionBubble } from './ExecutionBubble';
import { ChatInterface } from './ChatInterface';
import { useAIExecution } from '@/lib/hooks/useAIExecution';
import AnimatedButton from '../ui/AnimatedButton';

// AI Models available
const AI_MODELS = [
  { id: 'gemini', name: 'Google Gemini', icon: '✨', description: 'Powerful & Accurate', free: true },
  { id: 'deepseek', name: 'DeepSeek R1', icon: '🔍', description: 'Deep Reasoning', free: true },
  { id: 'mistral', name: 'Mistral 7B', icon: '🌪️', description: 'Fast & Efficient', free: true },
  { id: 'moonshot', name: 'Kimi AI', icon: '🌙', description: 'Long Context', free: false },
];

export const ExecutionGateway: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('docId');
  const documentCid = searchParams.get('cid');
  const documentName = searchParams.get('docName');
  const [showModelSelector, setShowModelSelector] = useState(false);

  const { status, messages, isProcessing, selectedModel, sendMessage, clearMessages, setSelectedModel } =
    useAIExecution(documentCid || undefined);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Background with AI Bubble */}
      <div className="absolute inset-0 w-1/2">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.3} />

          {/* Execution Bubble */}
          <ExecutionBubble status={status} />
        </Canvas>
      </div>

      {/* Chat Interface */}
      <div className="absolute inset-y-0 right-0 w-1/2 p-8 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 bg-linear-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
                AI Execution
              </h1>
              <p className="text-gray-400 text-sm">
                Interact with your AI-powered document analysis
              </p>
            </div>

            <div className="flex gap-2">
              <AnimatedButton
                onClick={clearMessages}
                variant="ghost"
                disabled={messages.length === 0}
              >
                🗑️ Clear
              </AnimatedButton>
              <AnimatedButton onClick={() => router.push('/documents')} variant="ghost">
                ← Documents
              </AnimatedButton>
            </div>
          </div>

          {/* AI Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="w-full flex items-center justify-between px-4 py-3 glass-panel hover:border-primary-light/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentModel.icon}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{currentModel.name}</span>
                    {currentModel.free && (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{currentModel.description}</p>
                </div>
              </div>
              <span className="text-gray-400">{showModelSelector ? '▲' : '▼'}</span>
            </button>

            {/* Model Dropdown */}
            <AnimatePresence>
              {showModelSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-panel border-primary-light/30 z-50 max-h-80 overflow-y-auto"
                >
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelSelector(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-light/10 transition-all border-b border-gray-700/50 last:border-0 ${
                        model.id === selectedModel ? 'bg-primary-light/20' : ''
                      }`}
                    >
                      <span className="text-2xl">{model.icon}</span>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{model.name}</span>
                          {model.free && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{model.description}</p>
                      </div>
                      {model.id === selectedModel && (
                        <span className="text-primary-light">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            isProcessing={isProcessing}
            onSendMessage={sendMessage}
            documentName={documentName || undefined}
          />
        </div>
      </div>
    </div>
  );
};
