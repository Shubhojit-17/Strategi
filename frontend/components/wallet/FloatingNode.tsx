'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingNodeProps {
  icon: string;
  label: string;
  onClick?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const FloatingNode: React.FC<FloatingNodeProps> = ({
  icon,
  label,
  onClick,
  isLoading = false,
  isDisabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // CSS variables for bioluminescent theme
  const coreGlow = '#3CF2FF';
  const plasmaAccent = '#82FFD2';
  const deepOcean = '#0F1423';
  const biolightPurple = '#A37CFF';

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Animated floating effect */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: isHovered ? 3 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className="relative w-32 h-32 cursor-pointer"
        style={{
          pointerEvents: isDisabled ? 'none' : 'auto',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isHovered
              ? `0 0 40px ${coreGlow}, 0 0 60px ${plasmaAccent}, inset 0 0 20px ${biolightPurple}`
              : `0 0 20px ${coreGlow}, 0 0 40px ${plasmaAccent}`,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${plasmaAccent}20, ${deepOcean})`,
            border: `2px solid ${coreGlow}`,
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* Middle glass layer */}
        <motion.div
          className="absolute inset-1 rounded-full pointer-events-none"
          animate={{
            opacity: isHovered ? 0.8 : 0.5,
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: `linear-gradient(135deg, ${plasmaAccent}30, ${biolightPurple}20)`,
            border: `1px solid ${plasmaAccent}`,
            boxShadow: `inset 0 1px 10px ${coreGlow}40`,
          }}
        />

        {/* Inner core */}
        <motion.div
          className="absolute inset-3 rounded-full flex items-center justify-center"
          animate={{
            scale: isHovered ? 1.1 : 1,
            boxShadow: isHovered
              ? `0 0 20px ${coreGlow}, inset 0 0 15px ${plasmaAccent}`
              : `0 0 10px ${coreGlow}, inset 0 0 10px ${plasmaAccent}40`,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background: `radial-gradient(circle, ${coreGlow}20, ${deepOcean}80)`,
            border: `1px solid ${coreGlow}`,
          }}
        >
          {/* Icon */}
          <motion.div
            className="text-5xl"
            animate={{
              scale: isLoading ? [1, 1.1, 1] : isHovered ? 1.2 : 1,
              rotate: isLoading ? 360 : 0,
            }}
            transition={{
              scale: { duration: 0.3 },
              rotate: {
                duration: 2,
                repeat: isLoading ? Infinity : 0,
                ease: 'linear',
              },
            }}
          >
            {icon}
          </motion.div>
        </motion.div>

        {/* Pulse ripple on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              border: `2px solid ${plasmaAccent}`,
              boxShadow: `0 0 15px ${plasmaAccent}`,
            }}
          />
        )}
      </motion.div>

      {/* Label below node */}
      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div
          className="text-sm font-semibold tracking-wide"
          style={{
            color: isHovered ? coreGlow : plasmaAccent,
            textShadow: isHovered
              ? `0 0 10px ${coreGlow}, 0 0 5px ${plasmaAccent}`
              : `0 0 5px ${coreGlow}`,
            transition: 'all 0.3s ease',
          }}
        >
          {label}
        </div>

        {isLoading && (
          <motion.div
            className="text-xs mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ color: plasmaAccent }}
          >
            Connecting...
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FloatingNode;
