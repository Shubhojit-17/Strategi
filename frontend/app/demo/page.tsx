'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AIAgentCore from '@/components/ai/AIAgentCore';
import AIStateControls from '@/components/ai/AIStateControls';
import { PerformanceDisplay } from '@/components/ai/PerformanceMonitor';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();
  const [showPerformance, setShowPerformance] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-deep-space-blue">
      {/* AI Bubble Demo - Full Screen */}
      <div className="absolute inset-0">
        <AIAgentCore showPerformance={showPerformance} />
      </div>

      {/* Performance Display */}
      {showPerformance && <PerformanceDisplay />}

      {/* State Controls */}
      <AIStateControls onTogglePerformance={() => setShowPerformance(!showPerformance)} />

      {/* Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h1 className="text-5xl font-bold neon-glow mb-2">Strategi</h1>
        <p className="text-soft-purple/60 mt-2">
          Phase 2 Complete: Core AI Bubble Component ✨
        </p>
      </div>

      {/* Back Button */}
      <motion.button
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 z-10 px-6 py-3 rounded-full bg-gray-800/50 border border-primary-light/30 text-primary-light hover:bg-gray-700/50 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back to Dashboard
      </motion.button>

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-linear-to-br from-deep-space-blue via-[#1B2138] to-deep-space-blue" />
    </div>
  );
}
