'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UploadBubble } from './UploadBubble';
import { DropZone } from './DropZone';
import { FileCard } from './FileCard';
import AnimatedButton from '../ui/AnimatedButton';
import { useUpload } from '@/lib/hooks/useUpload';

export const UploadGateway: React.FC = () => {
  const router = useRouter();
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
      {/* 3D Background */}
      <div className="absolute inset-0">
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

          {/* Upload Bubble */}
          <UploadBubble status={overallStatus} progress={overallProgress} />

          {/* Background particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
              ]}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                color={0x8b5cf6}
                emissive={0x8b5cf6}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 h-full flex">
        {/* Left side: Upload interface */}
        <div className="w-1/2 h-full flex flex-col p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-primary-light via-accent to-primary-light bg-clip-text text-transparent">
              Upload Documents
            </h1>
            <p className="text-gray-400">
              Upload your documents to IPFS for secure, decentralized storage
            </p>
          </motion.div>

          {/* Drop Zone */}
          {files.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <DropZone onFilesSelected={addFiles} />
            </motion.div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              <AnimatePresence>
                {files.map((fileState, index) => (
                  <FileCard
                    key={index}
                    file={fileState.file}
                    progress={fileState.progress}
                    status={fileState.status}
                    error={fileState.error}
                    cid={fileState.cid}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </AnimatePresence>

              {/* Add more files */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <DropZone
                  onFilesSelected={addFiles}
                  disabled={overallStatus === 'uploading'}
                />
              </motion.div>
            </div>
          )}

          {/* Action Buttons */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              {overallStatus === 'idle' && (
                <>
                  <AnimatedButton
                    onClick={uploadFiles}
                    className="flex-1"
                  >
                    Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={clearFiles}
                    variant="ghost"
                  >
                    Clear All
                  </AnimatedButton>
                </>
              )}

              {overallStatus === 'uploading' && (
                <div className="flex-1 text-center py-3 px-6 rounded-lg bg-blue-900/20 border border-blue-500/50">
                  <p className="text-blue-300">
                    Uploading... {Math.round(overallProgress)}%
                  </p>
                </div>
              )}

              {allCompleted && (
                <>
                  <AnimatedButton
                    onClick={handleNavigateToDocuments}
                    className="flex-1"
                  >
                    View Documents
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={clearFiles}
                    variant="ghost"
                  >
                    Upload More
                  </AnimatedButton>
                </>
              )}

              {hasErrors && overallStatus !== 'uploading' && (
                <>
                  <AnimatedButton
                    onClick={retryFailed}
                    className="flex-1"
                  >
                    Retry Failed
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={clearFiles}
                    variant="ghost"
                  >
                    Clear All
                  </AnimatedButton>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Right side: Status & Info */}
        <div className="w-1/2 h-full flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            {overallStatus === 'idle' && files.length === 0 && (
              <>
                <p className="text-6xl mb-4">📤</p>
                <h2 className="text-2xl font-bold mb-2 text-white">
                  Ready to Upload
                </h2>
                <p className="text-gray-400 max-w-md">
                  Drag and drop your documents or click to browse. Your files will be securely stored on IPFS.
                </p>
              </>
            )}

            {overallStatus === 'idle' && files.length > 0 && (
              <>
                <p className="text-6xl mb-4">📋</p>
                <h2 className="text-2xl font-bold mb-2 text-white">
                  {files.length} {files.length === 1 ? 'File' : 'Files'} Selected
                </h2>
                <p className="text-gray-400 max-w-md">
                  Review your files and click Upload when ready
                </p>
              </>
            )}

            {overallStatus === 'uploading' && (
              <>
                <p className="text-6xl mb-4 animate-bounce">⏳</p>
                <h2 className="text-2xl font-bold mb-2 text-blue-300">
                  Uploading to IPFS...
                </h2>
                <p className="text-gray-400 max-w-md mb-4">
                  Please wait while your files are being uploaded
                </p>
                <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                  <motion.div
                    className="h-full bg-linear-to-r from-blue-500 to-primary-light"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {Math.round(overallProgress)}% complete
                </p>
              </>
            )}

            {allCompleted && (
              <>
                <p className="text-6xl mb-4">✅</p>
                <h2 className="text-2xl font-bold mb-2 text-green-300">
                  Upload Complete!
                </h2>
                <p className="text-gray-400 max-w-md">
                  All files have been successfully uploaded to IPFS
                </p>
              </>
            )}

            {hasErrors && overallStatus !== 'uploading' && (
              <>
                <p className="text-6xl mb-4">⚠️</p>
                <h2 className="text-2xl font-bold mb-2 text-red-300">
                  Upload Issues
                </h2>
                <p className="text-gray-400 max-w-md">
                  Some files failed to upload. Please review and retry.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
