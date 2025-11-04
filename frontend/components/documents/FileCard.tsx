'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import { ProgressBar } from '../ui/Loading';

interface FileCardProps {
  file: File;
  progress?: number; // 0-100
  status?: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  cid?: string;
  onRemove?: () => void;
}

const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return '📕';
    case 'doc':
    case 'docx':
      return '📘';
    case 'txt':
      return '📝';
    case 'md':
      return '📄';
    default:
      return '📄';
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const FileCard: React.FC<FileCardProps> = ({
  file,
  progress = 0,
  status = 'pending',
  error,
  cid,
  onRemove,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'border-blue-500/50 bg-blue-900/10';
      case 'success':
        return 'border-green-500/50 bg-green-900/10';
      case 'error':
        return 'border-red-500/50 bg-red-900/10';
      default:
        return 'border-primary-light/30';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <GlassPanel className={`p-4 border ${getStatusColor()} transition-all`}>
        <div className="flex items-start gap-4">
          {/* File icon */}
          <div className="text-4xl shrink-0">
            {getFileIcon(file.name)}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {file.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Status icon */}
              {getStatusIcon() && (
                <div className="text-2xl shrink-0">
                  {getStatusIcon()}
                </div>
              )}
            </div>

            {/* Progress bar for uploading */}
            {status === 'uploading' && (
              <div className="space-y-1">
                <p className="text-xs text-gray-400 mb-1">Uploading...</p>
                <ProgressBar progress={progress} />
              </div>
            )}

            {/* Success message with CID */}
            {status === 'success' && cid && (
              <div className="space-y-1">
                <p className="text-xs text-green-400 font-medium">
                  Upload complete!
                </p>
                <p className="text-xs text-gray-400 font-mono truncate">
                  CID: {cid.substring(0, 20)}...
                </p>
              </div>
            )}

            {/* Error message */}
            {status === 'error' && error && (
              <div className="bg-red-900/20 rounded px-2 py-1 mt-1">
                <p className="text-xs text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* Pending state */}
            {status === 'pending' && (
              <p className="text-xs text-gray-500">
                Ready to upload
              </p>
            )}
          </div>

          {/* Remove button */}
          {onRemove && (status === 'pending' || status === 'error') && (
            <button
              onClick={onRemove}
              className="shrink-0 text-gray-400 hover:text-red-400 transition-colors p-2"
              title="Remove file"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  );
};
