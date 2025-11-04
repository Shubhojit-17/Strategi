'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import ParticleNeurons from '../ai/ParticleNeurons';
import EnergyRings from '../ai/EnergyRings';
import type { AIExecutionState } from '@/lib/types';

interface NeuralBackgroundLayerProps {
  uploadState: 'idle' | 'uploading' | 'success' | 'error';
  isDragging?: boolean;
}

export const NeuralBackgroundLayer: React.FC<NeuralBackgroundLayerProps> = ({
  uploadState,
  isDragging = false,
}) => {
  // Map upload state to AI execution state for component compatibility
  const getMappedState = (): AIExecutionState['status'] => {
    if (isDragging) return 'validating';
    
    switch (uploadState) {
      case 'uploading':
        return 'processing';
      case 'success':
        return 'complete';
      case 'error':
        return 'error';
      default:
        return 'idle';
    }
  };

  const aiState = getMappedState();
  const particleCount = isDragging ? 180 : uploadState === 'uploading' ? 220 : 140;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'transparent',
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.0} color="#3CF2FF" />
        <pointLight position={[-5, -5, 5]} intensity={0.7} color="#A37CFF" />
        <pointLight position={[0, 5, -5]} intensity={0.5} color="#82FFD2" />
        
        <Suspense fallback={null}>
          {/* Multiple particle layers for depth */}
          <group position={[0, 0, 0]}>
            <ParticleNeurons 
              state={aiState} 
              particleCount={particleCount}
            />
          </group>
          
          {/* Background particle layer with parallax */}
          <group position={[0, 0, -2]} scale={0.8}>
            <ParticleNeurons 
              state={aiState} 
              particleCount={Math.floor(particleCount * 0.6)}
            />
          </group>
          
          {/* Energy rings with parallax movement */}
          <group position={[0, 0, 1]}>
            <EnergyRings state={aiState} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};
