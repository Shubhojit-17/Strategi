'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { fresnelVertexShader, fresnelFragmentShader } from '@/lib/shaders/fresnel';

interface MintingBubbleProps {
  state: 'idle' | 'preparing' | 'minting' | 'success' | 'error';
  progress?: number; // 0-1 for minting progress
}

export const MintingBubble: React.FC<MintingBubbleProps> = ({
  state,
  progress = 0,
}) => {
  const bubbleRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const fresnelRef = useRef<THREE.Mesh>(null);
  const sparklesRef = useRef<any>(null);

  // State-based configuration
  const config = useMemo(() => {
    switch (state) {
      case 'idle':
        return {
          color: '#3CF2FF',
          distortSpeed: 1.5,
          distortStrength: 0.3,
          scale: 2.5,
          emissiveIntensity: 0.5,
          rotationSpeed: 0.003,
          pulseIntensity: 0.1,
        };
      case 'preparing':
        return {
          color: '#A37CFF',
          distortSpeed: 2.5,
          distortStrength: 0.5,
          scale: 2.7,
          emissiveIntensity: 0.7,
          rotationSpeed: 0.006,
          pulseIntensity: 0.2,
        };
      case 'minting':
        return {
          color: '#FF7AC3',
          distortSpeed: 4.0,
          distortStrength: 0.8,
          scale: 2.5 + progress * 0.5,
          emissiveIntensity: 0.9,
          rotationSpeed: 0.01,
          pulseIntensity: 0.3,
        };
      case 'success':
        return {
          color: '#00FF80',
          distortSpeed: 1.0,
          distortStrength: 0.2,
          scale: 3.5,
          emissiveIntensity: 1.2,
          rotationSpeed: 0.002,
          pulseIntensity: 0.4,
        };
      case 'error':
        return {
          color: '#FF4444',
          distortSpeed: 5.0,
          distortStrength: 0.4,
          scale: 2.3,
          emissiveIntensity: 0.8,
          rotationSpeed: 0.008,
          pulseIntensity: 0.15,
        };
      default:
        return {
          color: '#3CF2FF',
          distortSpeed: 1.5,
          distortStrength: 0.3,
          scale: 2.5,
          emissiveIntensity: 0.5,
          rotationSpeed: 0.003,
          pulseIntensity: 0.1,
        };
    }
  }, [state, progress]);

  // Animations
  useFrame((frameState) => {
    if (!bubbleRef.current || !glowRef.current || !fresnelRef.current) return;

    const time = frameState.clock.getElapsedTime();

    // Pulse effect
    const pulse = Math.sin(time * 2) * config.pulseIntensity + 1.0;
    bubbleRef.current.scale.setScalar(config.scale * pulse);
    glowRef.current.scale.setScalar(config.scale * pulse * 1.1);
    fresnelRef.current.scale.setScalar(config.scale * pulse * 1.15);

    // Rotation
    bubbleRef.current.rotation.y += config.rotationSpeed;
    bubbleRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;

    // Minting state: additional wobble
    if (state === 'minting') {
      bubbleRef.current.position.y = Math.sin(time * 3) * 0.1;
      bubbleRef.current.rotation.z = Math.sin(time * 2) * 0.05;
    } else {
      bubbleRef.current.position.y = 0;
      bubbleRef.current.rotation.z = 0;
    }

    // Success state: gentle float up
    if (state === 'success') {
      bubbleRef.current.position.y = Math.sin(time * 1.5) * 0.2;
    }

    // Error state: shake
    if (state === 'error') {
      bubbleRef.current.position.x = Math.sin(time * 10) * 0.05;
    } else {
      bubbleRef.current.position.x = 0;
    }

    // Update glow opacity
    const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
    glowMaterial.opacity = (Math.sin(time * 2) * 0.15 + 0.35) * (state === 'minting' ? 1.5 : 1.0);
  });

  return (
    <group>
      {/* Sparkles for success state */}
      {state === 'success' && (
        <Sparkles
          ref={sparklesRef}
          count={100}
          scale={6}
          size={3}
          speed={0.5}
          color={config.color}
        />
      )}

      {/* Outer glow layer */}
      <Sphere ref={glowRef} args={[1, 32, 32]}>
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={0.35}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Fresnel glow */}
      <Sphere ref={fresnelRef} args={[1, 64, 64]}>
        <shaderMaterial
          vertexShader={fresnelVertexShader}
          fragmentShader={fresnelFragmentShader}
          uniforms={{
            glowColor: { value: new THREE.Color(config.color) },
            intensity: { value: config.emissiveIntensity },
            power: { value: 3.0 },
          }}
          transparent
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main distorting bubble */}
      <Sphere ref={bubbleRef} args={[1, 128, 128]}>
        <MeshDistortMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={config.emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
          distort={config.distortStrength}
          speed={config.distortSpeed}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Progress indicator ring for minting state */}
      {state === 'minting' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5, 0.1, 16, 100, Math.PI * 2 * progress]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Inner core particles */}
      <group>
        {Array.from({ length: state === 'minting' ? 50 : 20 }).map((_, i) => {
          const theta = (i / (state === 'minting' ? 50 : 20)) * Math.PI * 2;
          const radius = 1.5 + Math.sin(i) * 0.5;
          const x = Math.cos(theta) * radius;
          const z = Math.sin(theta) * radius;
          const y = Math.sin(i * 2) * 0.5;

          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color={config.color} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};
