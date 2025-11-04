'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { StrategiLogoAnimated } from '@/components/branding/StrategiLogoAnimated';

interface BubbleLogoProps {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
}

export const BubbleLogo: React.FC<BubbleLogoProps> = ({ status }) => {
  const htmlRef = useRef<any>(null);

  useFrame((state) => {
    if (htmlRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Gentle rotation based on status
      const rotationSpeed = status === 'processing' ? 0.3 : status === 'thinking' ? 0.2 : 0.1;
      
      // Apply subtle rotation to the HTML container
      if (htmlRef.current.children[0]) {
        htmlRef.current.children[0].style.transform = `rotate(${time * rotationSpeed * 50}deg)`;
      }
    }
  });

  return (
    <Html
      ref={htmlRef}
      center
      distanceFactor={1}
      zIndexRange={[0, 0]}
      transform
      sprite
    >
      <div style={{ 
        transform: 'scale(0.8)',
        filter: 'drop-shadow(0 0 10px rgba(60, 242, 255, 0.5))'
      }}>
        <StrategiLogoAnimated size={100} />
      </div>
    </Html>
  );
};
