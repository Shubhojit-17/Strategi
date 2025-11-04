'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDocuments } from '@/lib/hooks/useDocuments';
import AnimatedButton from '../ui/AnimatedButton';
import { DocumentSearch } from './DocumentSearch';
import { 
  Eye, 
  BrainElectricity, 
  Trash, 
  RefreshDouble, 
  UploadSquare, 
  Folder 
} from 'iconoir-react';

// Background particles component - same as upload page
const BackgroundParticles: React.FC = () => {
  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.05, 16, 16]}
          position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
          ]}
        >
          <meshStandardMaterial
            color={Math.random() > 0.5 ? '#3CF2FF' : '#82FFD2'}
            emissive={Math.random() > 0.5 ? '#3CF2FF' : '#82FFD2'}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </>
  );
};

// Document Card Component
interface DocumentCardProps {
  filename: string;
  ipfs_hash: string;
  timestamp: number;
  document_id: number;
  onView: (cid: string) => void;
  onExecute: (id: number) => void;
  onDelete: (id: number) => void;
  index: number;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  filename,
  ipfs_hash,
  timestamp,
  document_id,
  onView,
  onExecute,
  onDelete,
  index,
}) => {
  const coreGlow = '#3CF2FF';
  const plasmaAccent = '#82FFD2';
  const deepOcean = '#0F1423';
  const biolightPurple = '#A37CFF';

  // Get file extension
  const extension = filename.split('.').pop()?.toUpperCase() || 'FILE';
  
  // Format timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Truncate CID for display
  const truncateCID = (cid: string) => {
    if (cid.length <= 20) return cid;
    return `${cid.substring(0, 10)}...${cid.substring(cid.length - 10)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative group"
    >
      {/* Card container */}
      <div
        className="relative p-6 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${deepOcean}95, ${deepOcean}85)`,
          border: `1px solid ${coreGlow}30`,
          backdropFilter: 'blur(12px)',
          boxShadow: `0 4px 20px ${coreGlow}10`,
        }}
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${coreGlow}10, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header with file type badge */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: `${coreGlow}20`,
                border: `1px solid ${coreGlow}50`,
                color: coreGlow,
              }}
            >
              {extension}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onView(ipfs_hash)}
                className="p-2 rounded-lg"
                style={{
                  background: `${coreGlow}10`,
                  border: `1px solid ${coreGlow}30`,
                  color: coreGlow,
                }}
                title="View Document"
              >
                <Eye className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onExecute(document_id)}
                className="p-2 rounded-lg"
                style={{
                  background: `${plasmaAccent}10`,
                  border: `1px solid ${plasmaAccent}30`,
                  color: plasmaAccent,
                }}
                title="Execute AI"
              >
                <BrainElectricity className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (confirm(`Delete "${filename}"?`)) {
                    onDelete(document_id);
                  }
                }}
                className="p-2 rounded-lg"
                style={{
                  background: `#ef444410`,
                  border: `1px solid #ef444430`,
                  color: '#ef4444',
                }}
                title="Delete"
              >
                <Trash className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Filename */}
          <h3
            className="text-lg font-semibold mb-3 wrap-break-word"
            style={{
              color: coreGlow,
              textShadow: `0 0 10px ${coreGlow}40`,
            }}
          >
            {filename}
          </h3>

          {/* CID */}
          <div className="mb-3">
            <p className="text-xs mb-1" style={{ color: plasmaAccent, opacity: 0.7 }}>
              IPFS CID:
            </p>
            <p
              className="text-sm font-mono break-all"
              style={{ color: plasmaAccent }}
            >
              {ipfs_hash}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between text-xs" style={{ color: biolightPurple, opacity: 0.8 }}>
            <span>📅 {formatDate(timestamp)}</span>
            <span>ID: {document_id}</span>
          </div>
        </div>

        {/* Border glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            border: `1px solid ${coreGlow}50`,
            boxShadow: `0 0 20px ${coreGlow}30, inset 0 0 20px ${coreGlow}10`,
          }}
        />
      </div>
    </motion.div>
  );
};

export const DocumentsGateway: React.FC = () => {
  const router = useRouter();
  const {
    filteredDocuments,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    deleteDocument,
    refreshDocuments,
  } = useDocuments();

  const handleView = (cid: string) => {
    window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank');
  };

  const handleExecute = (id: number) => {
    const document = filteredDocuments.find(doc => doc.document_id === id);
    if (document) {
      router.push(`/execute?docId=${id}&cid=${document.ipfs_hash}&docName=${encodeURIComponent(document.filename)}`);
    } else {
      router.push(`/execute?docId=${id}`);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-background">
      {/* 3D Background - same as upload page */}
      <div className="fixed inset-0 pointer-events-none">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
          />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#3CF2FF" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#A37CFF" />

          <BackgroundParticles />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 overflow-y-auto h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 
                className="text-4xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(90deg, #3CF2FF, #82FFD2, #A37CFF)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px #3CF2FF40',
                }}
              >
                My Documents
              </h1>
              <p className="text-gray-400">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} stored on IPFS
              </p>
            </div>

            <div className="flex gap-4">
              <AnimatedButton onClick={refreshDocuments} variant="ghost">
                <RefreshDouble className="w-4 h-4 inline mr-1" /> Refresh
              </AnimatedButton>
              <AnimatedButton onClick={() => router.push('/upload')}>
                <UploadSquare className="w-4 h-4 inline mr-1" /> Upload New
              </AnimatedButton>
              <AnimatedButton onClick={() => router.push('/')} variant="ghost">
                ← Back Home
              </AnimatedButton>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-2xl">
            <DocumentSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by filename or CID..."
            />
          </div>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-red-300">
              ❌ {error}
            </p>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-96"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4"
                style={{
                  border: '3px solid #3CF2FF40',
                  borderTop: '3px solid #3CF2FF',
                  borderRadius: '50%',
                }}
              />
              <p className="text-gray-400">Loading documents...</p>
            </div>
          </motion.div>
        )}

        {/* Document Cards Grid */}
        {!isLoading && filteredDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8"
          >
            {filteredDocuments.map((doc, index) => (
              <DocumentCard
                key={doc.document_id}
                filename={doc.filename}
                ipfs_hash={doc.ipfs_hash}
                timestamp={doc.timestamp}
                document_id={doc.document_id}
                onView={handleView}
                onExecute={handleExecute}
                onDelete={deleteDocument}
                index={index}
              />
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-96"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6 text-cyan-400"
            >
              <Folder className="w-24 h-24" strokeWidth={1.5} />
            </motion.div>
            <h3 
              className="text-2xl font-semibold mb-2"
              style={{ color: '#3CF2FF' }}
            >
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'Upload your first document to get started'
              }
            </p>
            {!searchQuery && (
              <AnimatedButton onClick={() => router.push('/upload')}>
                Upload Document
              </AnimatedButton>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
