// components/reviews/ReviewFilters.tsx
'use client';

import React from 'react';
import { ReviewStatus, ReviewPriority, ReviewModule, ReviewFilters as ReviewFiltersType } from '@/types';
import { X, Filter } from 'lucide-react';

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFilterChange: (filters: ReviewFiltersType) => void;
  onClearFilters: () => void;
  showProjectFilters?: boolean;
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  showProjectFilters = true,
}) => {
  const hasActiveFilters = Object.keys(filters).some(
    key => filters[key as keyof ReviewFiltersType] !== undefined
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

  const priorityOptions: { value: ReviewPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const moduleOptions: { value: ReviewModule; label: string }[] = [
    { value: 'stakeholder_group', label: 'Stakeholder Group' },
    { value: 'project_setup', label: 'Project Setup' },
    { value: 'project_site_setup', label: 'Project Site Setup' },
    { value: 'stakeholder_action', label: 'Stakeholder Action' },
    { value: 'social_impact', label: 'Social Impact' },
    { value: 'toc_consultation_plan', label: 'ToC Consultation Plan' },
    { value: 'survey', label: 'Survey' },
    { value: 'survey_question', label: 'Survey Question' },
  ];

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

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-stratosphere-900 mb-2">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-concrete-500 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-white text-stratosphere-900"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map((option) => (
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

        {/* Overdue Filter */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isOverdue || false}
              onChange={(e) => handleFilterChange('isOverdue', e.target.checked)}
              className="w-4 h-4 text-sky-500 border-concrete-500 rounded focus:ring-2 focus:ring-sky-500"
            />
            <span className="text-sm text-stratosphere-900">Show only overdue</span>
          </label>
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
              {filters.priority && (
                <span className="px-2 py-1 bg-sky-50 text-sky-500 rounded text-xs">
                  Priority: {priorityOptions.find(o => o.value === filters.priority)?.label}
                </span>
              )}
              {filters.module && (
                <span className="px-2 py-1 bg-sky-50 text-sky-500 rounded text-xs">
                  Module: {moduleOptions.find(o => o.value === filters.module)?.label}
                </span>
              )}
              {filters.isOverdue && (
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