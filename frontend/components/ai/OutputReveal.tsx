'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OutputRevealProps {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
  output: string;
  className?: string;
}

export const OutputReveal: React.FC<OutputRevealProps> = ({ status, output, className = '' }) => {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);

  // Trigger reveal animation when status changes to complete
  useEffect(() => {
    if (status === 'complete' && output) {
      setIsRevealing(true);
      setRevealProgress(0);

      // Animate progress from 0 to 100 over 1.2s
      const duration = 1200;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setRevealProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else if (status !== 'complete') {
      setIsRevealing(false);
      setRevealProgress(0);
    }
  }, [status, output]);

  // Don't render if no output or not complete
  if (!output || status !== 'complete') {
    return null;
  }

  // Calculate text opacity and font weight based on reveal progress
  const textOpacity = Math.min(revealProgress * 1.5, 1);
  const fontWeight = 200 + Math.floor(revealProgress * 400); // 200 -> 600

  return (
    <AnimatePresence>
      {isRevealing && (
        <motion.div
          className={`absolute pointer-events-none ${className}`}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Organic curved text container */}
          <div className="relative flex flex-col items-center">
            {/* Soft expanding glow pulse */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(60, 242, 255, 0.15), transparent 70%)',
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.6 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />

            {/* Main text output with variable weight animation */}
            <motion.div
              className="relative max-w-2xl text-center px-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: textOpacity }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <motion.p
                className="text-lg leading-relaxed"
                style={{
                  color: '#E0F7FF',
                  fontWeight,
                  textShadow: `
                    0 0 20px rgba(60, 242, 255, ${0.4 * revealProgress}),
                    0 0 40px rgba(130, 255, 210, ${0.2 * revealProgress}),
                    0 0 60px rgba(163, 124, 255, ${0.1 * revealProgress})
                  `,
                  letterSpacing: `${0.05 - revealProgress * 0.03}em`,
                  filter: `blur(${(1 - revealProgress) * 2}px)`,
                  transition: 'font-weight 0.3s ease-out, letter-spacing 0.3s ease-out',
                }}
              >
                {output}
              </motion.p>

              {/* Subtle accent line below text */}
              <motion.div
                className="mt-6 h-px mx-auto"
                style={{
                  background: 'linear-gradient(90deg, transparent, #3CF2FF, #82FFD2, #3CF2FF, transparent)',
                  boxShadow: '0 0 10px rgba(60, 242, 255, 0.5)',
                }}
                initial={{ width: '0%', opacity: 0 }}
                animate={{ width: '80%', opacity: 0.6 }}
                transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
              />
            </motion.div>

            {/* Floating particles around text */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 150;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    background: i % 3 === 0 ? '#3CF2FF' : i % 3 === 1 ? '#82FFD2' : '#A37CFF',
                    boxShadow: `0 0 10px ${i % 3 === 0 ? '#3CF2FF' : i % 3 === 1 ? '#82FFD2' : '#A37CFF'}`,
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x,
                    y,
                    opacity: [0, 0.7, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.5 + i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
