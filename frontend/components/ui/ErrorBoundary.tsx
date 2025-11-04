'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';
import AnimatedButton from '../ui/AnimatedButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <GlassPanel className="p-8">
              {/* Error Icon */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-3xl font-bold mb-2 text-red-300">
                  Something went wrong
                </h1>
                <p className="text-gray-400">
                  We encountered an unexpected error. Don't worry, you can try again.
                </p>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6">
                  <details className="bg-gray-900/50 rounded-lg p-4 border border-red-500/30">
                    <summary className="text-red-300 font-semibold cursor-pointer mb-2">
                      Error Details
                    </summary>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-400 font-semibold">Message:</p>
                        <p className="text-red-300 font-mono">
                          {this.state.error.message}
                        </p>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <p className="text-gray-400 font-semibold">Stack:</p>
                          <pre className="text-xs text-gray-400 overflow-auto max-h-40 whitespace-pre-wrap font-mono">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo && (
                        <div>
                          <p className="text-gray-400 font-semibold">Component Stack:</p>
                          <pre className="text-xs text-gray-400 overflow-auto max-h-40 whitespace-pre-wrap font-mono">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <AnimatedButton onClick={this.handleReset}>
                  🔄 Try Again
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => (window.location.href = '/')}
                  variant="ghost"
                >
                  🏠 Go Home
                </AnimatedButton>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onReset?: () => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onReset={onReset}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
