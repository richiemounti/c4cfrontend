// components/reports/ReportsFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { SearchFilters, ReportType, ReportStatus } from '@/types/reports';
import { getReportTypeLabel, getReportStatusLabel } from '@/lib/utils/reports';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
    <div className="flex flex-col gap-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-black">
          Filters ({getActiveFilterCount()})
        </h3>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-c4c-petrol hover:text-black"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Report Type Filter */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Report Type
          {localFilters.reportType && localFilters.reportType.length > 0 && (
            <button
              onClick={() => clearFilter('reportType')}
              className="ml-2 text-xs text-c4c-petrol hover:text-black"
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
                className="accent-c4c-petrol"
              />
              <span className="text-sm text-black">{getReportTypeLabel(type)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Status
          {localFilters.status && localFilters.status.length > 0 && (
            <button
              onClick={() => clearFilter('status')}
              className="ml-2 text-xs text-c4c-petrol hover:text-black"
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
                className="accent-c4c-petrol"
              />
              <span className="text-sm text-black">{getReportStatusLabel(status)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Visibility Filter */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Visibility
          {localFilters.visibility && localFilters.visibility.length > 0 && (
            <button
              onClick={() => clearFilter('visibility')}
              className="ml-2 text-xs text-c4c-petrol hover:text-black"
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
                className="accent-c4c-petrol"
              />
              <span className="text-sm text-black">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Date Range
          {(localFilters.createdAfter || localFilters.createdBefore) && (
            <button
              onClick={() => {
                clearFilter('createdAfter');
                clearFilter('createdBefore');
              }}
              className="ml-2 text-xs text-c4c-petrol hover:text-black"
            >
              <X size={12} className="inline" /> Clear
            </button>
          )}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-c4c-petrol mb-1">From</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-c4c-petrol" />
              <Input
                type="date"
                value={localFilters.createdAfter || ''}
                onChange={(e) => handleFilterChange('createdAfter', e.target.value || undefined)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-c4c-petrol mb-1">To</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-c4c-petrol" />
              <Input
                type="date"
                value={localFilters.createdBefore || ''}
                onChange={(e) => handleFilterChange('createdBefore', e.target.value || undefined)}
                className="pl-10 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completion Percentage Filter */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Completion Percentage
          {(localFilters.minCompletionPercentage || localFilters.maxCompletionPercentage) && (
            <button
              onClick={() => {
                clearFilter('minCompletionPercentage');
                clearFilter('maxCompletionPercentage');
              }}
              className="ml-2 text-xs text-c4c-petrol hover:text-black"
            >
              <X size={12} className="inline" /> Clear
            </button>
          )}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-c4c-petrol mb-1">Min %</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={localFilters.minCompletionPercentage || ''}
              onChange={(e) => handleFilterChange('minCompletionPercentage', e.target.value ? parseInt(e.target.value) : undefined)}
              className="text-sm"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">Advanced Options</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.hasExports || false}
              onChange={(e) => handleFilterChange('hasExports', e.target.checked || undefined)}
              className="accent-c4c-petrol"
            />
            <span className="text-sm text-black">Has exports</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.hasSnapshots || false}
              onChange={(e) => handleFilterChange('hasSnapshots', e.target.checked || undefined)}
              className="accent-c4c-petrol"
            />
            <span className="text-sm text-black">Has version history</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.isExpired || false}
              onChange={(e) => handleFilterChange('isExpired', e.target.checked || undefined)}
              className="accent-c4c-petrol"
            />
            <span className="text-sm text-black">Expired reports</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.needsRegeneration || false}
              onChange={(e) => handleFilterChange('needsRegeneration', e.target.checked || undefined)}
              className="accent-c4c-petrol"
            />
            <span className="text-sm text-black">Needs regeneration</span>
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {getActiveFilterCount() > 0 && (
        <div className="border-t border-c4c-rule pt-4">
          <h4 className="text-sm font-medium text-black mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {localFilters.reportType?.map(type => (
              <Badge key={type} variant="quiet">
                {getReportTypeLabel(type as ReportType)}
                <button onClick={() => handleArrayFilterChange('reportType', type, false)}>
                  <X size={12} />
                </button>
              </Badge>
            ))}
            {localFilters.status?.map(status => (
              <Badge key={status} variant="quiet">
                {getReportStatusLabel(status as ReportStatus)}
                <button onClick={() => handleArrayFilterChange('status', status, false)}>
                  <X size={12} />
                </button>
              </Badge>
            ))}
            {localFilters.createdAfter && (
              <Badge variant="quiet">
                From: {localFilters.createdAfter}
                <button onClick={() => clearFilter('createdAfter')}>
                  <X size={12} />
                </button>
              </Badge>
            )}
            {localFilters.createdBefore && (
              <Badge variant="quiet">
                To: {localFilters.createdBefore}
                <button onClick={() => clearFilter('createdBefore')}>
                  <X size={12} />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsFilters;
