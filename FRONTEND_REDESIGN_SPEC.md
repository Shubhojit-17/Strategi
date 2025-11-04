# Frontend Redesign Specification - Organic AI Interface

## 🎯 Project Vision

Transform the current boxy, traditional UI into an **organic, flowing, futuristic interface** that represents AI consciousness through animated bubbles, particles, and liquid-like interactions. The interface will be immersive, metaphorical, and visually stunning while maintaining all existing backend integrations.

---

## 🎨 Core Visual Theme

### Design Philosophy
- **Organic & Flowing**: No rectangles, no card boxes
- **Liquid AI Consciousness**: Soft curved regions, glassmorphism layers
- **Motion-First**: Everything breathes, floats, and responds
- **Metaphorical Design**: UI elements represent AI thinking process

### Color Palette (Dynamic/Animated)
```css
:root {
  /* Base */
  --deep-space-blue: #0F1423;
  --dark-gradient-start: #0F1423;
  --dark-gradient-end: #1B2138;
  
  /* Neon Accents */
  --neon-aqua: #3CF2FF;
  --soft-purple: #A37CFF;
  --subtle-pink: #FF7AC3;
  
  /* Functional */
  --white: #FFFFFF;
  --glow-aqua: rgba(60, 242, 255, 0.3);
  --glow-purple: rgba(163, 124, 255, 0.3);
  
  /* Gradients */
  --bg-gradient: linear-gradient(135deg, #0F1423, #1B2138);
  --glow-radial: radial-gradient(circle at 50% 50%, #3CF2FF33, transparent);
  --motion-gradient: linear-gradient(45deg, #3CF2FF, #A37CFF, #FF7AC3);
}
```

---

## 🧭 UI Flow Architecture

### Screen 1: Landing / Entry Animation
**Inspiration**: DocuSign brand intro style

#### Visual Sequence
1. **Initial State**: Dark screen (#0F1423)
2. **Line Tracing**: Thin glowing neon line (#3CF2FF) traces a circle shape
3. **Circle Formation**: Line completes → circle forms
4. **Bubble Expansion**: Circle expands into a 3D floating bubble
5. **UI Reveal**: Bubble dissolves revealing the main interface

#### Technical Implementation
```tsx
// Component: EntryAnimation.tsx
- Use Framer Motion for circle tracing
- SVG path animation with strokeDashoffset
- Three.js bubble with fresnel shader
- Opacity transition to main UI (duration: 3s)
```

#### Backend Connection
- **None required** (pure animation layer)
- Loads while backend initialization happens
- Masks initial connection latency

---

### Screen 2: Wallet + NFT Access Gateway (Hero Section)

#### Design Concept
**Replace**: Traditional wallet connect boxes  
**With**: Floating glowing nodes connected by animated neon lines

#### Visual Elements
- **Node Network**: 3-5 floating spherical nodes
- **Connection Lines**: Animated neon lines (#3CF2FF) between nodes
- **Interaction States**:
  - **Idle**: Slow pulsing glow
  - **On Click**: Selected node glows brighter & expands
  - **NFT Owned**: Bubble pulses softly → unlocks next UI
  - **No NFT**: Bubble vibrates → CTA fades in: "Mint Access Token"

#### Component Structure
```tsx
// WalletGateway.tsx
<Canvas>
  <FloatingNodes
    nodes={[
      { position: [-2, 0, 0], label: "MetaMask", type: "metamask" },
      { position: [2, 0, 0], label: "Crossmint", type: "crossmint" }
    ]}
  />
  <NodeConnectors nodes={nodes} animated={true} />
  <ParticleField count={100} />
</Canvas>

<AnimatedGradientText>
  {hasNFT ? "Access Granted" : "Mint Access Token"}
</AnimatedGradientText>
```

#### Backend Integration
```typescript
// API Calls Required
1. GET /auth/check?user_address={address}
   - Triggers bubble pulse animation based on authenticated status
   
2. POST /crossmint/wallet (if Crossmint node selected)
   - Body: { email: string }
   - Response triggers node expansion animation

// State Management
interface WalletState {
  connectionMethod: 'metamask' | 'crossmint' | null;
  address: string | null;
  hasNFT: boolean;
  tokenId: number | null;
  animationState: 'idle' | 'connecting' | 'success' | 'error';
}

// Animation Triggers
- onConnectionStart → Node expands + particles accelerate
- onAuthCheck → Bubble pulses (success) or vibrates (failure)
- onNFTDetected → Unlock animation (gate opens)
```

#### Resources
- **ReactBits**: FloatingElements, Buttons
- **PrebuiltUI**: AnimatedGradientText
- **Three.js**: Node spheres with point light

---

### Screen 3: NFT Minting Interface

#### Design Concept
**Replace**: Simple mint button  
**With**: Interactive energy bubble that absorbs user action

#### Visual Elements
- **Central Bubble**: Large semi-transparent sphere
- **Energy Rings**: Rotating rings around bubble
- **Particle Absorption**: Particles drawn toward bubble on interaction
- **Progress Indicator**: Circular liquid fill animation

#### Interaction Flow
1. User hovers → Bubble grows slightly, particles accelerate
2. User clicks "Mint" → Energy burst from bubble center
3. Transaction pending → Liquid rises in circular reservoir
4. Success → Explosion of particles with celebration animation
5. Error → Bubble shakes, red glow

#### Component Structure
```tsx
// MintingBubble.tsx
<Canvas>
  <BubbleCore 
    size={2}
    glowColor={minting ? "#3CF2FF" : "#A37CFF"}
    distortion={minting ? 0.8 : 0.3}
  />
  <EnergyRings 
    count={3}
    rotationSpeed={minting ? 2 : 0.5}
  />
  <ParticleAbsorber 
    active={minting}
    particleCount={200}
  />
  <LiquidProgress 
    value={mintProgress}
    color="#3CF2FF"
  />
</Canvas>
```

#### Backend Integration
```typescript
// API Calls Required
1. Contract Call: mintAccessNFT (via wagmi)
   - Transaction hash triggers animation state change
   
2. useWaitForTransactionReceipt
   - Progress updates drive liquid fill animation
   - Success triggers celebration animation

// Animation State Machine
enum MintState {
  IDLE = 'idle',           // Gentle pulse
  HOVER = 'hover',         // Bubble grows
  INITIATING = 'init',     // Energy burst
  PENDING = 'pending',     // Liquid rising
  CONFIRMING = 'confirm',  // Intense pulse
  SUCCESS = 'success',     // Particle explosion
  ERROR = 'error'          // Red shake
}

// Progress Mapping
const progressMap = {
  initiated: 25,    // Transaction sent
  pending: 50,      // In mempool
  confirming: 75,   // Block mined
  success: 100      // Confirmed
}
```

---

### Screen 4: Document Upload Interface

#### Design Concept
**Replace**: Traditional upload box  
**With**: Glass circular surface with ripple effects

#### Visual Elements
- **Glass Surface**: Floating circular platform with reflection
- **Ripple Effect**: WebGL plane distortion on hover
- **Particle Swirl**: Particles spiral inward on file drag
- **Liquid Fill**: Upload progress shown as liquid filling circular reservoir

#### Interaction States
1. **Idle**: Glass surface floats gently
2. **Hover**: Ripples expand outward
3. **Drag Over**: Particles swirl inward, surface glows
4. **Uploading**: Liquid rises from bottom, particles orbit
5. **Success**: Liquid reaches top, particle burst
6. **Error**: Surface cracks effect, red glow

#### Component Structure
```tsx
// UploadSurface.tsx
<Canvas>
  <GlassSurface
    radius={3}
    reflection={0.4}
    rippleActive={isDragOver}
  />
  <ParticleSwirl
    active={isDragOver || uploading}
    velocity={uploading ? 2 : 1}
  />
  <LiquidReservoir
    fillLevel={uploadProgress}
    color="#3CF2FF"
    animated={true}
  />
</Canvas>

<DropZone
  onDragOver={handleDragOver}
  onDrop={handleDrop}
/>
```

#### Backend Integration
```typescript
// API Calls Required
1. POST /documents/upload
   - Body: FormData { file, user_address }
   - Returns: { cid, filename, document_hash, gateway_url }

// Upload Flow with Animation Triggers
const handleUpload = async (file: File) => {
  // 1. Start swirl animation
  setAnimationState('uploading');
  
  // 2. Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_address', userAddress);
  
  // 3. Upload with progress tracking
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    const progress = (e.loaded / e.total) * 100;
    setUploadProgress(progress); // Drives liquid fill
  });
  
  // 4. Success triggers particle burst
  xhr.addEventListener('load', () => {
    setAnimationState('success');
    setTimeout(() => refreshDocuments(), 2000);
  });
  
  // 5. Error triggers crack effect
  xhr.addEventListener('error', () => {
    setAnimationState('error');
  });
  
  xhr.open('POST', `${BACKEND_URL}/documents/upload`);
  xhr.send(formData);
};

// NFT Authentication Check (before upload)
- Check GET /auth/check before allowing file drop
- If !authenticated, trigger bubble vibrate + show mint CTA
```

#### WebGL Shaders
```glsl
// Ripple Fragment Shader
uniform float time;
uniform vec2 mouse;

void main() {
  vec2 uv = gl_FragCoord.xy;
  float dist = distance(uv, mouse);
  float ripple = sin(dist * 10.0 - time * 3.0) * 0.1;
  gl_FragColor = vec4(vec3(ripple), 0.3);
}
```

---

### Screen 5: Document List Display

#### Design Concept
**Replace**: Grid/table layout  
**With**: Floating horizontal ribbons with gentle scroll

#### Visual Elements
- **Ribbon Cards**: Curved horizontal strips floating in 3D space
- **Metadata Glow**: Info text glows around hovered document
- **3D Rotation**: Slight rotation on hover (Y-axis tilt)
- **Expansion Panel**: Curved panel fades in on click (not pop)

#### Document Card States
1. **Default**: Gentle float animation (y-axis sine wave)
2. **Hover**: 3D rotate (5° tilt), glow intensifies
3. **Active**: Expands to show full metadata
4. **Loading**: Shimmer effect across ribbon

#### Component Structure
```tsx
// DocumentRibbon.tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ 
    scale: 1.03, 
    rotateY: 5,
    boxShadow: "0 0 30px rgba(60, 242, 255, 0.5)"
  }}
  style={{
    background: "linear-gradient(90deg, rgba(60,242,255,0.1), rgba(163,124,255,0.1))",
    backdropFilter: "blur(10px)",
    borderRadius: "50px",
    border: "1px solid rgba(60, 242, 255, 0.3)"
  }}
>
  <RibbonContent>
    <FileTypeIcon type={doc.filename.split('.').pop()} />
    <DocumentName>{doc.filename}</DocumentName>
    <MetadataGlow>
      <CIDDisplay>{doc.ipfs_hash}</CIDDisplay>
      <Timestamp>{formatDate(doc.timestamp)}</Timestamp>
    </MetadataGlow>
  </RibbonContent>
  
  <AnimatePresence>
    {expanded && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
      >
        <ExpandedPanel>
          <DetailRow label="Document Hash" value={doc.document_hash} />
          <DetailRow label="Token ID" value={doc.token_id} />
          <DetailRow label="Block Number" value={doc.block_number} />
          <GatewayLink href={doc.gateway_url} />
        </ExpandedPanel>
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

#### Backend Integration
```typescript
// API Calls Required
1. GET /documents/list?user_address={address}
   - Returns: { documents: Document[], count: number }

// Real-time Updates
const useDocumentList = (userAddress: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, [userAddress]);
  
  // Auto-refresh after upload success
  const fetchDocuments = async () => {
    const response = await fetch(
      `${BACKEND_URL}/documents/list?user_address=${userAddress}`
    );
    const data = await response.json();
    
    // Animate in new documents
    setDocuments(data.documents.map((doc, i) => ({
      ...doc,
      delay: i * 0.1 // Stagger animation
    })));
  };
  
  return { documents, loading, refresh: fetchDocuments };
};

// Animation Triggers
- New document appears → Fade in from right with delay
- Document clicked → Expand panel smoothly
- Scroll → Parallax effect (documents move at different speeds)
```

#### Scroll Behavior
```tsx
// Gentle continuous scroll with mouse wheel
const handleScroll = (e: WheelEvent) => {
  scrollPosition += e.deltaY * 0.5;
  documents.forEach((doc, i) => {
    doc.offsetY = scrollPosition + (i * 120);
  });
};
```

---

### Screen 6: The AI Agent Core (Main Highlight)

#### Design Concept
**The Signature Feature**: A 3D bubble with particle system representing AI consciousness

#### Visual Components

##### 1. The Bubble (Core Sphere)
- **Shape**: Semi-transparent 3D sphere
- **Material**: Fresnel shader (edge glow effect)
- **Size**: 2-3 units diameter
- **Color**: Dynamic gradient (#3CF2FF → #A37CFF)

##### 2. Internal Particle System
- **Count**: 200-500 particles
- **Behavior**: Float like neurons
- **Appearance**: Small glowing dots with trails

##### 3. State-Based Animations

**Idle State**:
- Slow particle drift
- Gentle bubble pulse (0.95x - 1.05x scale)
- Soft ambient glow

**Active State** (User clicks "Run AI Agent"):
1. Particles accelerate inward
2. Swirl into vortex formation
3. Burst wave expands outward
4. Bubble glows neon (intensity × 3)
5. Ripple rings emit from center

**Processing State**:
- Rapid particle orbits
- Pulsing glow synchronized with "thinking"
- Energy arcs between particles

**Complete State**:
- Particles slow down
- Bubble returns to soft glow
- Success indicator (green tint)

#### Component Structure
```tsx
// AIAgentCore.tsx
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Points } from '@react-three/drei';

export default function AIAgentCore({ 
  state = 'idle',
  onExecute 
}: AIAgentCoreProps) {
  const [particleState, setParticleState] = useState<ParticleState>('calm');
  
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      {/* Ambient Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#3CF2FF" />
      
      {/* Core Bubble */}
      <Sphere args={[1, 64, 64]} onClick={onExecute}>
        <MeshDistortMaterial
          speed={state === 'active' ? 3 : 1}
          distort={state === 'active' ? 0.8 : 0.3}
          color={state === 'active' ? "#3CF2FF" : "#A37CFF"}
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Internal Particle System */}
      <ParticleNeurons
        count={300}
        state={particleState}
        radius={0.8}
        velocity={state === 'active' ? 2.5 : 0.5}
      />
      
      {/* Energy Rings (Active Only) */}
      {state === 'active' && (
        <EnergyRings
          count={5}
          emitInterval={200}
          expandSpeed={2}
        />
      )}
      
      {/* Outer Glow */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#3CF2FF"
          transparent
          opacity={state === 'active' ? 0.3 : 0.1}
        />
      </mesh>
    </Canvas>
  );
}
```

#### Custom Shaders

##### Fresnel Shader (Bubble Edge Glow)
```glsl
// vertex shader
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// fragment shader
uniform vec3 glowColor;
uniform float intensity;
varying vec3 vNormal;

void main() {
  float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
  vec3 glow = glowColor * fresnel * intensity;
  gl_FragColor = vec4(glow, fresnel * 0.5);
}
```

##### Particle Shader (Neurons)
```glsl
// vertex shader
attribute float size;
attribute vec3 velocity;
uniform float time;

void main() {
  vec3 pos = position + velocity * time;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}

// fragment shader
uniform vec3 color;
void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  float alpha = 1.0 - (dist * 2.0);
  gl_FragColor = vec4(color, alpha);
}
```

#### Backend Integration

```typescript
// API Call Required
POST /execute
Body: {
  nft_token_id: number,
  user_address: string,
  document_cid: string,
  prompt: string,
  provider: string,
  model: string
}
Response: {
  record_id: number,
  output_cid: string,
  execution_root: string,
  trace_cid: string,
  tx_hash: string,
  output_text: string
}

// State Machine
interface AIExecutionState {
  status: 'idle' | 'validating' | 'executing' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  currentStep: string;
  result: string | null;
}

// Animation Trigger Mapping
const stateToAnimation = {
  idle: { particleSpeed: 0.5, bubbleIntensity: 1, glow: 0.1 },
  validating: { particleSpeed: 1.0, bubbleIntensity: 1.2, glow: 0.2 },
  executing: { particleSpeed: 2.5, bubbleIntensity: 2.0, glow: 0.4 },
  processing: { particleSpeed: 3.0, bubbleIntensity: 2.5, glow: 0.5 },
  complete: { particleSpeed: 0.5, bubbleIntensity: 1.5, glow: 0.3 },
  error: { particleSpeed: 0.2, bubbleIntensity: 0.5, glow: 0.1 }
};

// Execution Flow with Animation
const executeAI = async () => {
  try {
    // Step 1: Validation
    setExecutionState('validating');
    await new Promise(r => setTimeout(r, 500)); // Animation time
    
    // Step 2: Start execution
    setExecutionState('executing');
    
    const response = await fetch(`${BACKEND_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nft_token_id: tokenId,
        user_address: address,
        document_cid: selectedDocCid,
        prompt: userPrompt,
        provider: selectedProvider,
        model: selectedModel
      })
    });
    
    // Step 3: Processing response
    setExecutionState('processing');
    const data = await response.json();
    
    // Step 4: Complete with celebration
    setExecutionState('complete');
    setTimeout(() => {
      displayResult(data.output_text);
      setExecutionState('idle');
    }, 2000);
    
  } catch (error) {
    setExecutionState('error');
    console.error(error);
  }
};
```

#### Prompt Input Interface
Instead of traditional text box:

```tsx
// FloatingPromptInput.tsx
<motion.div
  style={{
    background: "rgba(15, 20, 35, 0.7)",
    backdropFilter: "blur(20px)",
    borderRadius: "100px",
    border: "2px solid rgba(60, 242, 255, 0.3)",
    padding: "20px 40px",
    boxShadow: "0 0 40px rgba(60, 242, 255, 0.2)"
  }}
  whileFocus={{
    boxShadow: "0 0 60px rgba(60, 242, 255, 0.5)",
    scale: 1.02
  }}
>
  <input
    type="text"
    placeholder="Ask the AI Agent..."
    style={{
      background: "transparent",
      border: "none",
      color: "#FFFFFF",
      fontSize: "18px",
      outline: "none",
      width: "100%"
    }}
  />
</motion.div>
```

#### Model Selection Interface
Floating pill buttons with glow:

```tsx
// ModelSelector.tsx
<div className="flex gap-4">
  {providers.map(provider => (
    <motion.button
      key={provider}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: selected === provider 
          ? "linear-gradient(135deg, #3CF2FF, #A37CFF)"
          : "rgba(60, 242, 255, 0.1)",
        border: "2px solid rgba(60, 242, 255, 0.5)",
        borderRadius: "50px",
        padding: "12px 30px",
        color: "#FFFFFF",
        fontWeight: "600",
        boxShadow: selected === provider
          ? "0 0 30px rgba(60, 242, 255, 0.6)"
          : "none"
      }}
      onClick={() => setSelected(provider)}
    >
      {provider}
    </motion.button>
  ))}
</div>
```

---

## 📦 Technical Implementation

### Dependencies to Install
```bash
# Core 3D & Animation
npm install three @react-three/fiber @react-three/drei
npm install framer-motion

# Shaders & Effects
npm install @react-three/postprocessing
npm install leva # For debug controls

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install class-variance-authority clsx tailwind-merge

# Utilities
npm install zustand # For state management
npm install react-use # For hooks
```

### Project Structure
```
frontend/
├── app/
│   ├── page.tsx                    # Main orchestrator
│   ├── layout.tsx                  # Global layout with Canvas
│   └── globals.css                 # Custom CSS variables
├── components/
│   ├── core/
│   │   ├── EntryAnimation.tsx      # Landing intro
│   │   ├── AIAgentCore.tsx         # Main bubble component
│   │   └── ParticleSystem.tsx      # Reusable particles
│   ├── wallet/
│   │   ├── WalletGateway.tsx       # Node network interface
│   │   ├── FloatingNode.tsx        # Individual node
│   │   └── NodeConnector.tsx       # Connecting lines
│   ├── nft/
│   │   ├── MintingBubble.tsx       # NFT mint interface
│   │   └── EnergyRings.tsx         # Animation rings
│   ├── documents/
│   │   ├── UploadSurface.tsx       # Glass surface upload
│   │   ├── DocumentRibbon.tsx      # Single document card
│   │   ├── RibbonList.tsx          # Document list container
│   │   └── LiquidProgress.tsx      # Upload progress
│   ├── ai/
│   │   ├── ExecutionInterface.tsx  # AI controls
│   │   ├── PromptInput.tsx         # Floating input
│   │   └── ModelSelector.tsx       # Provider/model picker
│   └── ui/
│       ├── AnimatedButton.tsx      # Custom button
│       ├── GlassPanel.tsx          # Glassmorphism panel
│       └── NeonText.tsx            # Glowing text
├── lib/
│   ├── shaders/
│   │   ├── fresnel.ts              # Bubble glow shader
│   │   ├── particles.ts            # Particle shader
│   │   └── ripple.ts               # Water ripple
│   ├── animations/
│   │   ├── bubbleStates.ts         # Animation state configs
│   │   └── transitions.ts          # Framer Motion presets
│   ├── hooks/
│   │   ├── useBackend.ts           # Backend API integration
│   │   ├── useWallet.ts            # Wallet state
│   │   └── useAI.ts                # AI execution state
│   └── utils/
│       ├── three-helpers.ts        # Three.js utilities
│       └── animation-helpers.ts    # Animation utilities
└── public/
    └── textures/
        └── particle.png            # Particle texture
```

### Backend Integration Points

#### 1. Wallet Connection
```typescript
// lib/hooks/useWallet.ts
export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    method: null,
    address: null,
    hasNFT: false,
    tokenId: null
  });
  
  const checkNFT = async (address: string) => {
    const response = await fetch(
      `${BACKEND_URL}/auth/check?user_address=${address}`
    );
    const data = await response.json();
    setState(prev => ({
      ...prev,
      hasNFT: data.authenticated,
      tokenId: data.token_id
    }));
    return data;
  };
  
  return { state, checkNFT };
};
```

#### 2. Document Management
```typescript
// lib/hooks/useDocuments.ts
export const useDocuments = (userAddress: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const fetchDocuments = async () => {
    const response = await fetch(
      `${BACKEND_URL}/documents/list?user_address=${userAddress}`
    );
    const data = await response.json();
    setDocuments(data.documents);
  };
  
  const uploadDocument = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_address', userAddress);
    
    const response = await fetch(`${BACKEND_URL}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    setUploading(false);
    await fetchDocuments(); // Refresh list
    return data;
  };
  
  return { documents, uploading, uploadDocument, refresh: fetchDocuments };
};
```

#### 3. AI Execution
```typescript
// lib/hooks/useAI.ts
export const useAI = () => {
  const [state, setState] = useState<AIState>({
    status: 'idle',
    progress: 0,
    result: null,
    error: null
  });
  
  const execute = async (params: ExecuteParams) => {
    setState({ status: 'validating', progress: 10, result: null, error: null });
    
    try {
      // Simulate validation delay for animation
      await new Promise(r => setTimeout(r, 500));
      
      setState({ status: 'executing', progress: 30, result: null, error: null });
      
      const response = await fetch(`${BACKEND_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      setState({ status: 'processing', progress: 60, result: null, error: null });
      
      const data = await response.json();
      
      setState({ status: 'complete', progress: 100, result: data, error: null });
      
      // Return to idle after celebration
      setTimeout(() => {
        setState(prev => ({ ...prev, status: 'idle', progress: 0 }));
      }, 3000);
      
      return data;
      
    } catch (error) {
      setState({ 
        status: 'error', 
        progress: 0, 
        result: null, 
        error: error.message 
      });
    }
  };
  
  return { state, execute };
};
```

### State Management Architecture

```typescript
// lib/store/appStore.ts
import { create } from 'zustand';

interface AppStore {
  // Wallet
  wallet: WalletState;
  setWallet: (wallet: WalletState) => void;
  
  // Documents
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  
  // AI Execution
  aiState: AIState;
  setAIState: (state: AIState) => void;
  
  // UI
  currentView: 'wallet' | 'mint' | 'upload' | 'documents' | 'ai';
  setView: (view: string) => void;
  
  // Animation
  animationState: 'entry' | 'main' | 'transitioning';
  setAnimationState: (state: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  wallet: { method: null, address: null, hasNFT: false, tokenId: null },
  setWallet: (wallet) => set({ wallet }),
  
  documents: [],
  setDocuments: (documents) => set({ documents }),
  
  aiState: { status: 'idle', progress: 0, result: null, error: null },
  setAIState: (aiState) => set({ aiState }),
  
  currentView: 'wallet',
  setView: (currentView) => set({ currentView }),
  
  animationState: 'entry',
  setAnimationState: (animationState) => set({ animationState })
}));
```

---

## 🎬 Animation Timing & Coordination

### Entry Sequence (Total: 4s)
```typescript
const entrySequence = {
  lineTrace: { duration: 1.5, delay: 0 },
  circleForm: { duration: 0.5, delay: 1.5 },
  bubbleExpand: { duration: 1.0, delay: 2.0 },
  uiReveal: { duration: 1.0, delay: 3.0 }
};
```

### Interaction Timings
```typescript
const timings = {
  hoverResponse: 150,        // Button hover feedback
  clickResponse: 100,        // Instant click feedback
  stateTransition: 500,      // State change animation
  particleBurst: 300,        // Particle explosion
  bubblePulse: 1000,         // One full pulse cycle
  liquidFill: 2000,          // Upload progress bar
  ribbonStagger: 100,        // Document list stagger
  errorShake: 400,           // Error vibration
  successCelebration: 2000   // Success animation
};
```

---

## 🎨 Design Resources Integration

### ReactBits Components
```typescript
// Use for:
- FloatingElements → Wallet nodes
- AnimatedButtons → CTA buttons
- GradientText → Headers & titles
```

### PrebuiltUI Components
```typescript
// Use for:
- AnimatedGradientText → "Mint Access Token", "Execute AI"
- ShinyButton → Primary actions
- TextShimmer → Loading states
```

### Three.js Patterns
```typescript
// Key patterns:
1. Sphere with MeshDistortMaterial → Bubble core
2. Points with custom shader → Particle system
3. Ring geometry with scale animation → Energy rings
4. Plane with displacement → Ripple effect
```

---

## 🔄 Backend API Mapping Summary

| Frontend Component | Backend Endpoint | Purpose | Animation Trigger |
|-------------------|------------------|---------|-------------------|
| WalletGateway | `GET /auth/check` | Verify NFT | Bubble pulse/vibrate |
| WalletGateway | `POST /crossmint/wallet` | Create wallet | Node expansion |
| MintingBubble | Contract: `mintAccessNFT` | Mint NFT | Liquid fill + burst |
| UploadSurface | `POST /documents/upload` | Upload file | Particle swirl + liquid |
| RibbonList | `GET /documents/list` | List documents | Ribbon fade-in |
| AIAgentCore | `POST /execute` | Execute AI | Vortex → burst |
| AIAgentCore | `GET /provenance/trace/{cid}` | Fetch trace | Display in panel |

---

## ✅ Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Install all dependencies
- [ ] Set up project structure
- [ ] Create CSS variables & theme
- [ ] Implement EntryAnimation component
- [ ] Create base GlassPanel component

### Phase 2: Core Components (Week 2)
- [ ] Build AIAgentCore with basic bubble
- [ ] Implement particle system
- [ ] Create fresnel & particle shaders
- [ ] Add state-based animations
- [ ] Test bubble with mock data

### Phase 3: Wallet Interface (Week 3)
- [ ] Build WalletGateway with nodes
- [ ] Implement NodeConnector lines
- [ ] Integrate wagmi hooks
- [ ] Connect to `/auth/check` endpoint
- [ ] Add Crossmint integration

### Phase 4: NFT Minting (Week 3)
- [ ] Create MintingBubble component
- [ ] Implement EnergyRings
- [ ] Build LiquidProgress indicator
- [ ] Connect to contract mint function
- [ ] Add transaction state animations

### Phase 5: Document Upload (Week 4)
- [ ] Build UploadSurface with glass effect
- [ ] Implement ripple shader
- [ ] Create ParticleSwirl component
- [ ] Connect to `/documents/upload`
- [ ] Add drag-drop functionality

### Phase 6: Document List (Week 4)
- [ ] Create DocumentRibbon component
- [ ] Build RibbonList container
- [ ] Add 3D hover effects
- [ ] Connect to `/documents/list`
- [ ] Implement expansion panel

### Phase 7: AI Execution (Week 5)
- [ ] Refine AIAgentCore states
- [ ] Build PromptInput interface
- [ ] Create ModelSelector component
- [ ] Connect to `/execute` endpoint
- [ ] Add result display panel

### Phase 8: Polish & Optimization (Week 6)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility improvements
- [ ] Cross-browser testing
- [ ] Final animation tuning

---

## 🚀 Success Criteria

### Visual
- ✅ Zero rectangular UI elements
- ✅ All interactions feel fluid & responsive
- ✅ Consistent neon glow aesthetic
- ✅ Bubble animations convey AI "thinking"

### Technical
- ✅ All backend endpoints integrated
- ✅ Smooth 60fps animations
- ✅ Proper error handling with animations
- ✅ Mobile-responsive design

### User Experience
- ✅ Intuitive without instructions
- ✅ Clear visual feedback for all actions
- ✅ Accessible keyboard navigation
- ✅ Fast perceived performance

---

## 📝 Notes for Developers

### Performance Considerations
1. **Three.js Canvas**: Keep particle count reasonable (<500 for mobile)
2. **Shader Complexity**: Test on mid-range devices
3. **Animation Throttling**: Use `requestAnimationFrame` for smooth 60fps
4. **Asset Loading**: Preload textures during entry animation

### Backend Compatibility
- All existing API endpoints remain unchanged
- Frontend handles loading states with animations
- Error responses trigger specific visual feedback
- Success responses trigger celebration animations

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- WebGL 2.0 required for shaders
- Fallback to simpler animations if WebGL unavailable

---

## 🎯 Final Vision

This redesign transforms the application from a traditional web interface into an **immersive AI consciousness experience**. Every interaction reinforces the metaphor of engaging with an intelligent entity:

- **The Bubble** = AI Agent's mind
- **Particles** = Neural activity
- **Energy Rings** = Processing waves
- **Liquid Fill** = Data flow
- **Glow & Pulses** = Thinking & response

Users won't just use the app—they'll **feel connected to the AI** through organic, beautiful interactions that make complex blockchain and AI operations intuitive and delightful.

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: Ready for Implementation
