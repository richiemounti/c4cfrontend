// components/reports/ReportsFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { SearchFilters, ReportType, ReportStatus } from '@/types/reports';
import { getReportTypeLabel, getReportStatusLabel } from '@/lib/utils/reports';

interface ReportsFiltersProps {
  filters: Partial<SearchFilters>;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  projectId: string;
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  filters,
  onFiltersChange,
  projectId
}) => {
  const [localFilters, setLocalFilters] = useState<Partial<SearchFilters>>(filters);

  const reportTypes: ReportType[] = [
    'project_setup',
    'project_site_setup', 
    'stakeholder_mapping',
    'theory_of_change',
    'risk_register'
  ];

  const reportStatuses: ReportStatus[] = [
    'draft',
    'generated',
    'approved',
    'published',
    'archived'
  ];

  const visibilityOptions = [
    { value: 'private', label: 'Private' },
    { value: 'organization', label: 'Organization' },
    { value: 'public', label: 'Public' }
  ];

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterChange = (key: keyof SearchFilters, value: string, checked: boolean) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  };

  const clearFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key as keyof SearchFilters];
      return value !== undefined && value !== null && 
        (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-stratosphere">
          Filters ({getActiveFilterCount()})
        </h3>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-sky hover:text-stratosphere"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Report Type Filter */}
      <div>
        <label className="block text-sm font-medium text-stratosphere mb-3">
          Report Type
          {localFilters.reportType && localFilters.reportType.length > 0 && (
            <button
              onClick={() => clearFilter('reportType')}
              className="ml-2 text-xs text-sky hover:text-stratosphere"
            >
              <X size={12} className="inline" /> Clear
            </button>
          )}
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {reportTypes.map(type => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(localFilters.reportType || []).includes(type)}
                onChange={(e) => handleArrayFilterChange('reportType', type, e.target.checked)}
                className="rounded border-sky text-sky focus:ring-sky"
              />
              <span className="text-sm text-stratosphere">{getReportTypeLabel(type)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-stratosphere mb-3">
          Status
          {localFilters.status && localFilters.status.length > 0 && (
            <button
              onClick={() => clearFilter('status')}
              className="ml-2 text-xs text-sky hover:text-stratosphere"
            >
              <X size={12} className="inline" /> Clear
            </button>
          )}
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {reportStatuses.map(status => (
            <label key={status} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(localFilters.status || []).includes(status)}
                onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                className="rounded border-sky text-sky focus:ring-sky"
              />
              <span className="text-sm text-stratosphere">{getReportStatusLabel(status)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Visibility Filter */}
      <div>
        <label className="block text-sm font-medium text-stratosphere mb-3">
          Visibility
          {localFilters.visibility && localFilters.visibility.length > 0 && (
            <button
              onClick={() => clearFilter('visibility')}
              className="ml-2 text-xs text-sky hover:text-stratosphere"
            >
              <X size={12} className="inline" /> Clear
            </button>
          )}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {visibilityOptions.map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(localFilters.visibility || []).includes(option.value)}
                onChange={(e) => handleArrayFilterChange('visibility', option.value, e.target.checked)}
                className="rounded border-sky text-sky focus:ring-sky"
              />
              <span className="text-sm text-stratosphere">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-stratosphere mb-3">
          Date Range
          {(localFilters.createdAfter || localFilters.createdBefore) && (
            <button
              onClick={() => {
                clearFilter('createdAfter');
                clearFilter('createdBefore');
              }}
              className="ml-2 text-xs text-sky hover:text-stratosphere"
            >
              <X size={12} className="inline" /> Clear
            </button>
          )}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-sky mb-1">From</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky" />
              <input
                type="date"
                value={localFilters.createdAfter || ''}
                onChange={(e) => handleFilterChange('createdAfter', e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-sky mb-1">To</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky" />
              <input
                type="date"
                value={localFilters.createdBefore || ''}
                onChange={(e) => handleFilterChange('createdBefore', e.target.value || undefined)}
                className="w-full pl-10 pr-4 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completion Percentage Filter */}
      <div>
        <label className="block text-sm font-medium text-stratosphere mb-3">
          Completion Percentage
          {(localFilters.minCompletionPercentage || localFilters.maxCompletionPercentage) && (
            <button
              onClick={() => {
                clearFilter('minCompletionPercentage');
                clearFilter('maxCompletionPercentage');
              }}
              className="ml-2 text-xs text-sky hover:text-stratosphere"
            >
              <X size={12} className="inline" /> Clear
            </button>
          )}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-sky mb-1">Min %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={localFilters.minCompletionPercentage || ''}
              onChange={(e) => handleFilterChange('minCompletionPercentage', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent text-sm"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <label className="block text-sm font-medium text-stratosphere mb-3">Advanced Options</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.hasExports || false}
              onChange={(e) => handleFilterChange('hasExports', e.target.checked || undefined)}
              className="rounded border-sky text-sky focus:ring-sky"
            />
            <span className="text-sm text-stratosphere">Has exports</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.hasSnapshots || false}
              onChange={(e) => handleFilterChange('hasSnapshots', e.target.checked || undefined)}
              className="rounded border-sky text-sky focus:ring-sky"
            />
            <span className="text-sm text-stratosphere">Has version history</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.isExpired || false}
              onChange={(e) => handleFilterChange('isExpired', e.target.checked || undefined)}
              className="rounded border-sky text-sky focus:ring-sky"
            />
            <span className="text-sm text-stratosphere">Expired reports</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.needsRegeneration || false}
              onChange={(e) => handleFilterChange('needsRegeneration', e.target.checked || undefined)}
              className="rounded border-sky text-sky focus:ring-sky"
            />
            <span className="text-sm text-stratosphere">Needs regeneration</span>
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {getActiveFilterCount() > 0 && (
        <div className="border-t border-sky-tint pt-4">
          <h4 className="text-sm font-medium text-stratosphere mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {localFilters.reportType?.map(type => (
              <span key={type} className="inline-flex items-center px-2 py-1 bg-sky-tint text-stratosphere text-xs rounded-full">
                {getReportTypeLabel(type as ReportType)}
                <button
                  onClick={() => handleArrayFilterChange('reportType', type, false)}
                  className="ml-1 text-sky hover:text-stratosphere"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {localFilters.status?.map(status => (
              <span key={status} className="inline-flex items-center px-2 py-1 bg-sky-tint text-stratosphere text-xs rounded-full">
                {getReportStatusLabel(status as ReportStatus)}
                <button
                  onClick={() => handleArrayFilterChange('status', status, false)}
                  className="ml-1 text-sky hover:text-stratosphere"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {localFilters.createdAfter && (
              <span className="inline-flex items-center px-2 py-1 bg-sky-tint text-stratosphere text-xs rounded-full">
                From: {localFilters.createdAfter}
                <button
                  onClick={() => clearFilter('createdAfter')}
                  className="ml-1 text-sky hover:text-stratosphere"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {localFilters.createdBefore && (
              <span className="inline-flex items-center px-2 py-1 bg-sky-tint text-stratosphere text-xs rounded-full">
                To: {localFilters.createdBefore}
                <button
                  onClick={() => clearFilter('createdBefore')}
                  className="ml-1 text-sky hover:text-stratosphere"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsFilters; 