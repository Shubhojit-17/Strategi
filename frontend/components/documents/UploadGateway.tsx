'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UploadBubble } from './UploadBubble';
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
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* Central Bioluminescent Upload Bubble */}
      {files.length === 0 ? (
        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <UploadBubble
            status={overallStatus}
            progress={overallProgress}
            onFilesSelected={addFiles}
          />
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#3CF2FF] via-[#82FFD2] to-[#3CF2FF] bg-clip-text text-transparent">
              Uploading Files
            </h1>
            <p className="text-gray-400">
              {files.length} {files.length === 1 ? 'file' : 'files'} ready for upload
            </p>
          </motion.div>

          {/* File List */}
          <div className="w-full max-w-2xl space-y-4 mb-8 max-h-96 overflow-y-auto">
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
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mt-8"
          >
            {overallStatus === 'idle' && (
              <>
                <AnimatedButton
                  onClick={uploadFiles}
                  className="px-8"
                >
                  Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                </AnimatedButton>
                <AnimatedButton
                  onClick={clearFiles}
                  variant="ghost"
                  className="px-8"
                >
                  Clear All
                </AnimatedButton>
              </>
            )}

            {overallStatus === 'uploading' && (
              <div className="text-center py-4 px-8 rounded-lg border border-[#3CF2FF]/50 bg-[#3CF2FF]/5">
                <p className="text-[#82FFD2] font-semibold">
                  Uploading... {Math.round(overallProgress)}%
                </p>
              </div>
            )}

            {allCompleted && (
              <>
                <AnimatedButton
                  onClick={handleNavigateToDocuments}
                  className="px-8"
                >
                  View Documents
                </AnimatedButton>
                <AnimatedButton
                  onClick={clearFiles}
                  variant="ghost"
                  className="px-8"
                >
                  Upload More
                </AnimatedButton>
              </>
            )}

            {hasErrors && overallStatus !== 'uploading' && (
              <>
                <AnimatedButton
                  onClick={retryFailed}
                  className="px-8"
                >
                  Retry Failed
                </AnimatedButton>
                <AnimatedButton
                  onClick={clearFiles}
                  variant="ghost"
                  className="px-8"
                >
                  Clear All
                </AnimatedButton>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Bottom status bar */}
      <motion.div
        className="border-t border-[#3CF2FF]/20 bg-[#0F1423]/50 backdrop-blur p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {overallStatus === 'idle' && files.length === 0 && (
          <p className="text-sm text-gray-400">
            Drag and drop documents, or click the bubble to browse
          </p>
        )}
        {overallStatus === 'uploading' && (
          <p className="text-sm text-[#82FFD2]">
            Uploading to IPFS... {Math.round(overallProgress)}% complete
          </p>
        )}
        {allCompleted && (
          <p className="text-sm text-green-400">
            All files uploaded successfully to IPFS!
          </p>
        )}
        {hasErrors && overallStatus !== 'uploading' && (
          <p className="text-sm text-red-400">
            Some files failed. Please review and retry.
          </p>
        )}
      </motion.div>
    </div>
  );
};
