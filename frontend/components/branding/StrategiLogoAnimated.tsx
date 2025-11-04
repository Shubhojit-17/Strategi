'use client';

import React from 'react';

interface StrategiLogoAnimatedProps {
  size?: number;
  className?: string;
  status?: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
}

export const StrategiLogoAnimated: React.FC<StrategiLogoAnimatedProps> = ({
  size = 80,
  className = '',
  status = 'idle',
}) => {
  // Dynamic animation speeds based on status
  const getRotationSpeed = () => {
    switch (status) {
      case 'processing':
        return { outer: '8s', middle: '6s', inner: '5s' };
      case 'thinking':
        return { outer: '12s', middle: '9s', inner: '7s' };
      default:
        return { outer: '20s', middle: '15s', inner: '12s' };
    }
  };

  const getPulseSpeed = () => {
    switch (status) {
      case 'processing':
        return { outer: '1.5s', middle: '1.8s', inner: '2s' };
      case 'thinking':
        return { outer: '2s', middle: '2.3s', inner: '2.5s' };
      default:
        return { outer: '3s', middle: '3.5s', inner: '4s' };
    }
  };

  const rotationSpeed = getRotationSpeed();
  const pulseSpeed = getPulseSpeed();

  return (
    <>
      <style jsx>{`
        @keyframes breathe-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }

        @keyframes orbit-rotate-cw {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbit-rotate-ccw {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes particle-shimmer {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes ring-pulse {
          0%, 100% {
            stroke-width: 1.5;
            opacity: 0.6;
          }
          50% {
            stroke-width: 3;
            opacity: 1;
          }
        }

        @keyframes ring-pulse-intense {
          0%, 100% {
            stroke-width: 2;
            opacity: 0.7;
          }
          50% {
            stroke-width: 4;
            opacity: 1;
          }
        }

        .core-bubble {
          animation: ${status === 'error' ? 'none' : 'breathe-pulse 4.5s ease-in-out infinite'};
          transform-origin: center;
        }

        .orbit-ring-outer {
          animation: ${status === 'error' ? 'none' : `orbit-rotate-cw ${rotationSpeed.outer} linear infinite, ${status === 'processing' || status === 'thinking' ? 'ring-pulse-intense' : 'ring-pulse'} ${pulseSpeed.outer} ease-in-out infinite`};
          transform-origin: center;
        }

        .orbit-ring-middle {
          animation: ${status === 'error' ? 'none' : `orbit-rotate-ccw ${rotationSpeed.middle} linear infinite, ${status === 'processing' || status === 'thinking' ? 'ring-pulse-intense' : 'ring-pulse'} ${pulseSpeed.middle} ease-in-out infinite`};
          transform-origin: center;
        }

        .orbit-ring-inner {
          animation: ${status === 'error' ? 'none' : `orbit-rotate-cw ${rotationSpeed.inner} linear infinite, ${status === 'processing' || status === 'thinking' ? 'ring-pulse-intense' : 'ring-pulse'} ${pulseSpeed.inner} ease-in-out infinite`};
          transform-origin: center;
        }

        .document-capsule {
          animation: ${status === 'error' ? 'none' : 'glow-pulse 3s ease-in-out infinite'};
        }

        .particle-glow {
          animation: ${status === 'error' ? 'none' : 'particle-shimmer 2.5s ease-in-out infinite'};
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ overflow: 'visible' }}
      >
        {/* Definitions for gradients and glows */}
        <defs>
          {/* Core glow gradient - vibrant cyan */}
          <radialGradient id="coreGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="1" />
            <stop offset="50%" stopColor="#3CF2FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.4" />
          </radialGradient>

          {/* Plasma accent gradient - vibrant teal/purple */}
          <radialGradient id="plasmaGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#00FFD4" stopOpacity="1" />
            <stop offset="100%" stopColor="#B084FF" stopOpacity="0.5" />
          </radialGradient>

          {/* Purple glow - vibrant purple/magenta */}
          <radialGradient id="purpleGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#C084FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF00FF" stopOpacity="0.3" />
          </radialGradient>

          {/* Soft blur for glow effect */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Strong glow for core */}
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer orbit ring (slowest, clockwise) */}
        <g className="orbit-ring-outer">
          <ellipse
            cx="100"
            cy="100"
            rx="85"
            ry="75"
            stroke="#C084FF"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
            filter="url(#softGlow)"
          />
          {/* Orbital particles */}
          <circle cx="185" cy="100" r="2.5" fill="#C084FF" className="particle-glow" />
          <circle cx="15" cy="100" r="2.5" fill="#00FFD4" className="particle-glow" />
        </g>

        {/* Middle orbit ring (counter-clockwise) */}
        <g className="orbit-ring-middle">
          <ellipse
            cx="100"
            cy="100"
            rx="70"
            ry="62"
            stroke="#00FFFF"
            strokeWidth="1.5"
            fill="none"
            opacity="0.7"
            filter="url(#softGlow)"
            transform="rotate(45 100 100)"
          />
          {/* Orbital particles */}
          <circle cx="160" cy="80" r="2.5" fill="#00FFFF" className="particle-glow" />
          <circle cx="40" cy="120" r="2.5" fill="#C084FF" className="particle-glow" />
        </g>

        {/* Inner orbit ring (faster, clockwise) */}
        <g className="orbit-ring-inner">
          <ellipse
            cx="100"
            cy="100"
            rx="55"
            ry="50"
            stroke="#00FFD4"
            strokeWidth="1.5"
            fill="none"
            opacity="0.8"
            filter="url(#softGlow)"
            transform="rotate(-30 100 100)"
          />
          {/* Orbital particles */}
          <circle cx="145" cy="110" r="2.5" fill="#00FFD4" className="particle-glow" />
          <circle cx="55" cy="90" r="2.5" fill="#00FFFF" className="particle-glow" />
        </g>

        {/* Core bubble with breathing animation */}
        <g className="core-bubble">
          {/* Main bubble body */}
          <circle
            cx="100"
            cy="100"
            r="38"
            fill="url(#plasmaGlow)"
            opacity="0.8"
            filter="url(#softGlow)"
          />

          {/* Inner glow */}
          <circle
            cx="100"
            cy="100"
            r="35"
            fill="url(#purpleGlow)"
            opacity="0.6"
          />

          {/* Bubble rim highlight */}
          <circle
            cx="100"
            cy="100"
            r="38"
            stroke="#00FFFF"
            strokeWidth="2"
            fill="none"
            opacity="0.9"
          />
        </g>

        {/* Document capsule inside (with glow pulse) */}
        <g className="document-capsule" transform="translate(100, 100)">
          {/* Capsule background glow */}
          <rect
            x="-18"
            y="-12"
            width="36"
            height="24"
            rx="12"
            fill="#00FFFF"
            opacity="0.2"
            filter="url(#softGlow)"
          />

          {/* Capsule body */}
          <rect
            x="-16"
            y="-10"
            width="32"
            height="20"
            rx="10"
            fill="#82FFD2"
            opacity="0.5"
            stroke="#3CF2FF"
            strokeWidth="1"
          />

          {/* Document lines */}
          <line
            x1="-10"
            y1="-5"
            x2="10"
            y2="-5"
            stroke="#3CF2FF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
          <line
            x1="-10"
            y1="0"
            x2="10"
            y2="0"
            stroke="#3CF2FF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
          <line
            x1="-10"
            y1="5"
            x2="5"
            y2="5"
            stroke="#3CF2FF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* Ambient particle field */}
        <g opacity="0.3">
          <circle cx="30" cy="40" r="1.5" fill="#82FFD2" className="particle-glow" />
          <circle cx="170" cy="60" r="1" fill="#A37CFF" className="particle-glow" />
          <circle cx="45" cy="160" r="1.5" fill="#3CF2FF" className="particle-glow" />
          <circle cx="155" cy="145" r="1" fill="#82FFD2" className="particle-glow" />
          <circle cx="120" cy="30" r="1" fill="#A37CFF" className="particle-glow" />
          <circle cx="80" cy="175" r="1.5" fill="#3CF2FF" className="particle-glow" />
        </g>
      </svg>
    </>
  );
};

export default StrategiLogoAnimated;
