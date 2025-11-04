// Device detection utilities
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const isMobile = (): boolean => {
  return getDeviceType() === 'mobile';
};

export const isTablet = (): boolean => {
  return getDeviceType() === 'tablet';
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// WebGL detection
export const hasWebGLSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

export const hasWebGL2Support = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch (e) {
    return false;
  }
};

// Performance-based particle count
export const getOptimalParticleCount = (baseCount: number): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return Math.floor(baseCount * 0.3); // 30% on mobile
    case 'tablet':
      return Math.floor(baseCount * 0.6); // 60% on tablet
    default:
      return baseCount; // 100% on desktop
  }
};

// Performance monitoring
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  getFPS(): number {
    return this.fps;
  }

  update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  shouldReduceQuality(): boolean {
    return this.fps < 30;
  }
}

// Memory usage (if available)
export const getMemoryUsage = (): number | null => {
  if (typeof window === 'undefined') return null;
  
  const performance = (window.performance as any);
  if (performance && performance.memory) {
    return performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
  }
  
  return null;
};
