// components/reviews/ReviewFilters.tsx
'use client';

import React from 'react';
import { ReviewStatus, ReviewDueBucket, ReviewFilters as ReviewFiltersType } from '@/types';
import { X, Filter } from 'lucide-react';
import { REVIEW_MODULE_ORDER, REVIEW_MODULE_LABELS } from '@/lib/utils/reviewModules';

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFilterChange: (filters: ReviewFiltersType) => void;
  onClearFilters: () => void;
  showProjectFilters?: boolean;
}

// Filter keys a user can actually toggle from this panel — used to decide
// whether "Clear All" should show. projectId/organizationId/page/limit are
// always present (set by the parent list) and aren't user-facing filters.
const USER_FILTER_KEYS: (keyof ReviewFiltersType)[] = ['status', 'module', 'isOverdue', 'dueBucket'];

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  showProjectFilters = true,
}) => {
  const hasActiveFilters = USER_FILTER_KEYS.some(
    key => filters[key] !== undefined && filters[key] !== false
  );

  const handleFilterChange = (key: keyof ReviewFiltersType, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined, // Remove if empty
    });
  };

  const statusOptions: { value: ReviewStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'escalated', label: 'Escalated' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const dueBucketOptions: { value: ReviewDueBucket; label: string }[] = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'due_today', label: 'Due Today' },
    { value: 'due_this_week', label: 'Due This Week' },
    { value: 'due_later', label: 'Due Later' },
    { value: 'no_deadline', label: 'No Deadline' },
  ];

  const moduleOptions = REVIEW_MODULE_ORDER.map((value) => ({
    value,
    label: REVIEW_MODULE_LABELS[value],
  }));

  return (
    <div className="bg-white border border-concrete-500 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-sky-500" />
          <h3 className="text-lg font-semibold text-stratosphere-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 text-sm text-sky-500 hover:text-sky-500 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-concrete-500 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-white text-stratosphere-900"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date Filter */}
        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Due Date
          </label>
          <select
            value={filters.dueBucket || ''}
            onChange={(e) => handleFilterChange('dueBucket', e.target.value)}
            className="w-full px-3 py-2 border border-concrete-500 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-white text-stratosphere-900"
          >
            <option value="">Any Due Date</option>
            {dueBucketOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Module Filter */}
        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Module
          </label>
          <select
            value={filters.module || ''}
            onChange={(e) => handleFilterChange('module', e.target.value)}
            className="w-full px-3 py-2 border border-concrete-500 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-white text-stratosphere-900"
          >
            <option value="">All Modules</option>
            {moduleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-concrete-500">
            <p className="text-xs text-concrete-900 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.status && (
                <span className="px-2 py-1 bg-sky-50 text-sky-500 rounded text-xs">
                  Status: {statusOptions.find(o => o.value === filters.status)?.label}
                </span>
              )}
              {filters.module && (
                <span className="px-2 py-1 bg-sky-50 text-sky-500 rounded text-xs">
                  Module: {moduleOptions.find(o => o.value === filters.module)?.label}
                </span>
              )}
              {filters.dueBucket && (
                <span className="px-2 py-1 bg-clay-50 text-clay-900 rounded text-xs">
                  Due: {dueBucketOptions.find(o => o.value === filters.dueBucket)?.label}
                </span>
              )}
              {filters.isOverdue && !filters.dueBucket && (
                <span className="px-2 py-1 bg-clay-50 text-clay-900 rounded text-xs">
                  Overdue Only
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewFilters;
