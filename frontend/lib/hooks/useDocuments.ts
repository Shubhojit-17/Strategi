import { useState, useEffect, useCallback } from 'react';

interface Document {
  document_id: number;
  filename: string;
  ipfs_hash: string;
  document_hash: string;
  user_address: string;
  token_id: number;
  timestamp: number;
  tx_hash: string;
  block_number: number;
  gateway_url?: string; // Added by backend
}

interface FilterOptions {
  fileTypes: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

interface UseDocumentsReturn {
  documents: Document[];
  filteredDocuments: Document[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: FilterOptions;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FilterOptions) => void;
  refreshDocuments: () => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    fileTypes: [],
    dateRange: 'all',
  });

  // Fetch documents from backend
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get user address from localStorage
      const userAddress = localStorage.getItem('wallet_address');
      if (!userAddress) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:8000/documents/list?user_address=${userAddress}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      // Backend returns { documents: [...], count: number, user_address: string }
      // Extract the documents array
      setDocuments(data.documents || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.filename.toLowerCase().includes(query) ||
          doc.ipfs_hash.toLowerCase().includes(query)
      );
    }

    // Apply file type filter (check filename extension)
    if (filters.fileTypes.length > 0) {
      filtered = filtered.filter((doc) =>
        filters.fileTypes.some((type) => {
          const extension = doc.filename.split('.').pop()?.toLowerCase() || '';
          return (
            (type === 'pdf' && extension === 'pdf') ||
            (type === 'word' && (extension === 'doc' || extension === 'docx')) ||
            (type === 'text' && extension === 'txt') ||
            (type === 'markdown' && (extension === 'md' || extension === 'markdown'))
          );
        })
      );
    }

    // Apply date range filter (timestamp is in seconds, convert to milliseconds)
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const ranges = {
        today: 1,
        week: 7,
        month: 30,
        year: 365,
      };
      const days = ranges[filters.dateRange];
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((doc) => new Date(doc.timestamp * 1000) >= cutoff);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, filters]);

  // Delete document
  const deleteDocument = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/documents/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.document_id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    documents,
    filteredDocuments,
    isLoading,
    error,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    refreshDocuments: fetchDocuments,
    deleteDocument,
  };
};
