'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FloatingDocumentPill } from './FloatingDocumentPill';

interface Document {
  document_id: number;
  filename: string;
  ipfs_hash: string;
  timestamp: number;
}

interface DocumentRibbonProps {
  documents: Document[];
  ribbonIndex: number;
  direction?: 'left' | 'right';
  speed?: number;
  onView: (cid: string) => void;
  onExecute: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DocumentRibbon: React.FC<DocumentRibbonProps> = ({
  documents,
  ribbonIndex,
  direction = 'left',
  speed = 30,
  onView,
  onExecute,
  onDelete,
}) => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate blur based on ribbon depth
  const blurAmount = Math.abs(ribbonIndex - 2) * 0.5; // Center ribbon (index 2) has no blur
  const scale = 1 - Math.abs(ribbonIndex - 2) * 0.05; // Center ribbon slightly larger

  // Vertical oscillation animation
  const oscillationY = Math.sin(ribbonIndex * 1.2) * 15;

  useEffect(() => {
    if (!containerRef.current || documents.length === 0) return;

    // Calculate total width of all documents
    const scrollWidth = documents.length * 340; // Approximate pill width + gap
    const viewportWidth = containerRef.current.offsetWidth;

    // Only animate if content overflows
    if (scrollWidth > viewportWidth) {
      const distance = scrollWidth + viewportWidth;
      const duration = distance / speed;

      controls.start({
        x: direction === 'left' ? [-viewportWidth, -scrollWidth] : [0, viewportWidth],
        transition: {
          duration,
          repeat: Infinity,
          ease: 'linear',
        },
      });
    }
  }, [documents.length, direction, speed, controls]);

  // Vertical wave motion
  const waveAnimation = {
    y: [oscillationY - 8, oscillationY + 8, oscillationY - 8],
  };

  const waveTransition = {
    duration: 4 + ribbonIndex * 0.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  if (documents.length === 0) return null;

  return (
    <motion.div
      className="relative w-full overflow-hidden"
      style={{
        height: '120px',
        marginBottom: `${16 + ribbonIndex * 4}px`,
      }}
      animate={waveAnimation}
      transition={waveTransition}
    >
      {/* Ribbon container with depth effect */}
      <motion.div
        ref={containerRef}
        className="absolute inset-0 flex items-center gap-6 px-8"
        animate={controls}
        style={{
          filter: `blur(${blurAmount}px)`,
          transform: `scale(${scale})`,
          opacity: 1 - blurAmount * 0.2,
        }}
      >
        {/* Render pills twice for seamless loop */}
        {[...documents, ...documents].map((doc, idx) => (
          <FloatingDocumentPill
            key={`${doc.document_id}-${idx}`}
            filename={doc.filename}
            ipfs_hash={doc.ipfs_hash}
            timestamp={doc.timestamp}
            document_id={doc.document_id}
            onView={onView}
            onExecute={onExecute}
            onDelete={onDelete}
            delay={idx * 0.05}
          />
        ))}
      </motion.div>

      {/* Subtle gradient fade at edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #0F1423, transparent)',
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to left, #0F1423, transparent)',
        }}
      />
    </motion.div>
  );
};
