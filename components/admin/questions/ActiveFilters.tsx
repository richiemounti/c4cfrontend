// components/admin/questions/ActiveFilters.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { Category, Theme, SubTheme, Indicator, SDG, Standard, ESGCategory, ResilienceDimension } from '@/types/taxonomy';

// Updated FilterState interface to match the one in the questions page
interface UpdatedFilterState {
  status: string;
  type: string;
  category?: string;
  theme: string;
  subTheme: string;
  targetAudience: string;
  isTemplate: string;
  theoryOfChangeStage: string;
  // NEW: Selective tag filters
  selectedIndicatorTags: string;
  selectedSdgTags: string;
  selectedResilienceTags: string;
  selectedEsgTags: string;
  selectedStandardTags: string;
}

interface ActiveFiltersProps {
  filters: UpdatedFilterState;
  onFilterChange: (key: string, value: any) => void;
  categories?: Category[];
  themes: Theme[];
  subThemes: SubTheme[];
  // NEW: Add taxonomy data props
  indicators: Indicator[];
  sdgs: SDG[];
  standards: Standard[];
  esgCategories: ESGCategory[];
  resilienceDimensions: ResilienceDimension[];
}

const ActiveFilters = ({
  filters,
  onFilterChange,
  categories,
  themes,
  subThemes,
  indicators,
  sdgs,
  standards,
  esgCategories,
  resilienceDimensions,
}: ActiveFiltersProps) => {
  // Helper function to get multiple selected items by IDs
  const getSelectedItems = (selectedIds: string, items: any[], nameField: string = 'name') => {
    if (!selectedIds || selectedIds === 'all') return [];
    
    const ids = selectedIds.split(',');
    return items.filter(item => ids.includes(item._id)).map(item => item[nameField]);
  };

  // Helper function to get display text for tag filters
  const getTagFilterDisplayText = (filterKey: string, selectedIds: string) => {
    if (!selectedIds || selectedIds === 'all') return null;
    
    const ids = selectedIds.split(',');
    let items: any[] = [];
    let displayField = 'name';
    
    switch (filterKey) {
      case 'selectedIndicatorTags':
        items = indicators;
        break;
      case 'selectedSdgTags':
        items = sdgs;
        displayField = 'code'; // SDGs typically display by code
        break;
      case 'selectedResilienceTags':
        items = resilienceDimensions;
        displayField = 'code'; // Resilience dimensions typically display by code
        break;
      case 'selectedEsgTags':
        items = esgCategories;
        displayField = 'code'; // ESG categories typically display by code
        break;
      case 'selectedStandardTags':
        items = standards;
        displayField = 'code'; // Standards typically display by code
        break;
      default:
        return null;
    }
    
    const selectedItems = items.filter(item => ids.includes(item._id));
    
    if (selectedItems.length === 0) return null;
    if (selectedItems.length === 1) return selectedItems[0][displayField];
    if (selectedItems.length <= 3) {
      return selectedItems.map(item => item[displayField]).join(', ');
    }
    
    // If more than 3 items, show first 2 and count
    return `${selectedItems.slice(0, 2).map(item => item[displayField]).join(', ')} +${selectedItems.length - 2} more`;
  };

  // Helper function to get filter label
  const getFilterLabel = (filterKey: string) => {
    switch (filterKey) {
      case 'selectedIndicatorTags':
        return 'Indicators';
      case 'selectedSdgTags':
        return 'SDGs';
      case 'selectedResilienceTags':
        return 'Resilience';
      case 'selectedEsgTags':
        return 'ESG';
      case 'selectedStandardTags':
        return 'Standards';
      case 'theoryOfChangeStage':
        return 'ToC Stage';
      default:
        return filterKey.charAt(0).toUpperCase() + filterKey.slice(1);
    }
  };

  // Check if there are any active filters
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    return value && value !== 'all';
  });

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground text-stratosphere">Active filters:</span>
        
        {/* Status Filter */}
        {filters.status && filters.status !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Status: {filters.status}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1"
              onClick={() => onFilterChange('status', 'all')}
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Type Filter */}
        {filters.type && filters.type !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Type: {filters.type}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1"
              onClick={() => onFilterChange('type', 'all')}
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Category Filter */}
        {filters.category && filters.category !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Category: {categories?.find(c => c._id === filters.category)?.name || 'Unknown'}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1"
              onClick={() => onFilterChange('category', 'all')}
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Theme Filter */}
        {filters.theme && filters.theme !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Theme: {themes.find(t => t._id === filters.theme)?.name || 'Unknown'}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1"
              onClick={() => onFilterChange('theme', 'all')}
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* SubTheme Filter */}
        {filters.subTheme && filters.subTheme !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            SubTheme: {subThemes.find(st => st._id === filters.subTheme)?.name || 'Unknown'}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1"
              onClick={() => onFilterChange('subTheme', 'all')}
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Target Audience Filter */}
        {filters.targetAudience && filters.targetAudience !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Audience: {filters.targetAudience}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1"
              onClick={() => onFilterChange('targetAudience', 'all')}
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Is Template Filter */}
        {filters.isTemplate && filters.isTemplate !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Template: {filters.isTemplate === 'true' ? 'Yes' : 'No'}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1"
              onClick={() => onFilterChange('isTemplate', 'all')}
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* Theory of Change Stage Filter */}
        {filters.theoryOfChangeStage && filters.theoryOfChangeStage !== 'all' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            ToC Stage: {filters.theoryOfChangeStage}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1"
              onClick={() => onFilterChange('theoryOfChangeStage', 'all')}
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        
        {/* NEW: Selective Tag Filters */}
        {Object.entries(filters).map(([filterKey, filterValue]) => {
          // Only process the selective tag filters
          if (!filterKey.startsWith('selected') || !filterValue || filterValue === 'all') {
            return null;
          }
          
          const displayText = getTagFilterDisplayText(filterKey, filterValue);
          if (!displayText) return null;
          
          return (
            <Badge key={filterKey} variant="secondary" className="flex items-center gap-1">
              {getFilterLabel(filterKey)}: {displayText}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1"
                onClick={() => onFilterChange(filterKey, 'all')}
              >
                <span className="sr-only">Remove filter</span>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
        
        {/* Clear All Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => onFilterChange('reset', null)}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
};

export default ActiveFilters;