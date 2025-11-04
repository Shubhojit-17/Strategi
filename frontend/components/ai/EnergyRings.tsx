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

  useFrame((frameState) => {
    const time = frameState.clock.getElapsedTime();
    const speed = isProcessing ? 2.0 : 1.0;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * speed;
      ring1Ref.current.rotation.x = Math.PI / 2;
      
      // Pulse scale
      const scale = 1 + Math.sin(time * 3) * 0.1;
      ring1Ref.current.scale.set(scale, scale, 1);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * speed * 1.2;
      ring2Ref.current.rotation.x = Math.PI / 2 + 0.3;
      
      const scale = 1 + Math.sin(time * 3 + Math.PI) * 0.1;
      ring2Ref.current.scale.set(scale, scale, 1);
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * speed * 0.8;
      ring3Ref.current.rotation.x = Math.PI / 2 - 0.3;
      
      const scale = 1 + Math.sin(time * 3 + Math.PI / 2) * 0.1;
      ring3Ref.current.scale.set(scale, scale, 1);
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
          opacity={0.4}
          side={2} // DoubleSide
        />
      </mesh>

      {/* Ring 2 - Purple */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[4.2, 4.4, 64]} />
        <meshBasicMaterial
          color="#A37CFF"
          transparent
          opacity={0.3}
          side={2}
        />
      </mesh>

      {/* Ring 3 - Pink */}
      <mesh ref={ring3Ref}>
        <ringGeometry args={[4.6, 4.8, 64]} />
        <meshBasicMaterial
          color="#FF7AC3"
          transparent
          opacity={0.2}
          side={2}
        />
      </mesh>
    </group>
  );
}
