'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Vector3, Group } from 'three';

interface ExecutionNeuronsProps {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
  particleCount?: number;
}

export const ExecutionNeurons: React.FC<ExecutionNeuronsProps> = ({ 
  status, 
  particleCount = 100 
}) => {
  const groupRef = useRef<Group>(null);
  const linesRef = useRef<any[]>([]);

  // Adjust particle density based on state
  const actualCount = useMemo(() => {
    if (status === 'processing') return particleCount * 1.5;
    if (status === 'thinking') return particleCount * 1.2;
    return particleCount;
  }, [status, particleCount]);

  // Generate neuron positions - tighter orbit for active states
  const neuronPositions = useMemo(() => {
    const positions: Vector3[] = [];
    const orbitRadius = status === 'processing' || status === 'thinking' ? 1.8 : 2.2;
    
    for (let i = 0; i < actualCount; i++) {
      const radius = Math.random() * orbitRadius + 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(new Vector3(x, y, z));
    }
    return positions;
  }, [actualCount, status]);

  // Find connections between nearby neurons
  const connections = useMemo(() => {
    const conns: Array<{ start: Vector3; end: Vector3; distance: number }> = [];
    const maxDistance = status === 'processing' ? 1.6 : status === 'thinking' ? 1.4 : 1.2;
    const maxConnections = status === 'processing' ? 180 : status === 'thinking' ? 140 : 100;

    for (let i = 0; i < neuronPositions.length && conns.length < maxConnections; i++) {
      for (let j = i + 1; j < neuronPositions.length && conns.length < maxConnections; j++) {
        const distance = neuronPositions[i].distanceTo(neuronPositions[j]);
        if (distance < maxDistance) {
          conns.push({
            start: neuronPositions[i],
            end: neuronPositions[j],
            distance,
          });
        }
      }
    }

    return conns;
  }, [neuronPositions, status]);

  // State-based colors using bioluminescent tokens
  const stateColors = useMemo(() => ({
    idle: '#82FFD2',        // plasma-accent
    thinking: '#A37CFF',    // biolight-purple
    processing: '#3CF2FF',  // core-glow
    complete: '#00FF88',    // success green
    error: '#FF3366',       // error red
  }), []);

  const stateOpacity = useMemo(() => ({
    idle: 0.12,
    thinking: 0.28,
    processing: 0.45,
    complete: 0.25,
    error: 0.18,
  }), []);

  useFrame((frameState) => {
    const time = frameState.clock.getElapsedTime();
    
    // Rotate entire group for orbital motion
    if (groupRef.current) {
      const orbitSpeed = status === 'processing' ? 0.6 : status === 'thinking' ? 0.4 : 0.15;
      groupRef.current.rotation.y = time * orbitSpeed;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    }
    
    // Animate line opacity with pulsing effect
    const pulseSpeed = status === 'processing' ? 4 : status === 'thinking' ? 3 : 2;
    linesRef.current.forEach((line, index) => {
      if (line && line.material) {
        const baseOpacity = stateOpacity[status];
        const pulse = Math.sin(time * pulseSpeed + index * 0.15) * 0.12;
        line.material.opacity = Math.max(0, baseOpacity + pulse);
      }
    });
  });

  // Show minimal drift in idle, hide in complete/error
  if (status === 'complete' || status === 'error') {
    return null;
  }

  return (
    <group ref={groupRef}>
      {connections.map((conn, index) => {
        // Vary line width based on distance and state
        const baseWidth = status === 'processing' ? 2.5 : status === 'thinking' ? 2 : 1.5;
        const lineWidth = ((1 - conn.distance / 1.6) * baseWidth) + 0.5;
        
        return (
          <Line
            key={index}
            ref={(el) => {
              if (el) linesRef.current[index] = el;
            }}
            points={[conn.start, conn.end]}
            color={stateColors[status]}
            lineWidth={lineWidth}
            transparent
            opacity={stateOpacity[status]}
          />
        );
      })}
    </group>
  );
};
