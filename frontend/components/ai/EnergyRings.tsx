'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, RingGeometry, MeshBasicMaterial } from 'three';
import type { AIExecutionState } from '@/lib/types';

interface EnergyRingsProps {
  state: AIExecutionState['status'];
}

export default function EnergyRings({ state }: EnergyRingsProps) {
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const ring3Ref = useRef<Mesh>(null);

  const isProcessing = state === 'processing';
  const isValidating = state === 'validating';
  const isActive = isProcessing || isValidating;

  useFrame((frameState) => {
    const time = frameState.clock.getElapsedTime();
    const speed = isProcessing ? 3.0 : isValidating ? 1.8 : 1.0;
    const radiusScale = isProcessing ? 0.85 : isValidating ? 0.92 : 1.0;
    const pulseIntensity = isProcessing ? 0.15 : isValidating ? 0.12 : 0.1;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * speed;
      ring1Ref.current.rotation.x = Math.PI / 2;
      
      // Pulse scale with parallax effect
      const scale = radiusScale * (1 + Math.sin(time * 4) * pulseIntensity);
      ring1Ref.current.scale.set(scale, scale, 1);
      ring1Ref.current.position.z = Math.sin(time * 0.5) * 0.3;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * speed * 1.2;
      ring2Ref.current.rotation.x = Math.PI / 2 + 0.3;
      
      const scale = radiusScale * (1 + Math.sin(time * 4 + Math.PI) * pulseIntensity);
      ring2Ref.current.scale.set(scale, scale, 1);
      ring2Ref.current.position.z = Math.sin(time * 0.5 + Math.PI / 2) * 0.3;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * speed * 0.8;
      ring3Ref.current.rotation.x = Math.PI / 2 - 0.3;
      
      const scale = radiusScale * (1 + Math.sin(time * 4 + Math.PI / 2) * pulseIntensity);
      ring3Ref.current.scale.set(scale, scale, 1);
      ring3Ref.current.position.z = Math.sin(time * 0.5 + Math.PI) * 0.3;
    }
  });

  return (
    <group>
      {/* Ring 1 - Aqua */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[3.8, 4.0, 64]} />
        <meshBasicMaterial
          color="#3CF2FF"
          transparent
          opacity={isActive ? 0.5 : 0.4}
          side={2} // DoubleSide
        />
      </mesh>

      {/* Ring 2 - Purple */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[4.2, 4.4, 64]} />
        <meshBasicMaterial
          color="#A37CFF"
          transparent
          opacity={isActive ? 0.4 : 0.3}
          side={2}
        />
      </mesh>

      {/* Ring 3 - Pink */}
      <mesh ref={ring3Ref}>
        <ringGeometry args={[4.6, 4.8, 64]} />
        <meshBasicMaterial
          color="#FF7AC3"
          transparent
          opacity={isActive ? 0.3 : 0.2}
          side={2}
        />
      </mesh>
    </group>
  );
}
