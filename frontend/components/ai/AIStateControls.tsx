'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface AIStateControlsProps {
  onTogglePerformance?: () => void;
}

export default function AIStateControls({ onTogglePerformance }: AIStateControlsProps) {
  const { aiState, setAIState } = useAppStore();

  const states: Array<typeof aiState.status> = [
    'idle',
    'validating',
    'executing',
    'processing',
    'complete',
    'error',
  ];

  const stateDescriptions = {
    idle: 'Ready and waiting',
    validating: 'Checking credentials',
    executing: 'Starting AI execution',
    processing: 'Processing your request',
    complete: 'Successfully completed',
    error: 'An error occurred',
  };

  const handleStateChange = (status: typeof aiState.status) => {
    setAIState({
      status,
      progress: status === 'processing' ? 50 : 0,
      currentStep: stateDescriptions[status],
      result: null,
      error: status === 'error' ? 'Sample error message' : null,
    });
  };

  const handleAutoDemo = () => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= states.length) {
        clearInterval(interval);
        handleStateChange('idle');
        return;
      }
      handleStateChange(states[currentIndex]);
      currentIndex++;
    }, 3000);
  };

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-2xl">
      <div className="glass-panel p-6 mx-4">
        <h3 className="text-neon-aqua font-semibold mb-4 text-center">
          AI Bubble State Controls
        </h3>
        
        {/* State buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {states.map((state) => (
            <AnimatedButton
              key={state}
              onClick={() => handleStateChange(state)}
              variant={aiState.status === state ? 'primary' : 'secondary'}
              size="sm"
              className="capitalize"
            >
              {state}
            </AnimatedButton>
          ))}
        </div>

        {/* Auto demo button */}
        <AnimatedButton
          onClick={handleAutoDemo}
          variant="primary"
          className="w-full"
        >
          ▶ Auto Demo All States
        </AnimatedButton>

        {/* Performance toggle */}
        {onTogglePerformance && (
          <AnimatedButton
            onClick={onTogglePerformance}
            variant="ghost"
            size="sm"
            className="w-full mt-2"
          >
            📊 Toggle Performance Stats
          </AnimatedButton>
        )}

        {/* Current state info */}
        <div className="mt-4 text-center text-sm text-soft-purple/70">
          Current: <span className="text-neon-aqua font-medium">{aiState.status}</span>
          {aiState.status === 'processing' && (
            <span className="ml-2">({aiState.progress}%)</span>
          )}
        </div>
      </div>
    </div>
  );
}
