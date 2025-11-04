'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, BufferAttribute, ShaderMaterial, Vector3 } from 'three';
import { particleVertexShader, particleFragmentShader } from '@/lib/shaders/particles';
import type { AIExecutionState } from '@/lib/types';

interface ParticleSystemProps {
  state: AIExecutionState['status'];
  progress: number;
}

export default function ParticleSystem({ state, progress }: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const particleCount = 1500;

  // Generate particle positions and velocities
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Random position within sphere
      const radius = Math.random() * 2.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Random velocity
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return { positions: pos, velocities: vel };
  }, [particleCount]);

  // State-based animation speeds
  const speedMultipliers = useMemo(() => ({
    idle: 0.5,
    validating: 1.0,
    executing: 2.5,
    processing: 3.5,
    complete: 0.3,
    error: 1.0,
  }), []);

  // State-based colors
  const stateColors = useMemo(() => ({
    idle: [0.235, 0.949, 1.0],
    validating: [0.639, 0.486, 1.0],
    executing: [1.0, 0.478, 0.765],
    processing: [0.235, 0.949, 1.0],
    complete: [0.0, 1.0, 0.5],
    error: [1.0, 0.2, 0.2],
  }), []);

  useFrame((frameState) => {
    if (!materialRef.current) return;

    const time = frameState.clock.getElapsedTime();
    const speedMultiplier = speedMultipliers[state];
    const color = stateColors[state];

    // Update shader uniforms
    materialRef.current.uniforms.time.value = time;
    materialRef.current.uniforms.speedMultiplier.value = speedMultiplier;
    materialRef.current.uniforms.particleColor.value = color;

    // Vortex effect during processing
    if (state === 'processing' || state === 'executing') {
      materialRef.current.uniforms.vortexStrength.value = 0.5 + Math.sin(time * 2) * 0.3;
    } else {
      materialRef.current.uniforms.vortexStrength.value = 0.0;
    }

    // Rotation for visual interest
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.1 * speedMultiplier;
    }
  });

  // Create geometry with attributes
  const geometry = useMemo(() => {
    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(positions, 3));
    geom.setAttribute('velocity', new BufferAttribute(velocities, 3));
    return geom;
  }, [positions, velocities]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        transparent
        depthWrite={false}
        uniforms={{
          time: { value: 0 },
          speedMultiplier: { value: 1.0 },
          particleColor: { value: stateColors.idle },
          sphereRadius: { value: 3.0 },
          vortexStrength: { value: 0.0 },
          particleSize: { value: 3.0 },
        }}
      />
    </points>
  );
}
