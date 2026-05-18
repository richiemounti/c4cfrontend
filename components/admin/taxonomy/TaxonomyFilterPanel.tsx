// components/admin/taxonomy/TaxonomyFilterPanel.tsx
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Category, Theme, SDG, ResilienceDimension, ESGCategory, Standard, Indicator } from '@/types/taxonomy';

export interface TaxonomyFilterState {
  status: string;
  parentId?: string;
  theoryOfChangeStage?: string;
  indicatorTags?: string[];
  sdgTags?: string[];
  resilienceTags?: string[];
  esgTags?: string[];
  standardTags?: string[];
  [key: string]: string | string[] | undefined;
}

interface AvailableTags {
  indicators: Indicator[];
  sdgs: SDG[];
  resilienceDimensions: ResilienceDimension[];
  esgCategories: ESGCategory[];
  standards: Standard[];
}

interface TaxonomyFilterPanelProps {
  filters: TaxonomyFilterState;
  onFilterChange: (key: string, value: any) => void;
  type: 'category' | 'theme' | 'subtheme' | 'indicator' | 'esg-category' | 'resilience-dimension' | 'sdg' | 'standard';
  parentItems?: Category[] | Theme[];
  parentLabel?: string;
  availableTags?: AvailableTags; // Add this for subtheme filtering
  customFilters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

const TaxonomyFilterPanel: React.FC<TaxonomyFilterPanelProps> = ({
  filters,
  onFilterChange,
  type,
  parentItems = [],
  parentLabel,
  availableTags,
  customFilters = []
}) => {
  const handleReset = () => {
    onFilterChange('reset', null);
  };

  // Helper function to handle multi-select changes
  const handleMultiSelectChange = (key: string, selectedValue: string, currentValues: string[] = []) => {
    if (selectedValue === 'all') {
      onFilterChange(key, []);
      return;
    }
    
    const newValues = currentValues.includes(selectedValue)
      ? currentValues.filter(val => val !== selectedValue)
      : [...currentValues, selectedValue];
    
    onFilterChange(key, newValues);
  };

  // Helper function to remove a tag from multi-select
  const handleRemoveTag = (key: string, valueToRemove: string, currentValues: string[] = []) => {
    const newValues = currentValues.filter(val => val !== valueToRemove);
    onFilterChange(key, newValues);
  };

  // Multi-select component for tags
  const MultiSelectFilter: React.FC<{
    label: string;
    filterKey: string;
    options: Array<{ _id: string; code?: string; name: string }>;
    selectedValues: string[];
  }> = ({ label, filterKey, options, selectedValues }) => {
    return (
      <div>
        <h3 className="font-semibold mb-2 text-stratosphere">{label}</h3>
        
        {/* Selected tags display */}
        {selectedValues.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {selectedValues.map((tagId) => {
              const tag = options.find(opt => opt._id === tagId);
              return tag ? (
                <Badge key={tagId} variant="secondary" className="text-xs bg-stratosphere-100 text-stratosphere border-stratosphere">
                  {tag.code || tag.name}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-red-600" 
                    onClick={() => handleRemoveTag(filterKey, tagId, selectedValues)}
                  />
                </Badge>
              ) : null;
            })}
          </div>
        )}
        
        {/* Dropdown for adding tags */}
        <Select
          value="" // Always empty to allow multiple selections
          onValueChange={(value) => handleMultiSelectChange(filterKey, value, selectedValues)}
        >
          <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
            <SelectValue placeholder={`Add ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className="bg-white border-stratosphere">
            <SelectItem value="all">Clear all</SelectItem>
            {options.map((option) => (
              <SelectItem 
                key={option._id} 
                value={option._id}
                className={selectedValues.includes(option._id) ? "bg-muted" : ""}
              >
                <div className="flex items-center">
                  {selectedValues.includes(option._id) && (
                    <span className="mr-2">✓</span>
                  )}
                  {option.code ? `${option.code}: ${option.name}` : option.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Determine the default parent label based on type
  const getDefaultParentLabel = () => {
    switch (type) {
      case 'subtheme':
        return 'Theme';
      case 'indicator':
        return 'SubTheme';
      default:
        return undefined;
    }
  };

  const finalParentLabel = parentLabel || getDefaultParentLabel();

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div>
        <h3 className="font-semibold mb-2 text-stratosphere">Status</h3>
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-stratosphere">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Parent Items Filter (Only show if parentItems are provided) */}
      {parentItems.length > 0 && finalParentLabel && (
        <div>
          <h3 className="font-semibold mb-2 text-stratosphere">{finalParentLabel}</h3>
          <Select
            value={filters.parentId || 'all'}
            onValueChange={(value) => onFilterChange('parentId', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder={`Select ${finalParentLabel.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere">
              <SelectItem value="all">All {finalParentLabel}s</SelectItem>
              {parentItems.map((item) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Theory of Change Stage Filter (for subthemes) */}
      {(type === 'subtheme' || type === 'theme') && (
        <div>
          <h3 className="font-semibold mb-2 text-stratosphere">Theory of Change Stage</h3>
          <Select
            value={filters.theoryOfChangeStage || 'all'}
            onValueChange={(value) => onFilterChange('theoryOfChangeStage', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere">
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Stage 1 - Output">Stage 1 - Output</SelectItem>
              <SelectItem value="Stage 2 - Outcome">Stage 2 - Outcome</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tag Filters (for subthemes) */}
      {type === 'subtheme' && availableTags && (
        <>
          {/* Indicators Tags */}
          {availableTags.indicators.length > 0 && (
            <MultiSelectFilter
              label="Indicator Tags"
              filterKey="sdgTags"
              options={availableTags.indicators}
              selectedValues={filters.indicatorTags || []}
            />
          )}
          {/* SDG Tags */}
          {availableTags.sdgs.length > 0 && (
            <MultiSelectFilter
              label="SDG Tags"
              filterKey="sdgTags"
              options={availableTags.sdgs}
              selectedValues={filters.sdgTags || []}
            />
          )}

          {/* Resilience Tags */}
          {availableTags.resilienceDimensions.length > 0 && (
            <MultiSelectFilter
              label="Resilience Tags"
              filterKey="resilienceTags"
              options={availableTags.resilienceDimensions}
              selectedValues={filters.resilienceTags || []}
            />
          )}

          {/* ESG Tags */}
          {availableTags.esgCategories.length > 0 && (
            <MultiSelectFilter
              label="ESG Tags"
              filterKey="esgTags"
              options={availableTags.esgCategories}
              selectedValues={filters.esgTags || []}
            />
          )}

          {/* Standard Tags */}
          {availableTags.standards.length > 0 && (
            <MultiSelectFilter
              label="Standards"
              filterKey="standardTags"
              options={availableTags.standards}
              selectedValues={filters.standardTags || []}
            />
          )}
        </>
      )}

      {/* Custom Filters */}
      {customFilters && customFilters.map((filter) => (
        <div key={filter.key}>
          <h3 className="font-semibold mb-2 text-stratosphere">{filter.label}</h3>
          <Select
            value={filters[filter.key] as string || 'all'}
            onValueChange={(value) => onFilterChange(filter.key, value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere">
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {/* Reset Button */}
      <Button
        variant="ghost"
        className="w-full mt-4"
        onClick={handleReset}
      >
        Reset Filters
      </Button>
      
      {/* Active Filters Summary */}
      {(filters.status !== 'all' || 
        (filters.parentId && filters.parentId !== 'all') ||
        (filters.theoryOfChangeStage && filters.theoryOfChangeStage !== 'all') ||
        (filters.sdgTags && filters.sdgTags.length > 0) ||
        (filters.resilienceTags && filters.resilienceTags.length > 0) ||
        (filters.esgTags && filters.esgTags.length > 0) ||
        (filters.standardTags && filters.standardTags.length > 0)
      ) && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
          <div className="text-xs space-y-1">
            {filters.status !== 'all' && (
              <div>Status: <span className="font-medium">{filters.status}</span></div>
            )}
            {filters.parentId && filters.parentId !== 'all' && finalParentLabel && (
              <div>{finalParentLabel}: <span className="font-medium">Selected</span></div>
            )}
            {filters.theoryOfChangeStage && filters.theoryOfChangeStage !== 'all' && (
              <div>Stage: <span className="font-medium">{filters.theoryOfChangeStage}</span></div>
            )}
            {filters.sdgTags && filters.sdgTags.length > 0 && (
              <div>SDGs: <span className="font-medium">{filters.sdgTags.length} selected</span></div>
            )}
            {filters.resilienceTags && filters.resilienceTags.length > 0 && (
              <div>Resilience: <span className="font-medium">{filters.resilienceTags.length} selected</span></div>
            )}
            {filters.esgTags && filters.esgTags.length > 0 && (
              <div>ESG: <span className="font-medium">{filters.esgTags.length} selected</span></div>
            )}
            {filters.standardTags && filters.standardTags.length > 0 && (
              <div>Standards: <span className="font-medium">{filters.standardTags.length} selected</span></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxonomyFilterPanel;