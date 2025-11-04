'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropZone } from './DropZone';
import { FilePill } from './FilePill';

interface FileState {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  cid?: string;
}

interface UploadBubbleProps {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  onFilesSelected: (files: File[]) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  files?: FileState[];
  onRemoveFile?: (index: number) => void;
}

export const UploadBubble: React.FC<UploadBubbleProps> = ({
  status,
  progress = 0,
  onFilesSelected,
  onDragStateChange,
  files = [],
  onRemoveFile,
}) => {
  const hasFiles = files.length > 0;
  const [isDragging, setIsDragging] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const coreGlow = '#3CF2FF';
  const plasmaAccent = '#82FFD2';
  const deepOcean = '#0F1423';
  const biolightPurple = '#A37CFF';

  const handleDragEnter = () => {
    setIsDragging(true);
    onDragStateChange?.(true);
    const newRipple = { id: Date.now(), x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 60 };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    onDragStateChange?.(false);
  };

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
  const [showSuccessBurst, setShowSuccessBurst] = useState(false);
  
  useEffect(() => {
    if (status === 'success') {
      setShowSuccessBurst(true);
      setTimeout(() => setShowSuccessBurst(false), 1000);
    }
  }, [status]);

  const [showErrorPulse, setShowErrorPulse] = useState(false);
  
  useEffect(() => {
    if (status === 'error') {
      setShowErrorPulse(true);
      setTimeout(() => setShowErrorPulse(false), 1200);
    }
  }, [status]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="upload-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke={coreGlow} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1000" height="1000" fill="url(#upload-grid)" />
        </svg>
      </div>

      <div className="relative w-[32rem] h-[32rem] flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: isDragging ? 1.05 : status === 'uploading' ? [1, 1.03, 1] : [1, 1.02, 1],
            boxShadow: isDragging || status === 'uploading'
              ? `0 0 80px ${statusColor}, 0 0 120px ${statusColor}40, inset 0 0 40px ${biolightPurple}30`
              : `0 0 50px ${coreGlow}, 0 0 80px ${plasmaAccent}30, inset 0 0 25px ${biolightPurple}15`,
          }}
          transition={{ 
            scale: { 
              duration: status === 'uploading' ? 1.5 : 3, 
              repeat: status === 'idle' || status === 'uploading' ? Infinity : 0, 
              ease: 'easeInOut' 
            }, 
            boxShadow: { duration: 0.4 } 
          }}
          style={{ background: `radial-gradient(circle at 30% 30%, ${plasmaAccent}20, ${deepOcean}90)`, border: `2px solid ${statusColor}`, backdropFilter: 'blur(10px)' }}
        />

        <motion.div
          className="absolute inset-3 rounded-full pointer-events-none"
          animate={{ opacity: isDragging ? 0.9 : 0.6, scale: isDragging ? 1.08 : 1 }}
          transition={{ duration: 0.4 }}
          style={{ background: `linear-gradient(135deg, ${plasmaAccent}25, ${biolightPurple}20)`, border: `1px solid ${plasmaAccent}60`, boxShadow: `inset 0 2px 30px ${coreGlow}40`, backdropFilter: 'blur(8px)' }}
        />

        {status === 'uploading' && (
          <motion.svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <circle cx="50" cy="50" r="47" fill="none" stroke={`${statusColor}30`} strokeWidth="1.5" />
            <motion.circle
              cx="50" cy="50" r="47" fill="none" stroke={statusColor} strokeWidth="2"
              strokeDasharray="295" strokeDashoffset={295 - (progress / 100) * 295} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${statusColor})`, transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </motion.svg>
        )}

        <motion.div
          className="absolute inset-8 rounded-full flex flex-col items-center justify-center overflow-hidden gap-4 p-6"
          animate={{ scale: isDragging ? 1.15 : 1, boxShadow: isDragging ? `0 0 40px ${coreGlow}, inset 0 0 30px ${plasmaAccent}30` : `0 0 20px ${coreGlow}50, inset 0 0 15px ${plasmaAccent}15` }}
          transition={{ duration: 0.4 }}
          style={{ background: `radial-gradient(circle, ${coreGlow}12, ${deepOcean}85)`, border: `1px solid ${coreGlow}70`, backdropFilter: 'blur(6px)' }}
        >
          {/* File pills displayed inside bubble */}
          <AnimatePresence mode="popLayout">
            {hasFiles && (
              <div className="flex flex-col gap-3 items-center max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
                {files.map((fileState, index) => (
                  <FilePill
                    key={index}
                    fileName={fileState.file.name}
                    fileSize={fileState.file.size}
                    status={fileState.status === 'pending' ? 'idle' : fileState.status}
                    progress={fileState.progress}
                    onRemove={onRemoveFile ? () => onRemoveFile(index) : undefined}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
          
          {/* Drop zone - always present but shrinks when files exist */}
          <motion.div
            className="w-full"
            animate={{ 
              opacity: hasFiles ? 0.5 : 1,
              scale: hasFiles ? 0.7 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <DropZone onFilesSelected={onFilesSelected} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} />
          </motion.div>
        </motion.div>

        {showSuccessBurst && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 1, opacity: 1 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ border: `3px solid ${plasmaAccent}`, boxShadow: `0 0 50px ${plasmaAccent}, 0 0 100px ${plasmaAccent}60` }}
          />
        )}

        {showErrorPulse && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 1.2, times: [0, 0.3, 1] }}
            style={{ border: `2px solid #ef4444`, boxShadow: `0 0 40px #ef4444, inset 0 0 40px ${biolightPurple}40`, background: `radial-gradient(circle, #ef444420, transparent)` }}
          />
        )}

        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div key={ripple.id} className="absolute rounded-full pointer-events-none"
              initial={{ scale: 0.6, opacity: 1 }} animate={{ scale: 2.8, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ width: '120px', height: '120px', left: `calc(50% + ${ripple.x}px)`, top: `calc(50% + ${ripple.y}px)`, transform: 'translate(-50%, -50%)', border: `1px solid ${coreGlow}`, boxShadow: `0 0 20px ${coreGlow}80` }}
            />
          ))}
        </AnimatePresence>

        {status === 'uploading' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full"
                style={{ background: i % 2 === 0 ? coreGlow : plasmaAccent, boxShadow: `0 0 8px ${i % 2 === 0 ? coreGlow : plasmaAccent}`, left: '50%', top: '50%' }}
                animate={{ x: Math.cos((i / 24) * Math.PI * 2) * 200, y: Math.sin((i / 24) * Math.PI * 2) * 200, opacity: [0, 1, 0] }}
                transition={{ duration: 1.2 + (i % 4) * 0.2, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>
        )}
      </div>

      <motion.div className="absolute bottom-16 text-center pointer-events-none" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="text-base font-semibold tracking-wider mb-2" style={{ color: statusColor, textShadow: `0 0 12px ${statusColor}90, 0 0 24px ${statusColor}40` }}>
          {status === 'idle' && !hasFiles && 'Drag & drop your documents'}
          {status === 'idle' && hasFiles && `${files.length} ${files.length === 1 ? 'file' : 'files'} ready`}
          {status === 'uploading' && `Uploading... ${Math.round(progress)}%`}
          {status === 'success' && 'Upload complete!'}
          {status === 'error' && 'Upload failed - please try again'}
        </div>
        {status === 'idle' && !hasFiles && (
          <div className="text-sm opacity-80" style={{ color: plasmaAccent, textShadow: `0 0 6px ${plasmaAccent}70` }}>
            or click the bubble to browse
          </div>
        )}
      </motion.div>
    </div>
  );
};
