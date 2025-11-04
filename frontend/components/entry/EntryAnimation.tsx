'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { StrategiLogoAnimated } from '@/components/branding/StrategiLogoAnimated';

interface EntryAnimationProps {
  onComplete: () => void;
}

export default function EntryAnimation({ onComplete }: EntryAnimationProps) {
  const [phase, setPhase] = useState<'appear' | 'hold' | 'exit'>('appear');

  useEffect(() => {
    // Phase 1: Logo appears and rotates in (1s)
    // Phase 2: Hold and breathe (1.5s)
    // Phase 3: Exit animation (0.8s)
    
    const holdTimer = setTimeout(() => {
      setPhase('hold');
    }, 1000);

    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 2500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3300);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(circle at center, #0F1423, #000000)',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated logo entrance */}
      <motion.div
        initial={{ scale: 0.3, rotate: -180, opacity: 0 }}
        animate={{
          scale: phase === 'exit' ? 2.5 : 1,
          rotate: phase === 'exit' ? 180 : 0,
          opacity: phase === 'exit' ? 0 : 1,
        }}
        transition={{
          duration: phase === 'appear' ? 1 : 0.8,
          ease: phase === 'appear' ? [0.34, 1.56, 0.64, 1] : 'easeInOut',
        }}
      >
        <StrategiLogoAnimated size={140} />
      </motion.div>

      {/* Expanding ring on exit */}
      {phase === 'exit' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="rounded-full border-2"
            style={{
              borderColor: '#3CF2FF',
              boxShadow: '0 0 30px #3CF2FF80',
            }}
            initial={{ width: 140, height: 140, opacity: 1 }}
            animate={{ width: 2000, height: 2000, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </motion.div>
      )}

      {/* Particle burst on exit */}
      {phase === 'exit' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? '#3CF2FF' : i % 3 === 1 ? '#82FFD2' : '#A37CFF',
                boxShadow: `0 0 8px ${i % 3 === 0 ? '#3CF2FF' : i % 3 === 1 ? '#82FFD2' : '#A37CFF'}`,
                left: '50%',
                top: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos((i / 24) * Math.PI * 2) * 400,
                y: Math.sin((i / 24) * Math.PI * 2) * 400,
                opacity: 0,
                scale: 1,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
