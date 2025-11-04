'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UploadBubble } from '@/components/documents/UploadBubble';
import { FileCard } from '@/components/documents/FileCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { useUpload } from '@/lib/hooks/useUpload';

// Background particles component
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

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    files,
    overallStatus,
    overallProgress,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    retryFailed,
  } = useUpload();

  const allCompleted = files.length > 0 && files.every((f) => f.status === 'success');
  const hasErrors = files.some((f) => f.status === 'error');

  const handleNavigateToDocuments = () => {
    router.push('/documents');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* 3D Background - same as documents page */}
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

      {/* Main Upload Interface - Bubble always visible */}
      <div className="relative w-full h-full flex flex-col z-10">
        {/* Back to Home Button */}
        <motion.div
          className="absolute top-8 left-8 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedButton
            onClick={() => router.push('/')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </AnimatedButton>
        </motion.div>

        <motion.div
          className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Upload Bubble - always present */}
          <UploadBubble
            status={overallStatus}
            progress={overallProgress}
            onFilesSelected={addFiles}
            onDragStateChange={setIsDragging}
            files={files}
            onRemoveFile={removeFile}
          />

          {/* Action Buttons - shown below bubble when files exist */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              {overallStatus === 'idle' && (
                <>
                  <AnimatedButton onClick={uploadFiles} className="px-8">
                    Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                  </AnimatedButton>
                  <AnimatedButton onClick={clearFiles} variant="ghost" className="px-8">
                    Clear All
                  </AnimatedButton>
                </>
              )}

              {overallStatus === 'uploading' && (
                <div className="flex items-center gap-3" style={{ color: '#82FFD2' }}>
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#82FFD2' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-sm font-medium">Uploading to IPFS network...</span>
                </div>
              )}

              {allCompleted && (
                <>
                  <AnimatedButton onClick={handleNavigateToDocuments} className="px-8">
                    View Documents
                  </AnimatedButton>
                  <AnimatedButton onClick={clearFiles} variant="ghost" className="px-8">
                    Upload More
                  </AnimatedButton>
                </>
              )}

              {hasErrors && overallStatus !== 'uploading' && (
                <>
                  <AnimatedButton onClick={retryFailed} className="px-8">
                    Retry Failed
                  </AnimatedButton>
                  <AnimatedButton onClick={clearFiles} variant="ghost" className="px-8">
                    Clear All
                  </AnimatedButton>
                </>
              )}
            </motion.div>
          )}

          {/* Status Message */}
          <AnimatePresence>
            {overallStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="px-6 py-3 rounded-xl"
                style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)',
                }}
              >
                <p className="text-sm text-green-300 text-center font-medium">
                  ✓ All files uploaded successfully to IPFS!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
}
