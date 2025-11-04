'use client';

import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { LoadingSpinner } from './Loading';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glowing?: boolean;
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  glowing = false,
  className,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#3CF2FF] to-[#A37CFF] text-white font-semibold',
    secondary: 'bg-[rgba(60,242,255,0.1)] border-2 border-[#3CF2FF] text-[#3CF2FF] font-semibold',
    ghost: 'bg-transparent text-[#3CF2FF] hover:bg-[rgba(60,242,255,0.1)]'
  };

  const glowStyle = glowing
    ? { boxShadow: '0 0 30px rgba(60, 242, 255, 0.6)' }
    : {};

  const Component = motion.button;
  
  return (
    <Component
      className={cn(
        'rounded-full transition-all duration-300 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      style={glowStyle}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      disabled={disabled || loading}
      onClick={props.onClick}
      type={props.type}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" className="text-white" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </Component>
  );
}
