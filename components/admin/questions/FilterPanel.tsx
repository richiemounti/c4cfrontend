// components/admin/questions/FilterPanel.tsx
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { QuestionLibrary } from '@/types';
import { Category, Theme, SubTheme, Indicator, SDG, Standard, ESGCategory, ResilienceDimension } from "@/types/taxonomy";

// UPDATED: FilterState interface to match the new system
export interface FilterState {
  status: string;
  type: string;
  category?: string;
  theme: string;
  subTheme: string;
  targetAudience: string;
  isTemplate: string;
  theoryOfChangeStage: string; // NEW
  // NEW: Selective tag filters
  selectedIndicatorTags: string;
  selectedSdgTags: string;
  selectedResilienceTags: string;
  selectedEsgTags: string;
  selectedStandardTags: string;
}

// UPDATED: Props interface to include new taxonomy data
interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (key: string, value: any) => void;
  categories?: Category[];
  themes: Theme[];
  subThemes: SubTheme[];
  libraries: QuestionLibrary[];
  // NEW: Taxonomy data for tag filtering
  indicators: Indicator[];
  sdgs: SDG[];
  standards: Standard[];
  esgCategories: ESGCategory[];
  resilienceDimensions: ResilienceDimension[];
}

const FilterPanel = ({ 
  filters, 
  onFilterChange,
  categories,
  themes,
  subThemes,
  libraries,
  // NEW: Taxonomy props
  indicators,
  sdgs,
  standards,
  esgCategories,
  resilienceDimensions
}: FilterPanelProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-stratosphere">Filters</h3>
      
      <div className="space-y-3">
        {/* Basic Filters */}
        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Status
          </label>
          <Select
            value={filters.status || undefined}
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Question Type
          </label>
          <Select
            value={filters.type || undefined}
            onValueChange={(value) => onFilterChange('type', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Long Text</SelectItem>
              <SelectItem value="radio">Multiple Choice</SelectItem>
              <SelectItem value="checkbox">Checkboxes</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="scale">Scale</SelectItem>
              <SelectItem value="matrix">Matrix</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="file">File Upload</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-stratosphere" />

        {/* Taxonomy Hierarchy Filters */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground text-stratosphere">Question Classification</h4>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Category
          </label>
          <Select
            value={filters.category || undefined}
            onValueChange={(value) => onFilterChange('category', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="All Categories"/>
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Theme
          </label>
          <Select
            value={filters.theme || undefined}
            onValueChange={(value) => onFilterChange('theme', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="All Themes" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">All Themes</SelectItem>
              {themes.map(theme => (
                <SelectItem key={theme._id} value={theme._id}>{theme.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            SubTheme
          </label>
          <Select
            value={filters.subTheme || undefined}
            onValueChange={(value) => onFilterChange('subTheme', value)}
            disabled={!filters.theme || filters.theme === 'all'}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="All SubThemes" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">All SubThemes</SelectItem>
              {subThemes
                .filter(subTheme => 
                  !filters.theme || 
                  filters.theme === 'all' || 
                  (typeof subTheme.theme === 'string' 
                    ? subTheme.theme === filters.theme
                    : subTheme.theme._id === filters.theme)
                )
                .map(subTheme => (
                  <SelectItem key={subTheme._id} value={subTheme._id}>{subTheme.name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        {/* NEW: Theory of Change Stage Filter */}
        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Theory of Change Stage
          </label>
          <Select
            value={filters.theoryOfChangeStage || undefined}
            onValueChange={(value) => onFilterChange('theoryOfChangeStage', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Stage 1 - Output">Stage 1 - Output</SelectItem>
              <SelectItem value="Stage 2 - Outcome">Stage 2 - Outcome</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-stratosphere" />

        {/* NEW: Selected Tags Filters */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground text-stratosphere">Selected Tags</h4>
          <p className="text-xs text-muted-foreground mb-3 text-sky">
            Filter by questions that have specific tags assigned
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Indicators
          </label>
          <Select
            value={filters.selectedIndicatorTags || undefined}
            onValueChange={(value) => onFilterChange('selectedIndicatorTags', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="Any Indicators" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">Any Indicators</SelectItem>
              {indicators.map(indicator => (
                <SelectItem key={indicator._id} value={indicator._id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">IND</Badge>
                    {indicator.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            SDGs
          </label>
          <Select
            value={filters.selectedSdgTags || undefined}
            onValueChange={(value) => onFilterChange('selectedSdgTags', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="Any SDGs" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">Any SDGs</SelectItem>
              {sdgs.map(sdg => (
                <SelectItem key={sdg._id} value={sdg._id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{sdg.code}</Badge>
                    {sdg.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Resilience Dimensions
          </label>
          <Select
            value={filters.selectedResilienceTags || undefined}
            onValueChange={(value) => onFilterChange('selectedResilienceTags', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="Any Resilience" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">Any Resilience</SelectItem>
              {resilienceDimensions.map(resilience => (
                <SelectItem key={resilience._id} value={resilience._id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{resilience.code}</Badge>
                    {resilience.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            ESG Categories
          </label>
          <Select
            value={filters.selectedEsgTags || undefined}
            onValueChange={(value) => onFilterChange('selectedEsgTags', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="Any ESG" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">Any ESG</SelectItem>
              {esgCategories.map(esg => (
                <SelectItem key={esg._id} value={esg._id}>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        esg.type === 'Environmental' ? 'bg-green-100 text-green-800' :
                        esg.type === 'Social' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {esg.type.charAt(0)}
                    </Badge>
                    {esg.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Standards
          </label>
          <Select
            value={filters.selectedStandardTags || undefined}
            onValueChange={(value) => onFilterChange('selectedStandardTags', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="Any Standards" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">Any Standards</SelectItem>
              {standards.map(standard => (
                <SelectItem key={standard._id} value={standard._id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{standard.code}</Badge>
                    <div>
                      <div>{standard.name}</div>
                      <div className="text-xs text-muted-foreground">{standard.issuingBody}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-stratosphere" />

        {/* Other Filters */}
        <div>
          <label className="text-sm font-medium mb-1 block">
            Target Audience
          </label>
          <Select
            value={filters.targetAudience || undefined}
            onValueChange={(value) => onFilterChange('targetAudience', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="All Audiences" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">All Audiences</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block text-stratosphere">
            Is Template
          </label>
          <Select
            value={filters.isTemplate || undefined}
            onValueChange={(value) => onFilterChange('isTemplate', value)}
          >
            <SelectTrigger className="border-stratosphere text-stratosphere focus:border-stratosphere focus:ring-stratosphere">
              <SelectValue placeholder="All Questions" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere text-stratosphere">
              <SelectItem value="all">All Questions</SelectItem>
              <SelectItem value="true">Templates Only</SelectItem>
              <SelectItem value="false">Non-Templates Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onFilterChange('reset', null)}
          >
            Reset All Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;