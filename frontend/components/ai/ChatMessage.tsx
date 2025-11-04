'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, BrainElectricity, Check, Copy } from 'iconoir-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Simple markdown-like formatting
  const formatContent = (content: string) => {
    // Code blocks
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let formatted = content;
    
    const codeBlocks: string[] = [];
    formatted = formatted.replace(codeBlockRegex, (match, code) => {
      codeBlocks.push(code.trim());
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Split by code block placeholders
    const parts = formatted.split(/(__CODE_BLOCK_\d+__)/);
    
    return parts.map((part, i) => {
      if (part.startsWith('__CODE_BLOCK_')) {
        const idx = parseInt(part.match(/\d+/)?.[0] || '0');
        return (
          <pre
            key={i}
            className="my-2 p-3 bg-gray-900 rounded-lg overflow-x-auto border border-gray-700"
          >
            <code className="text-sm text-gray-300 font-mono">
              {codeBlocks[idx]}
            </code>
          </pre>
        );
      }
      
      // Bold text
      const boldText = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      return (
        <span
          key={i}
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: boldText }}
        />
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-primary-light/30 to-primary-light/10 border border-primary-light/40 text-primary-light'
            : 'bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/40 text-accent'
        }`}
      >
        {isUser ? <User className="w-6 h-6" /> : <BrainElectricity className="w-6 h-6" />}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-5 py-4 rounded-2xl shadow-xl backdrop-blur-sm ${
            isUser
              ? 'bg-gradient-to-br from-primary-light/20 to-primary-light/5 border border-primary-light/30'
              : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50'
          }`}
        >
          {/* Decorative corner gradient */}
          <div className={`absolute top-0 ${isUser ? 'right-0' : 'left-0'} w-24 h-24 bg-gradient-to-br ${isUser ? 'from-primary-light/10' : 'from-accent/10'} to-transparent blur-2xl opacity-50 pointer-events-none`}></div>
          
          {/* Header */}
          <div className="relative flex items-center justify-between mb-3 gap-4">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isUser ? 'text-primary-light' : 'text-accent'}`}>
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">
                {formatTime(message.timestamp)}
              </span>
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-all ${
                  copied 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative text-gray-100 text-base leading-relaxed">
            {formatContent(message.content)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
