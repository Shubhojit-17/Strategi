'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface BubbleSatellitesProps {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
}

export const BubbleSatellites: React.FC<BubbleSatellitesProps> = ({ status }) => {
  const groupRef = useRef<THREE.Group>(null);
  const satelliteCount = 6;
  const orbitRadius = 1.8;

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Rotation speed based on status
      const rotationSpeed = status === 'processing' ? 0.6 : status === 'thinking' ? 0.4 : 0.2;
      
      groupRef.current.rotation.y = time * rotationSpeed;
      groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.15;
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

  // Hide in complete/error states
  if (status === 'complete' || status === 'error') {
    return null;
  }

  const color = getColor();
  const emissiveIntensity = status === 'processing' ? 1.2 : status === 'thinking' ? 1.0 : 0.8;

  return (
    <group ref={groupRef}>
      {Array.from({ length: satelliteCount }).map((_, i) => {
        const angle = (i / satelliteCount) * Math.PI * 2;
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        const y = Math.sin(i * 1.5) * 0.3;

        return (
          <group key={i}>
            {/* Connection line from bubble to satellite */}
            <Line
              points={[
                [0, 0, 0],
                [x, y, z]
              ]}
              color={color}
              lineWidth={1}
              transparent
              opacity={0.4}
            />
            
            {/* Satellite node */}
            <Sphere args={[0.12, 16, 16]} position={[x, y, z]}>
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                transparent
                opacity={0.9}
              />
            </Sphere>

            {/* Small ring around satellite */}
            <mesh position={[x, y, z]} rotation={[Math.PI / 2, 0, angle]}>
              <torusGeometry args={[0.18, 0.02, 8, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.6}
                transparent
                opacity={0.5}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
