'use client';

import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Suspense, useState } from 'react';
import BubbleExpansion from './BubbleExpansion';

interface EntryTransitionProps {
  onComplete: () => void;
}

export default function EntryTransition({ onComplete }: EntryTransitionProps) {
  const [bubbleComplete, setBubbleComplete] = useState(false);

  const handleBubbleComplete = () => {
    setBubbleComplete(true);
    setTimeout(onComplete, 500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40"
      initial={{ opacity: 1 }}
      animate={{ opacity: bubbleComplete ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: 'high-performance' 
        }}
      >
        <Suspense fallback={null}>
          <BubbleExpansion onComplete={handleBubbleComplete} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
