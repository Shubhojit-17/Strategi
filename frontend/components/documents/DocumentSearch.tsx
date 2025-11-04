'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search documents...',
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Search icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </div>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`
          w-full py-3 pl-12 pr-12 
          bg-gray-900/50 backdrop-blur-sm
          border-2 rounded-lg
          text-white placeholder-gray-500
          transition-all duration-300
          focus:outline-none
          ${
            isFocused
              ? 'border-primary-light shadow-lg shadow-primary-light/20'
              : 'border-gray-700 hover:border-gray-600'
          }
        `}
      />

      {/* Clear button */}
      <AnimatePresence>
        {localValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            title="Clear search"
          >
            ✕
          </motion.button>
        )}
      </AnimatePresence>

      {/* Focus glow effect */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-lg bg-primary-light/5 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
