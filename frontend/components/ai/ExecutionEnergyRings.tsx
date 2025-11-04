'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface ExecutionEnergyRingsProps {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
}

export const ExecutionEnergyRings: React.FC<ExecutionEnergyRingsProps> = ({ status }) => {
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const ring3Ref = useRef<Mesh>(null);

  const isProcessing = status === 'processing';
  const isThinking = status === 'thinking';
  const isActive = isProcessing || isThinking;

  useFrame((frameState) => {
    const time = frameState.clock.getElapsedTime();
    
    // Faster rotation speed during active states: 6-9s instead of 14-18s
    // Original speed ~1.0, new speed for processing: ~3.5-4.0 (360deg / 6-9s ≈ 40-60deg/s)
    const baseSpeed = isProcessing ? 4.0 : isThinking ? 2.8 : 1.2;
    const radiusScale = isProcessing ? 0.82 : isThinking ? 0.88 : 0.95;
    const pulseIntensity = isProcessing ? 0.18 : isThinking ? 0.14 : 0.1;
    
    // Breathing pulse synced with bubble (4.5s cycle)
    const breathingPulse = Math.sin(time * (Math.PI * 2 / 4.5)) * 0.04;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * baseSpeed;
      ring1Ref.current.rotation.x = Math.PI / 2;
      
      // Scale pulse with breathing + radial glow
      const scale = radiusScale * (1 + Math.sin(time * 4) * pulseIntensity + breathingPulse);
      ring1Ref.current.scale.set(scale, scale, 1);
      ring1Ref.current.position.z = Math.sin(time * 0.5) * 0.3;
      
      // Opacity pulse for radial glow effect
      const material = ring1Ref.current.material as any;
      if (material) {
        material.opacity = isActive ? 0.5 + breathingPulse : 0.35 + breathingPulse;
      }
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * baseSpeed * 1.3;
      ring2Ref.current.rotation.x = Math.PI / 2 + 0.3;
      
      const scale = radiusScale * (1 + Math.sin(time * 4 + Math.PI) * pulseIntensity + breathingPulse * 0.8);
      ring2Ref.current.scale.set(scale, scale, 1);
      ring2Ref.current.position.z = Math.sin(time * 0.5 + Math.PI / 2) * 0.3;
      
      const material = ring2Ref.current.material as any;
      if (material) {
        material.opacity = isActive ? 0.4 + breathingPulse * 0.8 : 0.28 + breathingPulse * 0.8;
      }
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * baseSpeed * 0.9;
      ring3Ref.current.rotation.x = Math.PI / 2 - 0.3;
      
      const scale = radiusScale * (1 + Math.sin(time * 4 + Math.PI / 2) * pulseIntensity + breathingPulse * 0.6);
      ring3Ref.current.scale.set(scale, scale, 1);
      ring3Ref.current.position.z = Math.sin(time * 0.5 + Math.PI) * 0.3;
      
      const material = ring3Ref.current.material as any;
      if (material) {
        material.opacity = isActive ? 0.35 + breathingPulse * 0.6 : 0.22 + breathingPulse * 0.6;
      }
    }
  });

  // Only show rings during thinking and processing
  if (!isThinking && !isProcessing) {
    return null;
  }

  return (
    <group>
      {/* Ring 1 - Core Glow (Cyan) */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[3.8, 4.0, 64]} />
        <meshBasicMaterial
          color="#3CF2FF"
          transparent
          opacity={isActive ? 0.5 : 0.35}
          side={2} // DoubleSide
        />
      </mesh>

      {/* Ring 2 - Biolight Purple */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[4.2, 4.4, 64]} />
        <meshBasicMaterial
          color="#A37CFF"
          transparent
          opacity={isActive ? 0.4 : 0.28}
          side={2}
        />
      </mesh>

      {/* Ring 3 - Plasma Accent (Teal) */}
      <mesh ref={ring3Ref}>
        <ringGeometry args={[4.6, 4.8, 64]} />
        <meshBasicMaterial
          color="#82FFD2"
          transparent
          opacity={isActive ? 0.35 : 0.22}
          side={2}
        />
      </mesh>
    </group>
  );
};
