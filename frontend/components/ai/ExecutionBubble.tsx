'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface ExecutionBubbleProps {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
}

// Particle swirl for thinking state
const ParticleSwirl: React.FC<{ status: string }> = ({ status }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 200;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current && status === 'thinking') {
      particlesRef.current.rotation.y += 0.01;
      particlesRef.current.rotation.x += 0.005;
    }
  });

  if (status !== 'thinking') return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={0x8b5cf6}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const ExecutionBubble: React.FC<ExecutionBubbleProps> = ({ status }) => {
  const mainSphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Get color based on status
  const getColor = () => {
    switch (status) {
      case 'thinking':
        return new THREE.Color(0x8b5cf6); // Purple
      case 'processing':
        return new THREE.Color(0x06b6d4); // Cyan
      case 'complete':
        return new THREE.Color(0x34d399); // Green
      case 'error':
        return new THREE.Color(0xef4444); // Red
      default:
        return new THREE.Color(0x6366f1); // Indigo
    }
  };

  const color = getColor();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (mainSphereRef.current) {
      // Rotation
      mainSphereRef.current.rotation.y = time * 0.3;

      // Scale animation based on status
      let scale = 1;
      if (status === 'thinking') {
        scale = 1 + Math.sin(time * 3) * 0.1;
      } else if (status === 'processing') {
        scale = 1 + Math.sin(time * 5) * 0.05;
      } else if (status === 'complete') {
        scale = 1.2;
      }
      mainSphereRef.current.scale.setScalar(scale);

      // Error shake
      if (status === 'error') {
        mainSphereRef.current.position.x = Math.sin(time * 20) * 0.03;
      } else {
        mainSphereRef.current.position.x = 0;
      }
    }

    if (glowRef.current) {
      glowRef.current.rotation.y = -time * 0.2;
      
      // Pulsing intensity
      const material = glowRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.3;
    }
  });

  return (
    <group>
      {/* Main sphere */}
      <Sphere ref={mainSphereRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Glow layer */}
      <Sphere ref={glowRef} args={[1.15, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Particle swirl for thinking */}
      <ParticleSwirl status={status} />

      {/* Success burst */}
      {status === 'complete' && (
        <>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 2;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle) * radius,
                  0,
                ]}
              >
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial
                  color={0xfbbf24}
                  emissive={0xfbbf24}
                  emissiveIntensity={1}
                />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};
