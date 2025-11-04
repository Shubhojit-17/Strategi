'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Page } from 'iconoir-react';

interface FilePillProps {
  fileName: string;
  fileSize: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  onRemove?: () => void;
}

export const FilePill: React.FC<FilePillProps> = ({
  fileName,
  fileSize,
  status,
  progress = 0,
  onRemove,
}) => {
  const coreGlow = '#3CF2FF';
  const plasmaAccent = '#82FFD2';
  const biolightPurple = '#A37CFF';

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return plasmaAccent;
      case 'success':
        return '#34d399';
      case 'error':
        return '#ef4444';
      default:
        return coreGlow;
    }
  };

  const statusColor = getStatusColor();
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative"
      style={{
        width: 'fit-content',
        maxWidth: '280px',
        height: '50px',
        borderRadius: '24px',
        background: `linear-gradient(135deg, ${statusColor}15, ${biolightPurple}10)`,
        border: `1px solid ${statusColor}60`,
        boxShadow: `0 0 20px ${statusColor}40, inset 0 1px 10px ${coreGlow}20`,
        backdropFilter: 'blur(8px)',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* File icon */}
      <div className="text-cyan-400">
        <Page className="w-6 h-6" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            color: statusColor,
            textShadow: `0 0 8px ${statusColor}60`,
          }}
        >
          {fileName}
        </p>
        <div className="flex items-center gap-2">
          <p
            className="text-xs opacity-70"
            style={{ color: plasmaAccent }}
          >
            {formatSize(fileSize)}
          </p>
          {status === 'uploading' && (
            <p
              className="text-xs font-medium"
              style={{ color: statusColor }}
            >
              {Math.round(progress)}%
            </p>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {status === 'uploading' && (
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: statusColor }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        {status === 'success' && (
          <div
            className="text-lg"
            style={{
              color: statusColor,
              filter: `drop-shadow(0 0 6px ${statusColor})`,
            }}
          >
            ✓
          </div>
        )}
        {status === 'error' && (
          <div
            className="text-lg"
            style={{
              color: statusColor,
              filter: `drop-shadow(0 0 6px ${statusColor})`,
            }}
          >
            ✕
          </div>
        )}
        {onRemove && status !== 'uploading' && (
          <button
            onClick={onRemove}
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-50 hover:opacity-100 transition-opacity"
            style={{
              background: `${statusColor}20`,
              color: statusColor,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Progress bar */}
      {status === 'uploading' && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${statusColor}, ${plasmaAccent})`,
            boxShadow: `0 0 8px ${statusColor}`,
            width: `${progress}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};
