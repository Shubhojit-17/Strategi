'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';

interface BurstWaveProps {
  trigger: boolean;
  onComplete?: () => void;
}

const burstVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const burstFragmentShader = `
uniform float time;
uniform float intensity;
uniform vec3 color;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  float dist = length(vPosition);
  
  // Create expanding wave
  float wave = abs(sin((dist - time * 3.0) * 5.0));
  wave = pow(wave, 3.0);
  
  // Fade out over time and with distance
  float alpha = intensity * wave * (1.0 - time / 2.0);
  alpha *= smoothstep(5.0, 2.0, dist);
  
  gl_FragColor = vec4(color, alpha);
}
`;

export default function BurstWave({ trigger, onComplete }: BurstWaveProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (trigger && !isAnimatingRef.current) {
      startTimeRef.current = Date.now();
      isAnimatingRef.current = true;
    }
  }, [trigger]);

  useFrame(() => {
    if (!isAnimatingRef.current || !materialRef.current || !meshRef.current) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const duration = 2.0; // 2 seconds

    if (elapsed >= duration) {
      // Animation complete
      isAnimatingRef.current = false;
      materialRef.current.uniforms.intensity.value = 0;
      if (onComplete) onComplete();
      return;
    }

    // Update uniforms
    materialRef.current.uniforms.time.value = elapsed;
    materialRef.current.uniforms.intensity.value = 1.0 - (elapsed / duration);

    // Scale up the burst sphere
    const scale = 1 + elapsed * 2;
    meshRef.current.scale.set(scale, scale, scale);
  });

  if (!trigger && !isAnimatingRef.current) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={burstVertexShader}
        fragmentShader={burstFragmentShader}
        transparent
        depthWrite={false}
        uniforms={{
          time: { value: 0 },
          intensity: { value: 1.0 },
          color: { value: [0.0, 1.0, 0.5] }, // Success green
        }}
      />
    </mesh>
  );
}
