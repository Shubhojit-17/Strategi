'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import AnimatedButton from '../ui/AnimatedButton';
import { LoadingDots } from '../ui/Loading';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (message: string) => void;
  documentName?: string;
}

// Typing indicator using centralized LoadingDots
const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex gap-3 items-start"
  >
    <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 shadow-lg">
      🤖
    </div>
    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 shadow-xl backdrop-blur-sm">
      <LoadingDots />
    </div>
  </motion.div>
);

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isProcessing,
  onSendMessage,
  documentName,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Document Info */}
      {documentName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-accent/10 to-primary-light/10 border border-accent/30 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Analyzing Document</p>
                <p className="text-sm text-white font-medium">{documentName}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-accent blur-3xl opacity-20"></div>
              <div className="relative text-7xl">💬</div>
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Start a Conversation
            </h3>
            <p className="text-gray-400 text-lg">
              Ask questions about your document or request AI analysis
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isProcessing && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="relative rounded-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 shadow-2xl backdrop-blur-sm overflow-hidden">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-light/20 via-accent/20 to-primary-light/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          <div className="relative p-4">
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or give a command..."
                disabled={isProcessing}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 resize-none min-h-12 max-h-[200px] text-base leading-relaxed"
                rows={1}
              />
              <AnimatedButton
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="shrink-0 !px-6 !py-3 !rounded-xl"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-pulse">⏳</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Send</span>
                    <span>🚀</span>
                  </span>
                )}
              </AnimatedButton>
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 font-mono text-[10px]">Enter</span>
              <span>to send</span>
              <span className="text-gray-600">•</span>
              <span className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 font-mono text-[10px]">Shift + Enter</span>
              <span>for new line</span>
            </p>
          </div>
        </div>
      </motion.form>
    </div>
  );
};
