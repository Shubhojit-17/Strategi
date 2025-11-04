// Core Type Definitions for Organic AI Interface

export interface WalletState {
  connectionMethod: 'metamask' | 'crossmint' | null;
  address: string | null;
  hasNFT: boolean;
  tokenId: number | null;
  animationState: 'idle' | 'connecting' | 'success' | 'error';
}

export interface Document {
  document_id: number;
  filename: string;
  ipfs_hash: string;
  document_hash: string;
  file_size?: number;
  token_id: number;
  timestamp: number;
  tx_hash: string;
  block_number: number;
  gateway_url: string;
}

export interface AIExecutionState {
  status: 'idle' | 'validating' | 'executing' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  currentStep: string;
  result: ExecutionResult | null;
  error: string | null;
}

export interface ExecutionResult {
  record_id: number;
  output_cid: string;
  execution_root: string;
  trace_cid: string;
  tx_hash: string;
  output_text: string;
}

export interface ExecuteParams {
  nft_token_id: number;
  user_address: string;
  document_cid: string;
  prompt: string;
  provider: AIProvider;
  model: string;
}

export type AIProvider = 'gemini' | 'moonshot' | 'deepseek' | 'mistral';

export interface MintState {
  status: 'idle' | 'hover' | 'initiating' | 'pending' | 'confirming' | 'success' | 'error';
  progress: number; // 0-100
  tokenId: number | null;
  txHash: string | null;
}

export interface UploadState {
  status: 'idle' | 'hover' | 'dragover' | 'uploading' | 'success' | 'error';
  progress: number; // 0-100
  cid: string | null;
  error: string | null;
}

export interface AnimationConfig {
  particleSpeed: number;
  bubbleIntensity: number;
  glowOpacity: number;
  duration: number;
}

export interface BubbleState {
  status: 'idle' | 'active' | 'processing' | 'complete' | 'error';
  config: AnimationConfig;
}

// Backend API Response Types
export interface AuthCheckResponse {
  authenticated: boolean;
  token_id: number | null;
  message: string;
}

export interface UploadResponse {
  success: boolean;
  cid: string;
  filename: string;
  document_hash: string;
  token_id: number;
  uploader: string;
  file_size: number;
  gateway_url: string;
  message: string;
}

export interface DocumentListResponse {
  user_address: string;
  token_id: number;
  documents: Document[];
  count: number;
  message: string;
}

export interface CrossmintWalletResponse {
  walletAddress: string;
  email: string;
  isNew: boolean;
  message: string;
}

// Animation State Mappings
export const ANIMATION_STATES: Record<AIExecutionState['status'], AnimationConfig> = {
  idle: { particleSpeed: 0.5, bubbleIntensity: 1, glowOpacity: 0.1, duration: 1000 },
  validating: { particleSpeed: 1.0, bubbleIntensity: 1.2, glowOpacity: 0.2, duration: 500 },
  executing: { particleSpeed: 2.5, bubbleIntensity: 2.0, glowOpacity: 0.4, duration: 300 },
  processing: { particleSpeed: 3.0, bubbleIntensity: 2.5, glowOpacity: 0.5, duration: 200 },
  complete: { particleSpeed: 0.5, bubbleIntensity: 1.5, glowOpacity: 0.3, duration: 2000 },
  error: { particleSpeed: 0.2, bubbleIntensity: 0.5, glowOpacity: 0.1, duration: 400 }
};

// Progress Mapping for Mint States
export const MINT_PROGRESS_MAP = {
  initiated: 25,
  pending: 50,
  confirming: 75,
  success: 100
};

// Timing Constants
export const TIMINGS = {
  hoverResponse: 150,
  clickResponse: 100,
  stateTransition: 500,
  particleBurst: 300,
  bubblePulse: 1000,
  liquidFill: 2000,
  ribbonStagger: 100,
  errorShake: 400,
  successCelebration: 2000
};
