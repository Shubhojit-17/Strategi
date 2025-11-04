'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import { Page, WarningTriangle } from 'iconoir-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = '.pdf,.doc,.docx,.txt,.md',
  maxFiles = 5,
  maxSize = 10,
  disabled = false,
  onDragEnter,
  onDragLeave,
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
        onDragEnter?.();
      }
    },
    [disabled, onDragEnter]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onDragLeave?.();
  }, [onDragLeave]);

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
    <div className="relative w-full h-full">
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full h-full flex items-center justify-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
          className={`flex flex-col items-center gap-3 ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {/* Icon */}
          <motion.div
            animate={{
              y: isDragging ? -8 : 0,
              scale: isDragging ? 1.15 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="text-cyan-400"
          >
            <Page className="w-16 h-16" strokeWidth={1.5} />
          </motion.div>

          {/* Text */}
          <div className="space-y-1 text-center">
            <p className="text-lg font-medium" style={{ color: '#3CF2FF' }}>
              {isDragging ? 'Drop files here' : 'Drop files'}
            </p>
            <p className="text-xs opacity-70" style={{ color: '#82FFD2' }}>
              or click to browse
            </p>
          </div>
        </label>
      </motion.div>

      {/* Error message - positioned absolutely */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-64"
          >
            <div className="bg-red-900/40 border border-red-500/60 rounded-lg p-2 backdrop-blur-sm flex items-center justify-center gap-2">
              <WarningTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-300 text-xs text-center">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
