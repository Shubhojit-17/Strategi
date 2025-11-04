'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import BubbleCore from './BubbleCore';
import ParticleSystem from './ParticleSystem';
import ParticleNeurons from './ParticleNeurons';
import EnergyRings from './EnergyRings';
import BurstWave from './BurstWave';
import { PerformanceMonitor } from './PerformanceMonitor';

interface AIAgentCoreProps {
  className?: string;
  showPerformance?: boolean;
}

export default function AIAgentCore({ className = '', showPerformance = false }: AIAgentCoreProps) {
  const aiState = useAppStore((state) => state.aiState);
  const [showBurst, setShowBurst] = useState(false);
  const [prevState, setPrevState] = useState(aiState.status);

  // Trigger burst when transitioning to complete state
  useEffect(() => {
    if (prevState !== 'complete' && aiState.status === 'complete') {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 2500);
    }
    setPrevState(aiState.status);
  }, [aiState.status, prevState]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]} // Device pixel ratio for retina displays
        style={{ width: '100%', height: '100%' }}
      >
        {/* Ambient light for base illumination */}
        <ambientLight intensity={0.4} />
        
        {/* Main point light for bubble highlight */}
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#3CF2FF" />
        
        {/* Secondary light for depth */}
        <pointLight position={[-3, -3, 3]} intensity={0.6} color="#A37CFF" />
        
        {/* Accent light */}
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.8}
          color="#FF7AC3"
        />

        <Suspense fallback={null}>
          {/* Main bubble sphere */}
          <BubbleCore state={aiState.status} />
          
          {/* Particle system inside bubble */}
          <ParticleSystem state={aiState.status} progress={aiState.progress} />
          
          {/* Neural network connections */}
          <ParticleNeurons state={aiState.status} particleCount={80} />
          
          {/* Energy rings for active states */}
          {(aiState.status === 'executing' || aiState.status === 'processing') && (
            <EnergyRings state={aiState.status} />
          )}
          
          {/* Burst wave on completion */}
          <BurstWave trigger={showBurst} />
          
          {/* Performance monitoring */}
          {showPerformance && <PerformanceMonitor />}
        </Suspense>
      </Canvas>

      {/* Status text overlay */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-neon-aqua text-lg font-medium">
          {aiState.status === 'idle' && 'AI Ready'}
          {aiState.status === 'validating' && 'Validating Request...'}
          {aiState.status === 'executing' && 'Executing AI...'}
          {aiState.status === 'processing' && `Processing... ${Math.round(aiState.progress)}%`}
          {aiState.status === 'complete' && 'Complete!'}
          {aiState.status === 'error' && 'Error Occurred'}
        </p>
        {aiState.currentStep && (
          <p className="text-soft-purple/70 text-sm mt-1">{aiState.currentStep}</p>
        )}
      </div>
    </div>
  );
}
