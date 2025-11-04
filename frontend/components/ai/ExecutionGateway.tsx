'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExecutionBubble } from './ExecutionBubble';
import { ChatInterface } from './ChatInterface';
import { useAIExecution } from '@/lib/hooks/useAIExecution';
import { useAppStore } from '@/lib/store/appStore';
import AnimatedButton from '../ui/AnimatedButton';
import { 
  Sparks, 
  Search, 
  Wind, 
  HalfMoon,
  Trash,
  UploadSquare,
  Page,
  Check
} from 'iconoir-react';

// AI Models available
const AI_MODELS = [
  { id: 'gemini', name: 'Google Gemini', icon: Sparks, description: 'Powerful & Accurate', free: true },
  { id: 'deepseek', name: 'DeepSeek R1', icon: Search, description: 'Deep Reasoning', free: true },
  { id: 'mistral', name: 'Mistral 7B', icon: Wind, description: 'Fast & Efficient', free: true },
  { id: 'moonshot', name: 'Kimi AI', icon: HalfMoon, description: 'Long Context', free: false },
];

export const ExecutionGateway: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('docId');
  const documentCid = searchParams.get('cid');
  const documentName = searchParams.get('docName');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocumentCid, setSelectedDocumentCid] = useState<string | undefined>(documentCid || undefined);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const documents = useAppStore((state) => state.documents);
  const setDocuments = useAppStore((state) => state.setDocuments);

  const { status, messages, isProcessing, selectedModel, sendMessage, clearMessages, setSelectedModel } =
    useAIExecution(selectedDocumentCid);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];
  const selectedDocument = documents.find(d => d.ipfs_hash === selectedDocumentCid);

  // Load documents when component mounts
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoadingDocs(true);
      try {
        const userAddress = localStorage.getItem('wallet_address');
        if (!userAddress) {
          console.error('No wallet address found');
          setIsLoadingDocs(false);
          return;
        }

        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `http://localhost:8000/documents/list?user_address=${userAddress}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const data = await response.json();
        // Backend returns { documents: [...], count: number }
        setDocuments(data.documents || data);
        console.log('📄 Loaded documents:', data.documents?.length || 0);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchDocuments();
  }, [setDocuments]);

  const handleDocumentSelect = (ipfsHash: string) => {
    setSelectedDocumentCid(ipfsHash);
    setShowDocumentSelector(false);
    // Clear messages when switching documents
    clearMessages();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Background with AI Bubble */}
      <div className="absolute inset-0 w-1/2">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
          />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#3CF2FF" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#A37CFF" />

          {/* Background Particles - same as upload page */}
          {Array.from({ length: 40 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
              ]}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                color={Math.random() > 0.5 ? '#3CF2FF' : '#82FFD2'}
                emissive={Math.random() > 0.5 ? '#3CF2FF' : '#82FFD2'}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}

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
            <div className="flex items-center gap-3">
              <AnimatedButton onClick={() => router.push('/')} variant="ghost">
                ← Back
              </AnimatedButton>
              <div>
                <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
                  AI Execution
                </h1>
                <p className="text-gray-400 text-sm">
                  Interact with your AI-powered document analysis
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <AnimatedButton
                onClick={clearMessages}
                variant="ghost"
                disabled={messages.length === 0}
              >
                <Trash className="w-4 h-4 inline mr-1" /> Clear
              </AnimatedButton>
              <AnimatedButton 
                onClick={() => router.push('/upload')} 
                variant="primary"
              >
                <UploadSquare className="w-4 h-4 inline mr-1" /> Upload New
              </AnimatedButton>
            </div>
          </div>

          {/* Document Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDocumentSelector(!showDocumentSelector)}
              className="w-full flex items-center justify-between px-4 py-3 glass-panel hover:border-primary-light/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="text-cyan-400">
                  <Page className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">
                      {isLoadingDocs 
                        ? 'Loading documents...'
                        : selectedDocument 
                          ? selectedDocument.filename 
                          : 'Select Document'
                      }
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {isLoadingDocs
                      ? 'Please wait...'
                      : selectedDocument 
                        ? `${(selectedDocument.file_size || 0 / 1024).toFixed(2)} KB` 
                        : documents.length > 0 
                          ? `${documents.length} document${documents.length > 1 ? 's' : ''} available`
                          : 'No documents uploaded'
                    }
                  </p>
                </div>
              </div>
              <span className="text-gray-400">{showDocumentSelector ? '▲' : '▼'}</span>
            </button>

            {/* Document Dropdown */}
            <AnimatePresence>
              {showDocumentSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-panel border-primary-light/30 z-50 max-h-80 overflow-y-auto"
                >
                  {isLoadingDocs ? (
                    <div className="px-4 py-6 text-center text-gray-400">
                      <div className="animate-spin text-3xl mb-2">⏳</div>
                      <p>Loading documents...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400">
                      <p className="mb-2">No documents uploaded yet</p>
                      <button
                        onClick={() => router.push('/upload')}
                        className="text-primary-light hover:text-primary-light/80 underline"
                      >
                        Upload a document
                      </button>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <button
                        key={doc.document_id}
                        onClick={() => handleDocumentSelect(doc.ipfs_hash)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-light/10 transition-all border-b border-gray-700/50 last:border-0 ${
                          doc.ipfs_hash === selectedDocumentCid ? 'bg-primary-light/20' : ''
                        }`}
                      >
                        <div className="text-cyan-400">
                          <Page className="w-6 h-6" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{doc.filename}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {(doc.file_size || 0 / 1024).toFixed(2)} KB • {new Date(doc.timestamp * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        {doc.ipfs_hash === selectedDocumentCid && (
                          <Check className="w-5 h-5 text-primary-light" />
                        )}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="w-full flex items-center justify-between px-4 py-3 glass-panel hover:border-primary-light/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="text-cyan-400">
                  <currentModel.icon className="w-6 h-6" />
                </div>
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
                      <div className="text-cyan-400">
                        <model.icon className="w-6 h-6" />
                      </div>
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
                        <Check className="w-5 h-5 text-primary-light" />
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
            documentName={selectedDocument?.filename || documentName || undefined}
          />
        </div>
      </div>
    </div>
  );
};
