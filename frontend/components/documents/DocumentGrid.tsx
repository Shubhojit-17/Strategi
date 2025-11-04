'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentCard } from './DocumentCard';
import GlassPanel from '../ui/GlassPanel';
import { Skeleton } from '../ui/Loading';

interface Document {
  document_id: number;
  filename: string;
  ipfs_hash: string;
  document_hash: string;
  user_address: string;
  token_id: number;
  timestamp: number;
  tx_hash: string;
  block_number: number;
  gateway_url?: string;
}

interface DocumentGridProps {
  documents: Document[];
  isLoading?: boolean;
  onView?: (ipfs_hash: string) => void;
  onDelete?: (id: number) => void;
  onExecute?: (id: number) => void;
}

// Skeleton loader for documents using centralized Skeleton component
const DocumentSkeleton: React.FC = () => (
  <GlassPanel className="p-6 h-full">
    <div className="space-y-4">
      <Skeleton variant="circle" className="h-12 w-12 mx-auto" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-3 w-full" />
        <Skeleton variant="text" className="h-3 w-1/2" />
        <Skeleton variant="text" className="h-3 w-1/3" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton variant="rect" className="h-8 flex-1" />
          <Skeleton variant="rect" className="h-8 flex-1" />
        </div>
      </div>
    </div>
  </GlassPanel>
);

// Empty state
const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full"
  >
    <GlassPanel className="p-12 text-center">
      <div className="text-6xl mb-4">📂</div>
      <h3 className="text-2xl font-bold mb-2 text-white">No documents yet</h3>
      <p className="text-gray-400 mb-6">
        Upload your first document to get started with AI-powered analysis
      </p>
      <a
        href="/upload"
        className="inline-block py-3 px-6 rounded-lg bg-linear-to-r from-primary-light to-accent text-white font-semibold hover:scale-105 transition-transform"
      >
        Upload Document
      </a>
    </GlassPanel>
  </motion.div>
);

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  isLoading = false,
  onView,
  onDelete,
  onExecute,
}) => {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <DocumentSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (documents.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  // Show documents grid
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {documents.map((doc, index) => (
          <motion.div
            key={doc.document_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
          >
            <DocumentCard
              id={doc.document_id}
              filename={doc.filename}
              cid={doc.ipfs_hash}
              timestamp={doc.timestamp}
              txHash={doc.tx_hash}
              blockNumber={doc.block_number}
              gatewayUrl={doc.gateway_url}
              onView={onView}
              onDelete={onDelete}
              onExecute={onExecute}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
