# STRATEGI Animated Logo - Usage Guide

## Component Overview

The `StrategiLogoAnimated` component is a symbol-only, animated version of the STRATEGI logo featuring:

- **Core breathing bubble** - Slow pulse animation (4.5s cycle)
- **Triple orbit rings** - Rotating in alternating directions (12-20s cycles)
- **Document capsule** - Soft glow pulse (3s cycle)
- **Ambient particles** - Subtle shimmer effects
- **Bioluminescent colors** - #3CF2FF (core-glow), #82FFD2 (plasma-accent), #A37CFF (biolight-purple)

## Props

```typescript
interface StrategiLogoAnimatedProps {
  size?: number;        // Default: 80 (px)
  className?: string;   // Additional CSS classes
}
```

## Usage Examples

### 1. App Header / Navigation

```tsx
import { StrategiLogoAnimated } from '@/components/branding/StrategiLogoAnimated';

export default function Header() {
  return (
    <header className="flex items-center gap-4 p-4">
      <StrategiLogoAnimated size={48} />
      <nav>{/* Navigation items */}</nav>
    </header>
  );
}
```

### 2. Loading / Splash Screen

```tsx
import { StrategiLogoAnimated } from '@/components/branding/StrategiLogoAnimated';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center h-screen bg-deep-ocean"
    >
      <div className="text-center">
        <StrategiLogoAnimated size={120} />
        <p className="mt-6 text-lg text-core-glow">
          Initializing neural network...
        </p>
      </div>
    </motion.div>
  );
}
```

### 3. AI Execution Scene Transition

```tsx
import { StrategiLogoAnimated } from '@/components/branding/StrategiLogoAnimated';
import { motion, AnimatePresence } from 'framer-motion';

export default function AITransition({ isProcessing }: { isProcessing: boolean }) {
  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 flex items-center justify-center bg-deep-ocean/90 backdrop-blur-md z-50"
        >
          <div className="relative">
            <StrategiLogoAnimated size={100} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-core-glow/30"
              style={{ borderTopColor: '#3CF2FF' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 4. Entry Animation Component

```tsx
import { StrategiLogoAnimated } from '@/components/branding/StrategiLogoAnimated';
import { motion } from 'framer-motion';

export default function EntryAnimation({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 10 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 flex items-center justify-center bg-deep-ocean"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <StrategiLogoAnimated size={140} />
      </motion.div>
    </motion.div>
  );
}
```

### 5. Centered with Text (Brand Display)

```tsx
import { StrategiLogoAnimated } from '@/components/branding/StrategiLogoAnimated';

export default function BrandDisplay() {
  return (
    <div className="flex flex-col items-center gap-6">
      <StrategiLogoAnimated size={96} />
      <h1
        className="text-5xl font-bold"
        style={{
          background: 'linear-gradient(90deg, #3CF2FF, #82FFD2, #A37CFF)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        STRATEGI
      </h1>
      <p className="text-gray-400 text-lg">
        NFT-Gated AI Agents on Somnia L1
      </p>
    </div>
  );
}
```

## Animation Details

### Core Bubble (4.5s breathing)
- Scale: 1.00 → 1.04 → 1.00
- Opacity: 0.9 → 1.0 → 0.9
- Timing: ease-in-out

### Orbit Rings
- **Outer**: 20s clockwise rotation
- **Middle**: 15s counter-clockwise rotation
- **Inner**: 12s clockwise rotation
- Timing: linear (continuous)

### Document Capsule (3s glow)
- Opacity: 0.55 → 1.0 → 0.55
- Timing: ease-in-out

### Particles (2.5s shimmer)
- Opacity: 0.4 → 0.8 → 0.4
- Timing: ease-in-out

## Performance Notes

- All animations use GPU-accelerated properties (`transform`, `opacity`)
- No filter animations (filters applied statically only)
- Lightweight - suitable for continuous display
- No performance impact on low-end devices

## Styling Customization

```tsx
// Custom size and additional styles
<StrategiLogoAnimated 
  size={64} 
  className="drop-shadow-lg hover:scale-110 transition-transform"
/>

// With inline styles
<StrategiLogoAnimated 
  size={80}
  style={{ filter: 'drop-shadow(0 0 20px #3CF2FF)' }}
/>
```

## Integration Checklist

- [ ] Import component in splash/loading screen
- [ ] Add to app header/navigation
- [ ] Use in AI execution transitions
- [ ] Display on error/success states (optional)
- [ ] Add to 404/empty state pages (optional)

## Color Consistency

Always use these exact values to maintain brand consistency:

```css
--core-glow: #3CF2FF;      /* Primary cyan */
--plasma-accent: #82FFD2;   /* Secondary teal */
--biolight-purple: #A37CFF; /* Accent purple */
--deep-ocean: #0F1423;      /* Background dark */
```
