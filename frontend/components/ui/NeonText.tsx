'use client';

import { motion } from 'framer-motion';
import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

interface NeonTextProps {
  children: ReactNode;
  className?: string;
  color?: 'aqua' | 'purple' | 'pink';
  intensity?: 'low' | 'medium' | 'high';
  animate?: boolean;
}

const colorMap = {
  aqua: '#3CF2FF',
  purple: '#A37CFF',
  pink: '#FF7AC3'
};

const intensityMap = {
  low: {
    textShadow: (color: string) => `0 0 10px ${color}`
  },
  medium: {
    textShadow: (color: string) => `0 0 10px ${color}, 0 0 20px ${color}`
  },
  high: {
    textShadow: (color: string) => `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}, 0 0 40px ${color}`
  }
};

export default function NeonText({
  children,
  className,
  color = 'aqua',
  intensity = 'medium',
  animate = true
}: NeonTextProps) {
  const colorValue = colorMap[color];
  const textStyle: CSSProperties = {
    color: colorValue,
    textShadow: intensityMap[intensity].textShadow(colorValue)
  };

  if (animate) {
    return (
      <motion.span
        className={cn('neon-glow', className)}
        style={textStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span className={cn('neon-glow', className)} style={textStyle}>
      {children}
    </span>
  );
}
