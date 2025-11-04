'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import type { AIExecutionState } from '@/lib/types';

interface ParticleNeuronsProps {
  state: AIExecutionState['status'];
  particleCount?: number;
}

export default function ParticleNeurons({ state, particleCount = 100 }: ParticleNeuronsProps) {
  const linesRef = useRef<any[]>([]);

  // Generate neuron positions
  const neuronPositions = useMemo(() => {
    const positions: Vector3[] = [];
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(new Vector3(x, y, z));
    }
    return positions;
  }, [particleCount]);

  // Find connections between nearby neurons
  const connections = useMemo(() => {
    const conns: Array<{ start: Vector3; end: Vector3; distance: number }> = [];
    const maxDistance = state === 'processing' || state === 'executing' ? 1.5 : 1.2;
    const maxConnections = state === 'processing' ? 150 : 100;

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
  }, [neuronPositions, state]);

  // State-based colors and opacity
  const stateColors = useMemo(() => ({
    idle: '#3CF2FF',
    validating: '#A37CFF',
    executing: '#FF7AC3',
    processing: '#3CF2FF',
    complete: '#00FF80',
    error: '#FF3333',
  }), []);

  const stateOpacity = useMemo(() => ({
    idle: 0.15,
    validating: 0.25,
    executing: 0.4,
    processing: 0.5,
    complete: 0.3,
    error: 0.2,
  }), []);

  useFrame((frameState) => {
    const time = frameState.clock.getElapsedTime();
    
    // Animate line opacity with pulsing effect
    linesRef.current.forEach((line, index) => {
      if (line && line.material) {
        const baseOpacity = stateOpacity[state];
        const pulse = Math.sin(time * 2 + index * 0.1) * 0.1;
        line.material.opacity = baseOpacity + pulse;
      }
    });
  });

  if (state === 'idle' || state === 'complete') {
    return null; // Hide connections in idle/complete states
  }

  return (
    <group>
      {connections.map((conn, index) => {
        // Vary line width based on distance (closer = thicker)
        const lineWidth = (1 - conn.distance / 1.5) * 2 + 0.5;
        
        return (
          <Line
            key={index}
            ref={(el) => {
              if (el) linesRef.current[index] = el;
            }}
            points={[conn.start, conn.end]}
            color={stateColors[state]}
            lineWidth={lineWidth}
            transparent
            opacity={stateOpacity[state]}
          />
        );
      })}
    </group>
  );
}
