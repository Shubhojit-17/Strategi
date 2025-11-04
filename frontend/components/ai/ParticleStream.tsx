'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ParticleStreamProps {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
  particleCount?: number;
}

export const ParticleStream: React.FC<ParticleStreamProps> = ({ 
  status, 
  particleCount = 150 
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particles in orbital pattern around bubble
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const orbitRadius = 1.8 + Math.random() * 0.4; // Orbit around bubble (radius ~2.0-2.2)
      const theta = (i / particleCount) * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = orbitRadius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = orbitRadius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = orbitRadius * Math.cos(phi);
    }
    
    return positions;
  }, [particleCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Stop rotation when complete (particles become stable)
      if (status === 'complete') {
        // Particles are frozen in place
        return;
      }
      
      // Rotation speed based on status
      const rotationSpeed = status === 'processing' ? 0.8 : status === 'thinking' ? 0.5 : 0.2;
      
      pointsRef.current.rotation.y = time * rotationSpeed;
      pointsRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
      
      // Subtle pulsing scale (not when complete)
      const scale = 1 + Math.sin(time * 2) * 0.05;
      pointsRef.current.scale.setScalar(scale);
    }
  });

  // Get color based on status
  const getColor = () => {
    switch (status) {
      case 'thinking':
        return '#A37CFF';
      case 'processing':
        return '#3CF2FF';
      case 'complete':
        return '#00FF88';
      case 'error':
        return '#FF3366';
      default:
        return '#82FFD2';
    }
  };

  // Hide particles only in error state (keep visible when complete, but stable)
  if (status === 'error') {
    return null;
  }

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={getColor()}
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={status === 'complete' ? 0.9 : status === 'processing' ? 0.8 : status === 'thinking' ? 0.6 : 0.4}
      />
    </Points>
  );
};
