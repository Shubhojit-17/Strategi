'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnergyRingsProps {
  count?: number;
}

// Atomic orbital ring with 3D tilt and rotation
const OrbitalRing: React.FC<{ 
  radius: number; 
  opacity: number; 
  index: number;
  totalRings: number;
  tiltX: number;
  tiltY: number;
  speed: number;
}> = ({ radius, opacity, index, totalRings, tiltX, tiltY, speed }) => {
  const ringRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current || !meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Continuous rotation around Z axis
    ringRef.current.rotation.z = time * speed;
    
    // Pulsing glow effect synchronized per ring
    const pulsePhase = (index / totalRings) * Math.PI * 2;
    const pulse = Math.sin(time * 0.4 + pulsePhase) * 0.3 + 1;
    
    // Apply breathing opacity
    if (meshRef.current.material instanceof THREE.Material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * pulse;
    }
  });

  return (
    <group 
      ref={ringRef}
      rotation={[
        (tiltX * Math.PI) / 180,  // Convert degrees to radians
        (tiltY * Math.PI) / 180,
        0
      ]}
    >
      <mesh ref={meshRef}>
        <torusGeometry args={[radius, 0.025, 16, 100]} />
        <meshBasicMaterial
          color="#3CF2FF"
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export const EnergyRings: React.FC<EnergyRingsProps> = ({ count = 5 }) => {
  // X-pattern orbital configuration - alternating between two perpendicular planes
  // Creates an X shape by tilting rings at complementary angles
  const orbitalConfigs = [
    { radius: 3.0, tiltX: 60, tiltY: 0, speed: 0.08, opacity: 0.25 },   // First diagonal
    { radius: 3.8, tiltX: -60, tiltY: 0, speed: 0.05, opacity: 0.22 },  // Second diagonal (X-cross)
    { radius: 4.6, tiltX: 60, tiltY: 0, speed: 0.037, opacity: 0.19 },  // First diagonal
    { radius: 5.4, tiltX: -60, tiltY: 0, speed: 0.026, opacity: 0.16 }, // Second diagonal (X-cross)
    { radius: 6.2, tiltX: 60, tiltY: 0, speed: 0.02, opacity: 0.13 },   // First diagonal
  ];

  return (
    <>
      {orbitalConfigs.slice(0, count).map((config, i) => (
        <OrbitalRing
          key={i}
          radius={config.radius}
          opacity={config.opacity}
          index={i}
          totalRings={count}
          tiltX={config.tiltX}
          tiltY={config.tiltY}
          speed={config.speed}
        />
      ))}
    </>
  );
};
