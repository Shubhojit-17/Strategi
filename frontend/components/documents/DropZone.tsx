'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = '.pdf,.doc,.docx,.txt,.md',
  maxFiles = 5,
  maxSize = 10,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>();

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; invalid: string[] } => {
      const valid: File[] = [];
      const invalid: string[] = [];

      // Check file count
      if (files.length > maxFiles) {
        invalid.push(`Maximum ${maxFiles} files allowed`);
        return { valid, invalid };
      }

      // Validate each file
      files.forEach((file) => {
        // Check file size
        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > maxSize) {
          invalid.push(`${file.name}: File too large (max ${maxSize}MB)`);
          return;
        }

        // Check file type
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!accept.includes(extension)) {
          invalid.push(`${file.name}: Invalid file type`);
          return;
        }

        valid.push(file);
      });

      return { valid, invalid };
    },
    [accept, maxFiles, maxSize]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const { valid, invalid } = validateFiles(files);

      if (invalid.length > 0) {
        setError(invalid.join(', '));
        setTimeout(() => setError(undefined), 5000);
        return;
      }

      if (valid.length > 0) {
        setError(undefined);
        onFilesSelected(valid);
      }
    },
    [disabled, validateFiles, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !e.target.files) return;

      const files = Array.from(e.target.files);
      const { valid, invalid } = validateFiles(files);

      if (invalid.length > 0) {
        setError(invalid.join(', '));
        setTimeout(() => setError(undefined), 5000);
        return;
      }

      if (valid.length > 0) {
        setError(undefined);
        onFilesSelected(valid);
      }

      // Reset input
      e.target.value = '';
    },
    [disabled, validateFiles, onFilesSelected]
  );

  return (
    <div className="relative w-full">
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#3CF2FF' : 'rgba(60, 242, 255, 0.3)',
        }}
        transition={{ duration: 0.2 }}
        className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <GlassPanel
          className={`p-12 text-center border-2 border-dashed transition-all ${
            isDragging ? 'border-primary-light bg-primary-dark/20' : 'border-primary-light/30'
          }`}
        >
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
            id="file-input"
          />

          <label
            htmlFor="file-input"
            className={`flex flex-col items-center gap-4 ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {/* Icon */}
            <motion.div
              animate={{
                y: isDragging ? -10 : 0,
                scale: isDragging ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="text-6xl"
            >
              📄
            </motion.div>

            {/* Text */}
            <div className="space-y-2">
              <p className="text-xl font-semibold text-primary-light">
                {isDragging ? 'Drop files here' : 'Drag & drop your documents'}
              </p>
              <p className="text-gray-400 text-sm">
                or click to browse files
              </p>
            </div>

            {/* File info */}
            <div className="flex gap-4 text-xs text-gray-500 mt-4">
              <span>Max {maxFiles} files</span>
              <span>•</span>
              <span>Up to {maxSize}MB each</span>
              <span>•</span>
              <span>PDF, DOC, TXT, MD</span>
            </div>
          </label>
        </GlassPanel>

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary-light/10 border-2 border-primary-light rounded-lg pointer-events-none flex items-center justify-center"
            >
              <div className="text-primary-light text-2xl font-bold">
                Drop to upload
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">⚠️ {error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
