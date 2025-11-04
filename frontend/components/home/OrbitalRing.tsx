'use client';

import React from 'react';

interface OrbitalRingProps {
  size: string;
  tiltX: string;
  tiltY: string;
  opacity?: number;
}

export const OrbitalRing: React.FC<OrbitalRingProps> = ({
  size,
  tiltX,
  tiltY,
  opacity = 0.35,
}) => {
  return (
    <div
      className="orbital-ring"
      style={{
        '--ring-size': size,
        '--tilt-x': tiltX,
        '--tilt-y': tiltY,
        '--ring-opacity': opacity,
      } as React.CSSProperties}
    >
      <div className="ring-layer" />
      
      <style jsx>{`
        .orbital-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: var(--ring-size);
          height: var(--ring-size);
          transform-style: preserve-3d;
          transform: translate(-50%, -50%) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
          pointer-events: none;
        }

        .ring-layer {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(130, 255, 210, var(--ring-opacity));
          filter: drop-shadow(0 0 12px rgba(60, 242, 255, 0.3));
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};
