'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, Lock } from 'iconoir-react';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  route: string;
  status: 'completed' | 'active' | 'locked';
  angle: number;
  distance: number;
}

interface RadialMenuItemProps {
  item: MenuItem;
  index: number;
}

export const RadialMenuItem: React.FC<RadialMenuItemProps> = ({ item, index }) => {
  const router = useRouter();
  
  const isLocked = item.status === 'locked';
  
  // Calculate position based on angle and distance from center
  const x = Math.cos(item.angle) * item.distance;
  const y = Math.sin(item.angle) * item.distance;

  const handleClick = () => {
    if (!isLocked) {
      router.push(item.route);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x,
        y: [y - 3, y + 3, y - 3],
      }}
      whileHover={!isLocked ? {
        scale: 1.1,
        filter: "drop-shadow(0 0 25px var(--core-glow))",
      } : {}}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.15,
        y: {
          duration: 3.5 + index * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        }
      }}
      onClick={handleClick}
      className={`absolute cursor-pointer ${isLocked ? 'opacity-60' : ''}`}
      style={{
        left: '50%',
        top: '50%',
      }}
    >
      <div
        className="relative px-6 py-4 rounded-full backdrop-blur-md border transform -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'linear-gradient(135deg, rgba(60, 242, 255, 0.08), rgba(163, 124, 255, 0.08))',
          borderColor: item.status === 'completed' 
            ? 'rgba(0, 255, 136, 0.4)' 
            : item.status === 'active'
            ? 'rgba(60, 242, 255, 0.4)'
            : 'rgba(107, 114, 128, 0.3)',
          boxShadow: `0 0 25px ${
            item.status === 'completed' 
              ? 'rgba(0, 255, 136, 0.15)' 
              : 'rgba(60, 242, 255, 0.15)'
          }`,
          minWidth: '220px',
        }}
      >
        {/* Status Badge */}
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs"
          style={{
            backgroundColor: item.status === 'completed' 
              ? 'rgba(0, 255, 136, 0.2)' 
              : item.status === 'active'
              ? 'rgba(60, 242, 255, 0.2)'
              : 'rgba(107, 114, 128, 0.2)',
            borderColor: item.status === 'completed' 
              ? '#00FF88' 
              : item.status === 'active'
              ? '#3CF2FF'
              : '#6B7280',
            color: item.status === 'completed' 
              ? '#00FF88' 
              : item.status === 'active'
              ? '#3CF2FF'
              : '#6B7280',
          }}
        >
          {item.status === 'completed' ? (
            <Check className="w-3 h-3" strokeWidth={3} />
          ) : item.status === 'locked' ? (
            <Lock className="w-3 h-3" strokeWidth={2.5} />
          ) : (
            '○'
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-cyan-400">
            <item.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{item.title}</h3>
            <p className="text-gray-400 text-xs">{item.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
