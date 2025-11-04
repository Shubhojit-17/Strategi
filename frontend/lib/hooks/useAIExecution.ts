import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ExecutionState {
  status: 'idle' | 'thinking' | 'processing' | 'complete' | 'error';
  messages: Message[];
  isProcessing: boolean;
  error: string | null;
  result: any | null;
  selectedModel: string;
}

interface UseAIExecutionReturn extends ExecutionState {
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  reset: () => void;
  setSelectedModel: (model: string) => void;
}

export const useAIExecution = (documentCid?: string): UseAIExecutionReturn => {
  const [state, setState] = useState<ExecutionState>({
    status: 'idle',
    messages: [],
    isProcessing: false,
    error: null,
    result: null,
    selectedModel: 'gemini', // Default to Gemini (has working API key)
  });

  // Send message to AI
  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isProcessing: true,
        status: 'thinking',
        error: null,
      }));

      try {
        // Get wallet address and token ID
        const userAddress = localStorage.getItem('wallet_address');
        const wallet = JSON.parse(localStorage.getItem('wallet') || '{}');
        const tokenId = wallet.tokenId || 1;

        if (!userAddress) {
          throw new Error('Wallet not connected');
        }

        // Prepare request matching backend ExecutionRequest model
        const requestBody = {
          nft_token_id: tokenId,
          user_address: userAddress,
          document_cid: documentCid || 'QmTest', // Use actual CID from document
          prompt: content,
          provider: state.selectedModel,
          model: state.selectedModel === 'mistral' ? 'mistralai/mistral-7b-instruct:free' :
                 state.selectedModel === 'gemini' ? 'gemini-2.0-flash' :
                 state.selectedModel === 'deepseek' ? 'deepseek/deepseek-r1:free' :
                 'moonshot-v1-8k'
        };

        const response = await fetch('http://localhost:8000/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorDetail = errorData.detail || errorData.error || '';
          
          // Provide user-friendly error messages
          if (response.status === 429 || errorDetail.includes('rate-limited') || errorDetail.includes('429')) {
            throw new Error(`🚦 ${state.selectedModel === 'gemini' ? 'Google Gemini' : state.selectedModel === 'deepseek' ? 'DeepSeek' : state.selectedModel === 'mistral' ? 'Mistral' : 'This AI model'} is temporarily busy due to high demand. Please try another model or wait a moment.`);
          } else if (response.status === 401 || errorDetail.includes('Unauthorized') || errorDetail.includes('not found')) {
            throw new Error(`🔑 ${state.selectedModel === 'gemini' ? 'Google Gemini' : state.selectedModel === 'deepseek' ? 'DeepSeek' : state.selectedModel === 'mistral' ? 'Mistral' : 'This AI model'} is currently unavailable. Please select a different model.`);
          } else {
            throw new Error(`AI execution failed: ${errorDetail || 'Unknown error'}`);
          }
        }

        const data = await response.json();

        // Add AI response (output_text from backend)
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.output_text || data.response || data.result || 'No response',
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          isProcessing: false,
          status: 'complete',
          result: data,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Add error message with better formatting
        const errorAiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ ${errorMessage}\n\n💡 **Tip:** Try selecting a different AI model from the dropdown above.`,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorAiMessage],
          isProcessing: false,
          status: 'error',
          error: errorMessage,
        }));
      }
    },
    [documentCid, state.messages, state.selectedModel]
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      status: 'idle',
      error: null,
      result: null,
    }));
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      messages: [],
      isProcessing: false,
      error: null,
      result: null,
      selectedModel: 'mistral',
    });
  }, []);

  // Set selected AI model
  const setSelectedModel = useCallback((model: string) => {
    setState((prev) => ({
      ...prev,
      selectedModel: model,
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    clearMessages,
    reset,
    setSelectedModel,
  };
};
