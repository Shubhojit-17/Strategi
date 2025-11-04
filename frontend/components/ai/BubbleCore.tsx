'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import { Mesh, ShaderMaterial } from 'three';
import { fresnelVertexShader, fresnelFragmentShader } from '@/lib/shaders/fresnel';
import type { AIExecutionState } from '@/lib/types';

interface BubbleCoreProps {
  state: AIExecutionState['status'];
}

export default function BubbleCore({ state }: BubbleCoreProps) {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const fresnelRef = useRef<ShaderMaterial>(null);

  // State-based color configurations
  const stateColors = useMemo(() => ({
    idle: [0.235, 0.949, 1.0], // Neon aqua
    validating: [0.639, 0.486, 1.0], // Soft purple
    executing: [1.0, 0.478, 0.765], // Subtle pink
    processing: [0.235, 0.949, 1.0], // Neon aqua
    complete: [0.0, 1.0, 0.5], // Success green
    error: [1.0, 0.2, 0.2], // Error red
  }), []);

  // Animation parameters based on state
  const stateParams = useMemo(() => ({
    idle: { distort: 0.2, speed: 0.5, fresnelPower: 3.0, glowIntensity: 1.0 },
    validating: { distort: 0.3, speed: 1.0, fresnelPower: 2.5, glowIntensity: 1.5 },
    executing: { distort: 0.5, speed: 2.0, fresnelPower: 2.0, glowIntensity: 2.0 },
    processing: { distort: 0.6, speed: 3.0, fresnelPower: 1.8, glowIntensity: 2.5 },
    complete: { distort: 0.1, speed: 0.3, fresnelPower: 3.5, glowIntensity: 3.0 },
    error: { distort: 0.4, speed: 1.5, fresnelPower: 2.8, glowIntensity: 1.2 },
  }), []);

  const currentColor = stateColors[state];
  const currentParams = stateParams[state];

  useFrame((state) => {
    if (!meshRef.current || !fresnelRef.current) return;

    const time = state.clock.getElapsedTime();

    // Gentle rotation
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;

    // Breathing scale animation
    const breathScale = 1 + Math.sin(time * currentParams.speed) * 0.05;
    meshRef.current.scale.set(breathScale, breathScale, breathScale);

    // Update fresnel shader uniforms
    fresnelRef.current.uniforms.glowColor.value = currentColor;
    fresnelRef.current.uniforms.fresnelPower.value = currentParams.fresnelPower;
    fresnelRef.current.uniforms.glowIntensity.value = currentParams.glowIntensity;

    // Outer glow sync
    if (glowRef.current) {
      glowRef.current.rotation.y = -time * 0.05;
      const glowScale = breathScale * 1.1;
      glowRef.current.scale.set(glowScale, glowScale, glowScale);
    }
  });

  return (
    <group>
      {/* Main distorted bubble */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 128, 128]} />
        <MeshDistortMaterial
          color={`rgb(${currentColor[0] * 255}, ${currentColor[1] * 255}, ${currentColor[2] * 255})`}
          transparent
          opacity={0.3}
          distort={currentParams.distort}
          speed={currentParams.speed}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Fresnel edge glow layer */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3.08, 128, 128]} />
        <shaderMaterial
          ref={fresnelRef}
          vertexShader={fresnelVertexShader}
          fragmentShader={fresnelFragmentShader}
          transparent
          uniforms={{
            glowColor: { value: currentColor },
            fresnelPower: { value: currentParams.fresnelPower },
            glowIntensity: { value: currentParams.glowIntensity },
            opacity: { value: 1.0 },
          }}
        />
      </mesh>

      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.3, 64, 64]} />
        <meshBasicMaterial
          color={`rgb(${currentColor[0] * 255}, ${currentColor[1] * 255}, ${currentColor[2] * 255})`}
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}
