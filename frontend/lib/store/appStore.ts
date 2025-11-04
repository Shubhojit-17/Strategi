import { create } from 'zustand';
import type {
  WalletState,
  Document,
  AIExecutionState,
  UploadState
} from '../types';

interface AppStore {
  // Wallet State
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  resetWallet: () => void;
  
  // Documents State
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  
  // AI Execution State
  aiState: AIExecutionState;
  setAIState: (state: Partial<AIExecutionState>) => void;
  resetAIState: () => void;
  
  // Upload State
  uploadState: UploadState;
  setUploadState: (state: Partial<UploadState>) => void;
  resetUploadState: () => void;
  
  // UI State
  currentView: 'entry' | 'wallet' | 'mint' | 'upload' | 'documents' | 'ai';
  setView: (view: AppStore['currentView']) => void;
  
  // Animation State
  animationState: 'entry' | 'main' | 'transitioning';
  setAnimationState: (state: AppStore['animationState']) => void;
  
  // Selected Document for AI Execution
  selectedDocument: Document | null;
  setSelectedDocument: (document: Document | null) => void;
}

const initialWalletState: WalletState = {
  connectionMethod: null,
  address: null,
  hasNFT: false,
  tokenId: null,
  animationState: 'idle'
};

const initialAIState: AIExecutionState = {
  status: 'idle',
  progress: 0,
  currentStep: '',
  result: null,
  error: null
};

const initialUploadState: UploadState = {
  status: 'idle',
  progress: 0,
  cid: null,
  error: null
};

export const useAppStore = create<AppStore>((set) => ({
  // Wallet
  wallet: initialWalletState,
  setWallet: (wallet) => set((state) => ({
    wallet: { ...state.wallet, ...wallet }
  })),
  resetWallet: () => set({ wallet: initialWalletState }),
  
  // Documents
  documents: [],
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({
    documents: [document, ...state.documents]
  })),
  
  // AI Execution
  aiState: initialAIState,
  setAIState: (aiState) => set((state) => ({
    aiState: { ...state.aiState, ...aiState }
  })),
  resetAIState: () => set({ aiState: initialAIState }),
  
  // Upload
  uploadState: initialUploadState,
  setUploadState: (uploadState) => set((state) => ({
    uploadState: { ...state.uploadState, ...uploadState }
  })),
  resetUploadState: () => set({ uploadState: initialUploadState }),
  
  // UI
  currentView: 'entry',
  setView: (currentView) => set({ currentView }),
  
  // Animation
  animationState: 'entry',
  setAnimationState: (animationState) => set({ animationState }),
  
  // Selected Document
  selectedDocument: null,
  setSelectedDocument: (selectedDocument) => set({ selectedDocument })
}));
