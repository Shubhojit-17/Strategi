'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';
import { fresnelVertexShader, fresnelFragmentShader } from '@/lib/shaders/fresnel';

interface BubbleExpansionProps {
  onComplete: () => void;
}

export default function BubbleExpansion({ onComplete }: BubbleExpansionProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const startTime = useRef(Date.now());
  const duration = 2000; // 2 seconds

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth easing function (ease-out-cubic)
    const eased = 1 - Math.pow(1 - progress, 3);

    // Scale from 0.1 to 8 (fills screen)
    const scale = 0.1 + eased * 7.9;
    meshRef.current.scale.set(scale, scale, scale);

    // Fade out opacity near the end
    const opacity = progress < 0.8 ? 1 : 1 - ((progress - 0.8) / 0.2);
    materialRef.current.uniforms.opacity.value = opacity;

    // Increase glow intensity as it expands
    materialRef.current.uniforms.glowIntensity.value = 1 + eased * 2;

    // Complete when animation finishes
    if (progress >= 1) {
      onComplete();
    }
  });

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Point light for bubble highlight */}
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#3CF2FF" />

      {/* Expanding bubble sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={fresnelVertexShader}
          fragmentShader={fresnelFragmentShader}
          transparent
          uniforms={{
            glowColor: { value: [0.235, 0.949, 1.0] }, // Neon aqua
            fresnelPower: { value: 3.0 },
            glowIntensity: { value: 1.0 },
            opacity: { value: 1.0 }
          }}
        />
      </mesh>
    </>
  );
}
