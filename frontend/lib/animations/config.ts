// Animation configuration constants
export const ANIMATION_CONFIG = {
  // Duration constants (in seconds)
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    verySlow: 1,
  },

  // Easing functions
  easing: {
    // Standard ease-out for most animations
    default: [0.4, 0, 0.2, 1],
    
    // Elastic bounce for playful animations
    elastic: [0.68, -0.55, 0.265, 1.55],
    
    // Smooth ease-in-out for state transitions
    smooth: [0.65, 0, 0.35, 1],
    
    // Sharp ease-in for exits
    sharp: [0.4, 0, 1, 1],
    
    // Linear for continuous animations
    linear: [0, 0, 1, 1],
  },

  // Spring configurations
  spring: {
    gentle: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
    bouncy: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 10,
    },
    stiff: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },

  // Stagger delays for list animations
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
  },

  // Rotation speeds for 3D elements
  rotation: {
    verySlow: 0.1,
    slow: 0.3,
    normal: 0.5,
    fast: 1,
  },

  // Pulse/breath animation speeds
  pulse: {
    slow: 2,
    normal: 3,
    fast: 5,
  },
};

// Framer Motion animation variants
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.default,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.easing.sharp,
    },
  },
};

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.default,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.easing.sharp,
    },
  },
};

export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.default,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.easing.sharp,
    },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.normal,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.default,
    },
  },
};
