'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleStream } from './ParticleStream';
import { StrategiLogoAnimated } from '../branding/StrategiLogoAnimated';

interface ExecutionBubbleProps {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
}

// Bioluminescent color tokens
const COLORS = {
  coreGlow: new THREE.Color('#3CF2FF'),
  plasmaAccent: new THREE.Color('#82FFD2'),
  biolightPurple: new THREE.Color('#A37CFF'),
  errorRed: new THREE.Color('#FF3366'),
  completeGreen: new THREE.Color('#00FF88'),
};

export const ExecutionBubble: React.FC<ExecutionBubbleProps> = ({ status }) => {
  const mainSphereRef = useRef<THREE.Group>(null);
  const [completePulse, setCompletePulse] = useState(false);
  const [errorRipple, setErrorRipple] = useState(false);

  // Trigger effects on state changes
  useEffect(() => {
    if (status === 'complete') {
      setCompletePulse(true);
      setTimeout(() => setCompletePulse(false), 1000);
    }
    if (status === 'error') {
      setErrorRipple(true);
      setTimeout(() => setErrorRipple(false), 1500);
    }
  }, [status]);

  // Get color based on status
  const getColor = () => {
    switch (status) {
      case 'thinking':
        return COLORS.biolightPurple;
      case 'processing':
        return COLORS.coreGlow;
      case 'complete':
        return COLORS.completeGreen;
      case 'error':
        return COLORS.errorRed;
      default:
        return COLORS.plasmaAccent;
    }
  };

  const color = getColor();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (mainSphereRef.current) {
      // Rotation speed varies by state
      const rotationSpeed = status === 'processing' ? 0.5 : status === 'thinking' ? 0.4 : status === 'error' ? 0.1 : 0.2;
      mainSphereRef.current.rotation.y = time * rotationSpeed;

      // Scale animation based on status - ALL STATES MAINTAIN SAME AVERAGE SIZE
      let scale = 1;
      
      if (status === 'idle') {
        // Slow breathing pulse (0.96 to 1.04)
        scale = 1 + Math.sin(time * 1.5) * 0.04;
      } else if (status === 'thinking') {
        // Medium distortion pulse (0.92 to 1.08)
        scale = 1 + Math.sin(time * 3) * 0.08;
      } else if (status === 'processing') {
        // Faster intense pulse (0.88 to 1.12)
        scale = 1 + Math.sin(time * 4.5) * 0.12;
      } else if (status === 'complete' && completePulse) {
        // Expansion pulse on completion
        const pulseProgress = (time % 1) * 1.5;
        scale = 1 + Math.min(pulseProgress, 1) * 0.3;
      } else if (status === 'complete') {
        scale = 1.15; // Slightly larger when complete
      } else if (status === 'error') {
        // ERROR: FIXED at exactly 1.0 - no pulsing to prevent any size change
        scale = 1.0;
      }
      
      mainSphereRef.current.scale.setScalar(scale);

      // Error shake
      if (status === 'error' && errorRipple) {
        mainSphereRef.current.position.x = Math.sin(time * 25) * 0.05;
        mainSphereRef.current.position.y = Math.cos(time * 25) * 0.05;
      } else {
        mainSphereRef.current.position.x = 0;
        mainSphereRef.current.position.y = 0;
      }
    }
  });

  return (
    <group ref={mainSphereRef}>
      {/* Large logo as the main bubble */}
      <Html
        center
        distanceFactor={1}
        style={{
          width: '400px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: `drop-shadow(0 0 ${status === 'processing' ? '40px' : status === 'thinking' ? '30px' : status === 'error' ? '25px' : '20px'} ${color})`,
          }}
        >
          <StrategiLogoAnimated size={400} status={status} />
        </div>
      </Html>

      {/* Particle stream - becomes stable when complete */}
      <ParticleStream status={status} particleCount={150} />

      {/* Error ripple shockwave */}
      {status === 'error' && errorRipple && (
        <>
          <Sphere args={[1.5, 32, 32]}>
            <meshStandardMaterial
              color={COLORS.errorRed}
              transparent
              opacity={0.3}
              wireframe
            />
          </Sphere>
          <Sphere args={[1.8, 32, 32]}>
            <meshStandardMaterial
              color={COLORS.biolightPurple}
              transparent
              opacity={0.2}
              wireframe
            />
          </Sphere>
        </>
      )}
    </group>
  );
};
