'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, BrainElectricity, Trash } from 'iconoir-react';

interface FloatingDocumentPillProps {
  filename: string;
  ipfs_hash: string;
  timestamp: number;
  document_id: number;
  fileType?: string;
  onView: (cid: string) => void;
  onExecute: (id: number) => void;
  onDelete: (id: number) => void;
  delay?: number;
}

export const FloatingDocumentPill: React.FC<FloatingDocumentPillProps> = ({
  filename,
  ipfs_hash,
  timestamp,
  document_id,
  fileType,
  onView,
  onExecute,
  onDelete,
  delay = 0,
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get color based on file type
  const getFileTypeColor = () => {
    const ext = extension.toLowerCase();
    if (['pdf'].includes(ext)) return coreGlow;
    if (['doc', 'docx', 'txt'].includes(ext)) return plasmaAccent;
    if (['jpg', 'png', 'gif', 'svg'].includes(ext)) return biolightPurple;
    return coreGlow;
  };

  const fileColor = getFileTypeColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.06, 
        rotateZ: 2,
        transition: { duration: 0.3 }
      }}
      className="relative group cursor-pointer"
      style={{ minWidth: '280px', maxWidth: '320px' }}
    >
      {/* Outer glow layer */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            `0 0 20px ${fileColor}40, 0 0 40px ${fileColor}20`,
            `0 0 30px ${fileColor}60, 0 0 50px ${fileColor}30`,
            `0 0 20px ${fileColor}40, 0 0 40px ${fileColor}20`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Glass capsule body */}
      <motion.div
        className="relative rounded-full px-6 py-4 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${deepOcean}95, ${deepOcean}85)`,
          border: `1px solid ${fileColor}40`,
          backdropFilter: 'blur(12px)',
        }}
        whileHover={{
          boxShadow: `0 0 40px ${fileColor}60, 0 0 60px ${fileColor}30, inset 0 0 20px ${biolightPurple}20`,
          border: `1px solid ${fileColor}70`,
        }}
      >
        {/* Inner bloom effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${plasmaAccent}30, transparent 70%)`,
          }}
        />

        {/* Animated gradient shine */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-30"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `linear-gradient(90deg, transparent, ${fileColor}60, transparent)`,
            backgroundSize: '200% 100%',
          }}
        />

        {/* Content */}
        <div className="relative flex items-center justify-between gap-4">
          {/* File type badge */}
          <div
            className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: `radial-gradient(circle, ${fileColor}30, ${fileColor}10)`,
              border: `1px solid ${fileColor}50`,
              boxShadow: `0 0 12px ${fileColor}40`,
              color: fileColor,
            }}
          >
            {extension.slice(0, 3)}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold truncate mb-1"
              style={{
                color: fileColor,
                textShadow: `0 0 8px ${fileColor}60`,
              }}
            >
              {filename}
            </h3>
            <p className="text-xs opacity-60" style={{ color: plasmaAccent }}>
              {formatDate(timestamp)}
            </p>
          </div>

          {/* Action buttons - shown on hover */}
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onView(ipfs_hash);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
              style={{
                background: `${coreGlow}20`,
                border: `1px solid ${coreGlow}50`,
                color: coreGlow,
              }}
              title="View"
            >
              <Eye className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onExecute(document_id);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
              style={{
                background: `${plasmaAccent}20`,
                border: `1px solid ${plasmaAccent}50`,
                color: plasmaAccent,
              }}
              title="Execute AI"
            >
              <BrainElectricity className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${filename}"?`)) {
                  onDelete(document_id);
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
              style={{
                background: `#ef444420`,
                border: `1px solid #ef444450`,
                color: '#ef4444',
              }}
              title="Delete"
            >
              <Trash className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Particle effects on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: fileColor,
              boxShadow: `0 0 4px ${fileColor}`,
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos((i / 8) * Math.PI * 2) * 60,
              y: Math.sin((i / 8) * Math.PI * 2) * 60,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
