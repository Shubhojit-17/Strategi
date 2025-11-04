'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface EntryAnimationProps {
  onComplete: () => void;
}

export default function EntryAnimation({ onComplete }: EntryAnimationProps) {
  const [showCircle, setShowCircle] = useState(true);

  useEffect(() => {
    // Complete animation after circle trace finishes
    const timer = setTimeout(() => {
      setShowCircle(false);
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const circleRadius = 100;
  const circumference = 2 * Math.PI * circleRadius;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep-space-blue"
      initial={{ opacity: 1 }}
      animate={{ opacity: showCircle ? 1 : 0 }}
      transition={{ duration: 0.8, delay: 2.5 }}
    >
      {/* SVG Circle Tracing Animation */}
      <svg width="240" height="240" viewBox="0 0 240 240">
        {/* Background circle */}
        <circle
          cx="120"
          cy="120"
          r={circleRadius}
          fill="none"
          stroke="rgba(60, 242, 255, 0.1)"
          strokeWidth="2"
        />
        
        {/* Animated tracing circle */}
        <motion.circle
          cx="120"
          cy="120"
          r={circleRadius}
          fill="none"
          stroke="url(#neonGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ 
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
            opacity: 0 
          }}
          animate={{ 
            strokeDashoffset: 0,
            opacity: 1 
          }}
          transition={{ 
            duration: 2,
            ease: "easeInOut",
            opacity: { duration: 0.3 }
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3CF2FF" />
            <stop offset="50%" stopColor="#A37CFF" />
            <stop offset="100%" stopColor="#FF7AC3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <motion.div
        className="absolute text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold neon-glow mb-2">Strategi</h1>
        <p className="text-neon-aqua/60 text-sm">Initializing AI Consciousness</p>
      </motion.div>

      {/* Particle dots around circle */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = 120 + Math.cos(angle) * (circleRadius + 20);
        const y = 120 + Math.sin(angle) * (circleRadius + 20);
        
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-neon-aqua"
            style={{ 
              left: `calc(50% - ${240/2}px + ${x}px - 4px)`, 
              top: `calc(50% - ${240/2}px + ${y}px - 4px)` 
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.5, 1],
              opacity: [0, 1, 0.7]
            }}
            transition={{
              delay: 0.8 + (i * 0.1),
              duration: 0.6,
              ease: "easeOut"
            }}
          />
        );
      })}
    </motion.div>
  );
}
