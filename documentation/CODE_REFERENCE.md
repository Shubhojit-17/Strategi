# 🔮 Bioluminescent Bloom - Code Reference

## Quick Copy-Paste Components

### FloatingNode Component (Complete)

```tsx
// frontend/components/wallet/FloatingNode.tsx
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

  // Bioluminescent color palette
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
```

---

## Connection Screen (Key Sections)

### Title & Header

```tsx
<motion.div
  className="relative z-10 text-center"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  <h1
    className="text-4xl md:text-5xl font-bold mb-3"
    style={{
      color: colors.coreGlow,
      textShadow: `0 0 20px ${colors.coreGlow}, 0 0 40px ${colors.plasmaAccent}`,
    }}
  >
    Strategi
  </h1>
  <p
    className="text-lg"
    style={{
      color: colors.plasmaAccent,
      textShadow: `0 0 10px ${colors.plasmaAccent}`,
    }}
  >
    Connect Your Wallet
  </p>
  <div
    className="w-24 h-1 mx-auto mt-4 rounded-full"
    style={{
      background: `linear-gradient(90deg, ${colors.coreGlow}, ${colors.plasmaAccent}, ${colors.biolightPurple})`,
      boxShadow: `0 0 20px ${colors.coreGlow}`,
    }}
  />
</motion.div>
```

### Floating Nodes Container

```tsx
<div
  className="relative z-10 flex flex-col md:flex-row gap-20 md:gap-32 items-center justify-center"
  style={{
    filter: 'drop-shadow(0 0 30px rgba(60, 242, 255, 0.2))',
  }}
>
  {/* MetaMask Node */}
  <FloatingNode
    icon="🦊"
    label="MetaMask"
    onClick={handleMetaMaskConnect}
    isLoading={isConnectingMetaMask || isConnecting}
    isDisabled={crossmintWallet || isConnected}
  />

  {/* Crossmint Node */}
  <FloatingNode
    icon="📧"
    label="Crossmint"
    onClick={() => {
      const email = prompt('Enter your email for Crossmint wallet:');
      if (email) {
        setCrossmintEmail(email);
        handleCrossmintLogin();
      }
    }}
    isLoading={crossmintLoading}
    isDisabled={isConnected || crossmintWallet}
  />
</div>
```

### Loading Message Panel

```tsx
{(isConnectingMetaMask || isConnecting) && (
  <motion.div
    className="relative z-10 p-4 rounded-lg text-center max-w-md"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: `rgba(60, 242, 255, 0.1)`,
      border: `2px solid ${colors.coreGlow}`,
      boxShadow: `0 0 20px ${colors.coreGlow}40`,
    }}
  >
    <p style={{ color: colors.coreGlow }} className="font-semibold">
      ⏳ Waiting for MetaMask...
    </p>
    <p style={{ color: colors.plasmaAccent }} className="text-sm mt-2">
      Click the MetaMask fox icon 🦊 in your browser toolbar
    </p>
  </motion.div>
)}
```

---

## Connected State (MetaMask)

### Success Header

```tsx
<div className="text-center mb-8">
  <motion.div
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 0.8, repeat: 1 }}
    className="text-6xl mb-3"
  >
    ✅
  </motion.div>
  <h2
    className="text-3xl font-bold mb-2"
    style={{
      color: colors.coreGlow,
      textShadow: `0 0 20px ${colors.coreGlow}`,
    }}
  >
    Connected
  </h2>
  <p style={{ color: colors.plasmaAccent }}>MetaMask Wallet</p>
</div>
```

### Wallet Info Cards

```tsx
<div className="space-y-4 mb-6">
  {/* Address Card */}
  <motion.div
    className="p-4 rounded-lg backdrop-blur-sm"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
    style={{
      background: `rgba(60, 242, 255, 0.08)`,
      border: `1px solid ${colors.coreGlow}`,
      boxShadow: `0 0 15px ${colors.coreGlow}20`,
    }}
  >
    <p style={{ color: colors.plasmaAccent }} className="text-xs font-semibold mb-1">
      WALLET ADDRESS
    </p>
    <p className="font-mono text-sm break-all" style={{ color: colors.coreGlow }}>
      {address}
    </p>
  </motion.div>

  {/* Network Card */}
  <motion.div
    className="p-4 rounded-lg backdrop-blur-sm"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 }}
    style={{
      background: `rgba(130, 255, 210, 0.08)`,
      border: `1px solid ${colors.plasmaAccent}`,
      boxShadow: `0 0 15px ${colors.plasmaAccent}20`,
    }}
  >
    <p style={{ color: colors.coreGlow }} className="text-xs font-semibold mb-1">
      NETWORK
    </p>
    <p style={{ color: colors.plasmaAccent }} className="font-mono text-sm mb-2">
      {chain?.name || 'Unknown'} (ID: {chain?.id || 'N/A'})
    </p>
    {chain?.id === SOMNIA_CHAIN_ID && (
      <p style={{ color: colors.plasmaAccent }} className="text-xs">
        ✅ Correct network
      </p>
    )}
  </motion.div>
</div>
```

### Disconnect Button

```tsx
<motion.button
  onClick={handleMetaMaskDisconnect}
  className="w-full px-6 py-3 rounded-lg font-semibold transition"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  style={{
    background: `linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 59, 48, 0.1))`,
    border: `2px solid #FF6B6B`,
    color: '#FFB3B3',
    boxShadow: `0 0 15px rgba(255, 107, 107, 0.3)`,
  }}
>
  Disconnect Wallet
</motion.button>
```

---

## Color Constants

```tsx
const colors = {
  coreGlow: '#3CF2FF',       // Primary cyan glow
  plasmaAccent: '#82FFD2',   // Mint green accents
  deepOcean: '#0F1423',      // Dark navy background
  biolightPurple: '#A37CFF', // Purple highlights
};
```

---

## Animation Configurations

### Breathing Float Animation

```tsx
animate={{
  y: [0, -8, 0],  // Float up 8px, back down
}}
transition={{
  duration: isHovered ? 3 : 4,  // Faster when hovering
  repeat: Infinity,              // Loop forever
  ease: 'easeInOut',            // Smooth acceleration/deceleration
}}
```

### Hover Effects

```tsx
animate={{
  boxShadow: isHovered
    ? `0 0 40px ${coreGlow}, 0 0 60px ${plasmaAccent}, inset 0 0 20px ${biolightPurple}`
    : `0 0 20px ${coreGlow}, 0 0 40px ${plasmaAccent}`,
}}
transition={{ duration: 0.3 }}  // Smooth 300ms transition
```

### Loading State

```tsx
animate={{
  rotate: isLoading ? 360 : 0,
}}
transition={{
  duration: 2,
  repeat: isLoading ? Infinity : 0,
  ease: 'linear',
}}
```

### Page Entry Animation

```tsx
initial={{ opacity: 0, y: -20 }}  // Start invisible, offset up
animate={{ opacity: 1, y: 0 }}    // Fade in, slide down
transition={{ duration: 0.8 }}    // 800ms animation
```

---

## Usage Examples

### Basic Usage in Parent Component

```tsx
import FloatingNode from '@/components/wallet/FloatingNode';

// In your JSX:
<FloatingNode
  icon="🦊"
  label="MetaMask"
  onClick={() => console.log('Clicked!')}
  isLoading={false}
  isDisabled={false}
/>
```

### With Loading State

```tsx
<FloatingNode
  icon="🦊"
  label="MetaMask"
  onClick={handleConnect}
  isLoading={isConnecting}  // Will show rotating icon
  isDisabled={false}
/>
```

### Disabled State

```tsx
<FloatingNode
  icon="📧"
  label="Crossmint"
  onClick={() => {}}
  isLoading={false}
  isDisabled={true}  // 50% opacity, no click
/>
```

---

## Customization Snippets

### Change Colors

```tsx
const colors = {
  coreGlow: '#00FF00',          // Change to green
  plasmaAccent: '#FF00FF',      // Change to magenta
  deepOcean: '#000000',         // Change to pure black
  biolightPurple: '#FFFF00',    // Change to yellow
};
```

### Adjust Animation Speed

```tsx
// FloatingNode.tsx line 43
transition={{
  duration: isHovered ? 2.5 : 3.5,  // Change from 3-4
  repeat: Infinity,
  ease: 'easeInOut',
}}
```

### Increase Glow Intensity

```tsx
// FloatingNode.tsx line 60
animate={{
  boxShadow: isHovered
    ? `0 0 80px ${coreGlow}, 0 0 120px ${plasmaAccent}, inset 0 0 40px ${biolightPurple}`  // Doubled
    : `0 0 40px ${coreGlow}, 0 0 80px ${plasmaAccent}`,  // Increased
}}
```

### Larger Nodes

```tsx
className="relative w-48 h-48 cursor-pointer"  // From w-32 h-32
```

### More Spacing Between Nodes

```tsx
className="relative z-10 flex ... gap-40 md:gap-48"  // From gap-20 md:gap-32
```

---

## Browser DevTools Tips

### Check Animations Performance
1. Open DevTools (F12)
2. Press Ctrl+Shift+P → "Show Rendering"
3. Enable "Paint flashing"
4. Hover over nodes - should see minimal repaints

### Inspect Component Structure
```
<motion.div> (outer)
  ├─ <motion.div> (floating)
  │  ├─ <motion.div> (outer ring)
  │  ├─ <motion.div> (glass layer)
  │  ├─ <motion.div> (inner core)
  │  │  └─ <motion.div> (icon)
  │  └─ <motion.div> (ripple)
  └─ <motion.div> (label)
```

### Debug Style Issues
1. Right-click node → Inspect
2. Check `style` attribute for colors
3. Check `className` for Tailwind classes
4. Verify `boxShadow` values in DevTools

---

## Testing Checklist

```tsx
// Test component loads
<FloatingNode icon="🦊" label="Test" />

// Test loading state
<FloatingNode icon="🦊" label="Test" isLoading={true} />

// Test disabled state
<FloatingNode icon="🦊" label="Test" isDisabled={true} />

// Test click handler
<FloatingNode icon="🦊" label="Test" onClick={() => alert('Clicked!')} />

// Test all states together
<FloatingNode 
  icon="📧" 
  label="Crossmint"
  onClick={() => console.log('Clicked')}
  isLoading={false}
  isDisabled={false}
/>
```

---

## Version History

**v1.0** - Initial Release
- Bioluminescent Bloom design implemented
- FloatingNode component redesigned
- UnifiedWalletConnect UI updated
- All logic preserved
- Production ready

---

**Last Updated**: 2025-11-04  
**Status**: Production Ready  
**Stability**: Stable

