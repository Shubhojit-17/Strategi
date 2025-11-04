'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DocumentGrid } from './DocumentGrid';
import { DocumentSearch } from './DocumentSearch';
import { DocumentFilters } from './DocumentFilters';
import { useDocuments } from '@/lib/hooks/useDocuments';
import AnimatedButton from '../ui/AnimatedButton';

// Background particles component
const BackgroundParticles: React.FC = () => {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
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
            color={Math.random() > 0.5 ? 0x8b5cf6 : 0x06b6d4}
            emissive={Math.random() > 0.5 ? 0x8b5cf6 : 0x06b6d4}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </>
  );
};

export const DocumentsGateway: React.FC = () => {
  const router = useRouter();
  const {
    filteredDocuments,
    isLoading,
    error,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    deleteDocument,
    refreshDocuments,
  } = useDocuments();

  const handleView = (cid: string) => {
    // Open IPFS gateway in new tab
    window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank');
  };

  const handleExecute = (id: number) => {
    // Find document to get its CID and filename
    const document = filteredDocuments.find(doc => doc.document_id === id);
    if (document) {
      // Navigate to AI execution page with document ID, CID, and filename
      router.push(`/execute?docId=${id}&cid=${document.ipfs_hash}&docName=${encodeURIComponent(document.filename)}`);
    } else {
      router.push(`/execute?docId=${id}`);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-auto bg-background">
      {/* 3D Background */}
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
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <BackgroundParticles />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
                My Documents
              </h1>
              <p className="text-gray-400">
                Manage your uploaded documents and execute AI workflows
              </p>
            </div>

            <div className="flex gap-4">
              <AnimatedButton onClick={refreshDocuments} variant="ghost">
                🔄 Refresh
              </AnimatedButton>
              <AnimatedButton onClick={() => router.push('/upload')}>
                ⬆️ Upload New
              </AnimatedButton>
            </div>
          </div>

          {/* Search */}
          <DocumentSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by filename or CID..."
          />
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-300">
              ❌ {error}
            </p>
          </motion.div>
        )}

        {/* Main content */}
        <div className="flex gap-8">
          {/* Filters sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-64 shrink-0"
          >
            <DocumentFilters
              filters={filters}
              onFilterChange={setFilters}
              documentCount={filteredDocuments.length}
            />
          </motion.div>

          {/* Documents grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <DocumentGrid
              documents={filteredDocuments}
              isLoading={isLoading}
              onView={handleView}
              onDelete={deleteDocument}
              onExecute={handleExecute}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
