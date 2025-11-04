'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface UploadBubbleProps {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number; // 0-100
}

// Fresnel shader for glow effect
const fresnelVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fresnelFragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), power);
    vec3 color = glowColor * fresnel * intensity;
    gl_FragColor = vec4(color, fresnel * 0.8);
  }
`;

// Ripple shader for upload effect
const rippleVertexShader = `
  uniform float time;
  uniform float progress;
  varying vec2 vUv;
  varying float vDisplacement;
  
  void main() {
    vUv = uv;
    vec3 newPosition = position;
    
    // Create ripples based on progress
    float ripple = sin(position.y * 10.0 + time * 5.0 - progress * 20.0) * 0.05;
    newPosition += normal * ripple * (1.0 - progress);
    
    vDisplacement = ripple;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const rippleFragmentShader = `
  uniform vec3 color;
  uniform float progress;
  varying vec2 vUv;
  varying float vDisplacement;
  
  void main() {
    vec3 baseColor = color;
    float intensity = 1.0 - abs(vDisplacement) * 5.0;
    vec3 finalColor = baseColor * intensity;
    
    // Add progress gradient
    float gradient = smoothstep(0.0, 1.0, vUv.y + (1.0 - progress));
    finalColor *= gradient;
    
    gl_FragColor = vec4(finalColor, 0.9);
  }
`;

export const UploadBubble: React.FC<UploadBubbleProps> = ({
  status,
  progress = 0,
}) => {
  const mainSphereRef = useRef<THREE.Mesh>(null);
  const fresnelRef = useRef<THREE.Mesh>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const sparklesRef = useRef<THREE.Points>(null);
  
  // Get color based on status
  const getColor = () => {
    switch (status) {
      case 'uploading':
        return new THREE.Color(0x60a5fa); // Blue
      case 'success':
        return new THREE.Color(0x34d399); // Green
      case 'error':
        return new THREE.Color(0xef4444); // Red
      default:
        return new THREE.Color(0x8b5cf6); // Purple
    }
  };

  const color = getColor();

  // Sparkles for success state
  const sparkles = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 1.5 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  // Animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (mainSphereRef.current) {
      // Gentle rotation
      mainSphereRef.current.rotation.y = time * 0.2;
      
      // Pulse animation
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      mainSphereRef.current.scale.setScalar(pulse);

      // Error shake
      if (status === 'error') {
        const shake = Math.sin(time * 20) * 0.02;
        mainSphereRef.current.position.x = shake;
      } else {
        mainSphereRef.current.position.x = 0;
      }
    }

    if (fresnelRef.current) {
      fresnelRef.current.rotation.y = time * 0.3;
      
      // Pulsing glow
      const material = fresnelRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.intensity.value = 2 + Math.sin(time * 3) * 0.5;
      }
    }

    if (rippleRef.current && status === 'uploading') {
      const material = rippleRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.time.value = time;
        material.uniforms.progress.value = progress / 100;
      }
    }

    if (sparklesRef.current && status === 'success') {
      sparklesRef.current.rotation.y = time * 0.5;
      
      // Expand sparkles outward
      const scale = 1 + (time % 2) * 0.5;
      sparklesRef.current.scale.setScalar(scale);
      
      const material = sparklesRef.current.material as THREE.PointsMaterial;
      material.opacity = 1 - ((time % 2) / 2);
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
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Fresnel glow */}
      <Sphere ref={fresnelRef} args={[1.1, 64, 64]}>
        <shaderMaterial
          vertexShader={fresnelVertexShader}
          fragmentShader={fresnelFragmentShader}
          uniforms={{
            glowColor: { value: color },
            intensity: { value: 2 },
            power: { value: 3 },
          }}
          transparent
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Ripple effect during upload */}
      {status === 'uploading' && (
        <Sphere ref={rippleRef} args={[1.2, 64, 64]}>
          <shaderMaterial
            vertexShader={rippleVertexShader}
            fragmentShader={rippleFragmentShader}
            uniforms={{
              time: { value: 0 },
              progress: { value: progress / 100 },
              color: { value: color },
            }}
            transparent
            side={THREE.DoubleSide}
          />
        </Sphere>
      )}

      {/* Success sparkles */}
      {status === 'success' && (
        <points ref={sparklesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkles.length / 3}
              array={sparkles}
              itemSize={3}
              args={[sparkles, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            color={0xfbbf24}
            transparent
            opacity={1}
            sizeAttenuation
          />
        </points>
      )}
    </group>
  );
};
