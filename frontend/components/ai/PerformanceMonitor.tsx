'use client';

import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memory?: number;
}

export function PerformanceMonitor({ onMetrics }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
  });

  const fpsRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Calculate FPS
    const currentFps = 1000 / delta;
    fpsRef.current.push(currentFps);

    // Keep only last 60 frames
    if (fpsRef.current.length > 60) {
      fpsRef.current.shift();
    }

    // Update metrics every 60 frames
    if (fpsRef.current.length === 60) {
      const avgFps = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
      const avgFrameTime = 1000 / avgFps;

      const newMetrics: PerformanceMetrics = {
        fps: Math.round(avgFps),
        frameTime: parseFloat(avgFrameTime.toFixed(2)),
      };

      // Add memory if available
      if ((performance as any).memory) {
        newMetrics.memory = Math.round(
          (performance as any).memory.usedJSHeapSize / 1048576
        );
      }

      setMetrics(newMetrics);
      if (onMetrics) onMetrics(newMetrics);
    }
  });

  return null;
}

export function PerformanceDisplay() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
  });

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute top-4 right-4 glass-panel p-3 text-xs font-mono">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-3">
          <span className="text-neon-aqua/70">FPS:</span>
          <span className={getFpsColor(metrics.fps)}>{metrics.fps}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-neon-aqua/70">Frame:</span>
          <span className="text-soft-purple">{metrics.frameTime}ms</span>
        </div>
        {metrics.memory && (
          <div className="flex justify-between gap-3">
            <span className="text-neon-aqua/70">Memory:</span>
            <span className="text-soft-purple">{metrics.memory}MB</span>
          </div>
        )}
      </div>
      
      <PerformanceMonitor onMetrics={setMetrics} />
    </div>
  );
}
