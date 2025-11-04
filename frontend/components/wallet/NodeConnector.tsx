'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface NodeConnectorProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  isActive?: boolean;
  particleCount?: number;
}

export const NodeConnector: React.FC<NodeConnectorProps> = ({
  start,
  end,
  color = '#00ffff',
  isActive = true,
  particleCount = 8,
}) => {
  const lineRef = useRef<any>(null);
  const particlesRef = useRef<THREE.Group>(null);

  // Generate curved path between nodes
  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    
    // Add upward arc to the middle point
    midPoint.y += 1.5;
    
    return new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);

  // Animate line opacity and particles
  useFrame((state) => {
    if (!lineRef.current || !particlesRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Pulse line opacity
    const material = lineRef.current.material as THREE.LineBasicMaterial;
    if (isActive) {
      material.opacity = Math.sin(time * 2) * 0.15 + 0.35;
    } else {
      material.opacity = 0.1;
    }

    // Animate particles along the curve
    if (isActive) {
      particlesRef.current.children.forEach((particle, i) => {
        const offset = (time * 0.3 + i / particleCount) % 1;
        const point = curve.getPoint(offset);
        particle.position.copy(point);
        
        // Fade in/out at ends
        const fadeDistance = 0.1;
        let alpha = 1.0;
        if (offset < fadeDistance) {
          alpha = offset / fadeDistance;
        } else if (offset > 1 - fadeDistance) {
          alpha = (1 - offset) / fadeDistance;
        }
        
        (particle as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: alpha * 0.8,
        });
      });
    }
  });

  return (
    <group>
      {/* Main connection line */}
      <Line
        ref={lineRef}
        points={points}
        color={color}
        lineWidth={2}
        transparent
        opacity={0.3}
      />

      {/* Flowing particles */}
      {isActive && (
        <group ref={particlesRef}>
          {Array.from({ length: particleCount }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* Glow line overlay */}
      {isActive && (
        <Line
          points={points}
          color={color}
          lineWidth={4}
          transparent
          opacity={0.15}
        />
      )}
    </group>
  );
};
