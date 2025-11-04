'use client';

import { motion } from 'framer-motion';
import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  blur?: number;
  opacity?: number;
  borderRadius?: number;
  glowColor?: string;
  animate?: boolean;
}

export default function GlassPanel({
  children,
  className,
  style,
  blur = 20,
  opacity = 0.7,
  borderRadius = 50,
  glowColor = 'rgba(60, 242, 255, 0.3)',
  animate = true
}: GlassPanelProps) {
  const panelStyle: CSSProperties = {
    background: `rgba(15, 20, 35, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderRadius: `${borderRadius}px`,
    border: `1px solid ${glowColor}`,
    boxShadow: `0 0 40px ${glowColor}`,
    ...style
  };

  if (animate) {
    return (
      <motion.div
        className={cn('glass-panel', className)}
        style={panelStyle}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn('glass-panel', className)} style={panelStyle}>
      {children}
    </div>
  );
}
