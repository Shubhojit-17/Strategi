'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface FloatingNodeProps {
  position: [number, number, number];
  color: string;
  icon: string;
  label: string;
  onClick?: () => void;
  isSelected?: boolean;
  isActive?: boolean;
}

export const FloatingNode: React.FC<FloatingNodeProps> = ({
  position,
  color,
  icon,
  label,
  onClick,
  isSelected = false,
  isActive = true,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Pulse animation
  useFrame((state) => {
    if (!meshRef.current || !glowRef.current || !outerGlowRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Base pulse: subtle breathing effect
    const basePulse = Math.sin(time * 1.5) * 0.05 + 1.0;
    
    // Hover pulse: more pronounced when hovered
    const hoverPulse = hovered ? Math.sin(time * 3) * 0.1 + 1.1 : 1.0;
    
    // Selected pulse: constant glow when selected
    const selectedPulse = isSelected ? Math.sin(time * 2) * 0.15 + 1.15 : 1.0;
    
    // Combine pulses
    const finalPulse = basePulse * hoverPulse * selectedPulse;
    
    meshRef.current.scale.setScalar(finalPulse);
    glowRef.current.scale.setScalar(finalPulse * 1.08);
    outerGlowRef.current.scale.setScalar(finalPulse * 1.2);
    
    // Rotate slowly
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    
    // Glow intensity
    const material = glowRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = (Math.sin(time * 2) * 0.1 + 0.3) * (hovered ? 1.5 : 1.0);
    
    const outerMaterial = outerGlowRef.current.material as THREE.MeshBasicMaterial;
    outerMaterial.opacity = (Math.sin(time * 1.5) * 0.05 + 0.15) * (hovered ? 2.0 : 1.0);
  });

  const handlePointerOver = () => {
    if (isActive) {
      setHovered(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = () => {
    if (isActive && onClick) {
      onClick();
    }
  };

  return (
    <group position={position}>
      {/* Outer glow layer */}
      <Sphere ref={outerGlowRef} args={[1.2, 32, 32]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Glow layer */}
      <Sphere ref={glowRef} args={[1.08, 32, 32]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main sphere */}
      <Sphere
        ref={meshRef}
        args={[1, 64, 64]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={isActive ? 1.0 : 0.5}
        />
      </Sphere>

      {/* HTML Label */}
      <Html
        position={[0, -1.8, 0]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-4xl mb-1">{icon}</div>
          <div
            className="text-base font-medium tracking-wide"
            style={{
              color: hovered ? color : '#ffffff',
              textShadow: `0 0 ${hovered ? '12px' : '8px'} ${color}`,
              transition: 'all 0.3s ease',
            }}
          >
            {label}
          </div>
          {isSelected && (
            <motion.div
              className="text-xs text-cyan-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              ✓ Connected
            </motion.div>
          )}
          {!isActive && (
            <div className="text-xs text-gray-500">Coming Soon</div>
          )}
        </motion.div>
      </Html>

      {/* Particle ring effect when hovered */}
      {hovered && (
        <group>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 1.5;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <Sphere key={i} args={[0.02, 8, 8]} position={[x, 0, z]}>
                <meshBasicMaterial color={color} />
              </Sphere>
            );
          })}
        </group>
      )}
    </group>
  );
};
