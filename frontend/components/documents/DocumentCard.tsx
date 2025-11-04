'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import AnimatedButton from '../ui/AnimatedButton';
import { BookStack, Page, EditPencil, ClipboardCheck, FileNotFound, Eye, Trash } from 'iconoir-react';

interface DocumentCardProps {
  id: number;
  filename: string;
  cid: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
  gatewayUrl?: string;
  onView?: (cid: string) => void;
  onDelete?: (id: number) => void;
  onExecute?: (id: number) => void;
}

const getFileIcon = (filename: string): React.ComponentType<{ className?: string }> => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return BookStack;
  if (ext === 'doc' || ext === 'docx') return Page;
  if (ext === 'txt') return EditPencil;
  if (ext === 'md' || ext === 'markdown') return ClipboardCheck;
  return FileNotFound;
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  filename,
  cid,
  timestamp,
  txHash,
  blockNumber,
  gatewayUrl,
  onView,
  onDelete,
  onExecute,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Delete failed:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <GlassPanel className="p-6 h-full hover:border-primary-light/50 transition-all">
        {/* File Icon */}
        <div className="mb-4 text-center flex justify-center">
          <div className="text-cyan-400">
            {React.createElement(getFileIcon(filename), { className: 'w-12 h-12' })}
          </div>
        </div>

        {/* File Info */}
        <div className="space-y-2 mb-4">
          <h3 className="text-white font-semibold truncate" title={filename}>
            {filename}
          </h3>
          
          <div className="text-xs text-gray-400 space-y-1">
            <p className="font-mono truncate" title={cid}>
              CID: {cid.substring(0, 12)}...{cid.substring(cid.length - 4)}
            </p>
            <p title={`Block: ${blockNumber}`}>Block: {blockNumber}</p>
            <p>{formatDate(timestamp)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {onExecute && (
            <AnimatedButton
              onClick={() => onExecute(id)}
              className="w-full"
            >
              Execute with AI
            </AnimatedButton>
          )}

          <div className="flex gap-2">
            {onView && (
              <button
                onClick={() => onView(cid)}
                className="flex-1 py-2 px-3 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all border border-gray-700 hover:border-primary-light/50 flex items-center justify-center gap-1"
                title="View on IPFS"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            )}

            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 text-sm rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-all border border-red-900/50 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                title="Delete document"
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-lg bg-linear-to-br from-primary-light/0 via-accent/0 to-primary-light/0 hover:from-primary-light/10 hover:via-accent/10 hover:to-primary-light/10 transition-all pointer-events-none" />
      </GlassPanel>
    </motion.div>
  );
};
