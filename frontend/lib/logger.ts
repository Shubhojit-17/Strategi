/**
 * Comprehensive Frontend Logging & Auditing System
 * Logs user actions, transactions, errors, and system events
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  AUDIT = 'AUDIT'
}

export enum LogCategory {
  WALLET = 'WALLET',
  NFT = 'NFT',
  UPLOAD = 'UPLOAD',
  AI = 'AI',
  BLOCKCHAIN = 'BLOCKCHAIN',
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  UI = 'UI',
  SYSTEM = 'SYSTEM'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  details?: any;
  userAddress?: string;
  txHash?: string;
  error?: Error | any;  // Accept any error type
  metadata?: Record<string, any>;
}

class FrontendLogger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private readonly STORAGE_KEY = 'somnia_frontend_logs';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load logs from storage:', err);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      // Keep only recent logs to prevent storage bloat
      const recentLogs = this.logs.slice(-this.MAX_LOGS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentLogs));
      this.logs = recentLogs;
    } catch (err) {
      console.error('Failed to save logs to storage:', err);
    }
  }

  private log(entry: LogEntry) {
    // Add to memory
    this.logs.push(entry);
    
    // Console output with color coding
    const emoji = this.getEmoji(entry.level, entry.category);
    const color = this.getColor(entry.level);
    
    console.log(
      `%c${emoji} [${entry.level}] ${entry.category}: ${entry.action}`,
      `color: ${color}; font-weight: bold;`,
      entry.details || ''
    );

    if (entry.error) {
      // Handle different error types
      if (entry.error instanceof Error) {
        console.error('Error details:', entry.error.message, entry.error);
      } else if (typeof entry.error === 'object' && entry.error !== null) {
        // Handle error-like objects
        const errorMsg = (entry.error as any).message || (entry.error as any).shortMessage || JSON.stringify(entry.error);
        if (errorMsg && errorMsg !== '{}') {
          console.error('Error details:', errorMsg);
        }
      } else if (entry.error) {
        console.error('Error details:', entry.error);
      }
    }

    // Save to localStorage
    this.saveToStorage();

    // Send critical logs to backend (optional)
    if (entry.level === LogLevel.ERROR || entry.level === LogLevel.AUDIT) {
      this.sendToBackend(entry);
    }
  }

  private getEmoji(level: LogLevel, category: LogCategory): string {
    const emojiMap: Record<string, string> = {
      [`${LogLevel.AUDIT}_${LogCategory.WALLET}`]: '🔐',
      [`${LogLevel.AUDIT}_${LogCategory.NFT}`]: '🎫',
      [`${LogLevel.AUDIT}_${LogCategory.BLOCKCHAIN}`]: '⛓️',
      [`${LogLevel.ERROR}_${LogCategory.WALLET}`]: '❌',
      [`${LogLevel.ERROR}_${LogCategory.NFT}`]: '⚠️',
      [`${LogLevel.INFO}_${LogCategory.WALLET}`]: '💼',
      [`${LogLevel.INFO}_${LogCategory.NFT}`]: '✅',
      [`${LogLevel.WARN}`]: '⚡',
      [`${LogLevel.DEBUG}`]: '🔍',
    };
    
    return emojiMap[`${level}_${category}`] || emojiMap[level] || '📝';
  }

  private getColor(level: LogLevel): string {
    const colorMap: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '#6c757d',
      [LogLevel.INFO]: '#0dcaf0',
      [LogLevel.WARN]: '#ffc107',
      [LogLevel.ERROR]: '#dc3545',
      [LogLevel.AUDIT]: '#198754',
    };
    return colorMap[level] || '#ffffff';
  }

  private async sendToBackend(entry: LogEntry) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      await fetch(`${backendUrl}/logs/frontend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail if backend is unavailable
      });
    } catch {
      // Ignore backend logging errors
    }
  }

  // Public logging methods
  debug(category: LogCategory, action: string, details?: any) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      category,
      action,
      details,
    });
  }

  info(category: LogCategory, action: string, details?: any, metadata?: Record<string, any>) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category,
      action,
      details,
      metadata,
    });
  }

  warn(category: LogCategory, action: string, details?: any) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      category,
      action,
      details,
    });
  }

  error(category: LogCategory, action: string, error: Error | any, details?: any) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      category,
      action,
      error,
      details,
    });
  }

  audit(category: LogCategory, action: string, userAddress: string, details?: any, txHash?: string) {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.AUDIT,
      category,
      action,
      userAddress,
      details,
      txHash,
    });
  }

  // Specialized audit methods
  auditWalletConnect(method: 'metamask' | 'crossmint', address: string, chainId: number) {
    this.audit(
      LogCategory.WALLET,
      'Wallet Connected',
      address,
      {
        method,
        chainId,
        network: chainId === 50312 ? 'Somnia Testnet' : 'Unknown',
      }
    );
  }

  auditWalletDisconnect(address: string) {
    this.audit(LogCategory.WALLET, 'Wallet Disconnected', address);
  }

  auditNFTMint(address: string, txHash: string, tokenId?: number) {
    this.audit(
      LogCategory.NFT,
      'NFT Minted',
      address,
      { tokenId, mintPrice: '0.01 STM' },
      txHash
    );
  }

  auditNFTCheck(address: string, hasNFT: boolean, tokenId?: number) {
    this.audit(
      LogCategory.AUTH,
      'NFT Authentication Check',
      address,
      { authenticated: hasNFT, tokenId }
    );
  }

  auditDocumentUpload(address: string, cid: string, fileSize: number, fileName: string) {
    this.audit(
      LogCategory.UPLOAD,
      'Document Uploaded',
      address,
      { cid, fileSize, fileName, storage: 'IPFS' }
    );
  }

  auditAIExecution(address: string, prompt: string, model: string, tokenId: number) {
    this.audit(
      LogCategory.AI,
      'AI Agent Executed',
      address,
      { prompt: prompt.substring(0, 100), model, tokenId }
    );
  }

  auditNetworkSwitch(address: string, fromChain: number, toChain: number) {
    this.audit(
      LogCategory.NETWORK,
      'Network Switched',
      address,
      { fromChain, toChain }
    );
  }

  // Get logs for display
  getLogs(filter?: { level?: LogLevel; category?: LogCategory; limit?: number }) {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.category) {
      filtered = filtered.filter(log => log.category === filter.category);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered.reverse(); // Most recent first
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.info(LogCategory.SYSTEM, 'Logs cleared');
  }

  // Get statistics
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<LogLevel, number>,
      byCategory: {} as Record<LogCategory, number>,
      errors: this.logs.filter(l => l.level === LogLevel.ERROR).length,
      audits: this.logs.filter(l => l.level === LogLevel.AUDIT).length,
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
export const logger = new FrontendLogger();

// Helper function for transaction logging
export function logTransaction(
  action: string,
  txHash: string,
  userAddress: string,
  details?: any
) {
  logger.audit(
    LogCategory.BLOCKCHAIN,
    action,
    userAddress,
    {
      ...details,
      explorerUrl: `https://explorer.somnia.network/tx/${txHash}`,
    },
    txHash
  );
}

// Helper function for error logging with context
export function logError(
  category: LogCategory,
  action: string,
  error: any,
  context?: any
) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(category, action, err, context);
}
