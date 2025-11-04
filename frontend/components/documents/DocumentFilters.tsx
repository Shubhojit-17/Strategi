'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../ui/GlassPanel';

interface FilterOptions {
  fileTypes: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

interface DocumentFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  documentCount: number;
}

const FILE_TYPE_OPTIONS = [
  { value: 'pdf', label: 'PDF', icon: '📕' },
  { value: 'doc', label: 'Word', icon: '📘' },
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'markdown', label: 'Markdown', icon: '📄' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
] as const;

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFilterChange,
  documentCount,
}) => {
  const handleFileTypeToggle = (fileType: string) => {
    const newFileTypes = filters.fileTypes.includes(fileType)
      ? filters.fileTypes.filter((t) => t !== fileType)
      : [...filters.fileTypes, fileType];
    
    onFilterChange({ ...filters, fileTypes: newFileTypes });
  };

  const handleDateRangeChange = (dateRange: FilterOptions['dateRange']) => {
    onFilterChange({ ...filters, dateRange });
  };

  const handleClearFilters = () => {
    onFilterChange({
      fileTypes: [],
      dateRange: 'all',
    });
  };

  const hasActiveFilters = filters.fileTypes.length > 0 || filters.dateRange !== 'all';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full"
    >
      <GlassPanel className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-primary-light hover:text-accent transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="mb-6 py-2 px-3 bg-primary-light/10 rounded-lg border border-primary-light/30">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-primary-light">{documentCount}</span>
            {' '}
            {documentCount === 1 ? 'document' : 'documents'}
          </p>
        </div>

        {/* File Type Filters */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">File Type</h4>
          <div className="space-y-2">
            {FILE_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.fileTypes.includes(option.value)}
                  onChange={() => handleFileTypeToggle(option.value)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary-light focus:ring-primary-light focus:ring-offset-0"
                />
                <span className="text-xl">{option.icon}</span>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Date Range</h4>
          <div className="space-y-2">
            {DATE_RANGE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="dateRange"
                  checked={filters.dateRange === option.value}
                  onChange={() => handleDateRangeChange(option.value)}
                  className="w-4 h-4 border-gray-600 bg-gray-800 text-primary-light focus:ring-primary-light focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
};
