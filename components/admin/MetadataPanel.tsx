// components/admin/MetadataPanel.tsx
import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Users, Shield, Tag, Layers, Info, ChevronDown, Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Category, 
  Theme, 
  SubTheme, 
  Indicator,
  SDG,
  Standard,
  ESGCategory,
  ResilienceDimension
} from '@/types/taxonomy';
import { 
  DEMOGRAPHIC_TYPES,
  DEMOGRAPHIC_CATEGORIES,
  SENSITIVITY_LEVELS,
  TARGET_AUDIENCES
} from '@/types';
import { getSubthemeAvailableTags } from '@/lib/api/question';

interface MetadataPanelProps {
  question: any;
  onChange: (updatedQuestion: any) => void;
  categories?: Category[];
  themes: Theme[];
  subThemes: SubTheme[];
  indicators: Indicator[];
  sdgs: SDG[];
  standards: Standard[];
  esgCategories: ESGCategory[];
  resilienceDimensions: ResilienceDimension[];
}

// Deduplicate tag arrays by _id
function dedupeTags(tags: any[]): any[] {
  const seen = new Set<string>();
  return tags.filter(tag => {
    const id = tag._id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({ 
  question, 
  onChange, 
  categories = [],
  themes,
  subThemes,
  indicators,
  sdgs,
  standards,
  esgCategories,
  resilienceDimensions
}) => {
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<any>(null);
  const [loadingTags, setLoadingTags] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [themeSearch, setThemeSearch] = useState('');
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);
  const [subThemeSearch, setSubThemeSearch] = useState('');
  const [tagSectionsOpen, setTagSectionsOpen] = useState<{[key: string]: boolean}>({
    indicators: false,
    sdgs: false,
    resilience: false,
    esg: false,
    standards: false
  });
  const [advancedDemographicsOpen, setAdvancedDemographicsOpen] = useState(false);

  // ── Load and merge available tags across ALL selected subThemes ──
  useEffect(() => {
    const loadAvailableTags = async () => {
      const selectedSubThemeIds: string[] = question.subThemes || [];

      if (selectedSubThemeIds.length === 0) {
        setAvailableTags(null);
        return;
      }

      setLoadingTags(true);
      try {
        // Fetch tags for each selected subtheme in parallel
        const responses = await Promise.all(
          selectedSubThemeIds.map((id: string) => getSubthemeAvailableTags(id))
        );

        // Merge and deduplicate across all responses
        const merged = {
          indicators: dedupeTags(responses.flatMap(r => r.data.availableTags?.indicators || [])),
          sdgs:       dedupeTags(responses.flatMap(r => r.data.availableTags?.sdgs || [])),
          resilience: dedupeTags(responses.flatMap(r => r.data.availableTags?.resilience || [])),
          esg:        dedupeTags(responses.flatMap(r => r.data.availableTags?.esg || [])),
          standards:  dedupeTags(responses.flatMap(r => r.data.availableTags?.standards || [])),
        };

        setAvailableTags(merged);
      } catch (error) {
        console.error('Error loading available tags:', error);
        setAvailableTags(null);
      } finally {
        setLoadingTags(false);
      }
    };

    loadAvailableTags();
  }, [JSON.stringify(question.subThemes)]); // re-run when the subThemes array contents change

  // SubThemes filtered to the selected theme
  const filteredSubThemes = subThemes.filter(subTheme => {
    if (!question.theme) return false;
    return typeof subTheme.theme === 'string'
      ? subTheme.theme === question.theme
      : (subTheme.theme as Theme)._id === question.theme;
  });

  // ── Category helpers (multi-select) ──
  const selectedCategories: string[] = question.categories || [];

  const handleCategoryToggle = (catId: string, checked: boolean) => {
    const updated = checked
      ? [...selectedCategories, catId]
      : selectedCategories.filter((id: string) => id !== catId);
    onChange({ ...question, categories: updated });
  };

  // ── SubTheme helpers (multi-select) ──
  const selectedSubThemeIds: string[] = question.subThemes || [];

  const handleSubThemeToggle = (subThemeId: string, checked: boolean) => {
    if (checked) {
      onChange({
        ...question,
        subThemes: [...selectedSubThemeIds, subThemeId],
        // Don't wipe tags — they get recomputed by the useEffect
      });
    } else {
      // When removing a subtheme, also remove any tags that were only
      // available from that subtheme
      const removedSubTheme = subThemes.find(st => st._id === subThemeId);
      const removedIndicators = new Set((removedSubTheme?.indicatorTags || []).map((t: any) => typeof t === 'object' ? t._id : t));
      const removedSdgs       = new Set((removedSubTheme?.sdgTags || []).map((t: any) => typeof t === 'object' ? t._id : t));
      const removedResilience = new Set((removedSubTheme?.resilienceTags || []).map((t: any) => typeof t === 'object' ? t._id : t));
      const removedEsg        = new Set((removedSubTheme?.esgTags || []).map((t: any) => typeof t === 'object' ? t._id : t));
      const removedStandards  = new Set((removedSubTheme?.standardTags || []).map((t: any) => typeof t === 'object' ? t._id : t));

      // Remaining subthemes after removal
      const remainingIds = selectedSubThemeIds.filter(id => id !== subThemeId);
      const remainingSubThemes = subThemes.filter(st => remainingIds.includes(st._id));

      // Tags still available from remaining subthemes
      const stillAvailableIndicators = new Set(remainingSubThemes.flatMap(st => (st.indicatorTags || []).map((t: any) => typeof t === 'object' ? t._id : t)));
      const stillAvailableSdgs       = new Set(remainingSubThemes.flatMap(st => (st.sdgTags || []).map((t: any) => typeof t === 'object' ? t._id : t)));
      const stillAvailableResilience = new Set(remainingSubThemes.flatMap(st => (st.resilienceTags || []).map((t: any) => typeof t === 'object' ? t._id : t)));
      const stillAvailableEsg        = new Set(remainingSubThemes.flatMap(st => (st.esgTags || []).map((t: any) => typeof t === 'object' ? t._id : t)));
      const stillAvailableStandards  = new Set(remainingSubThemes.flatMap(st => (st.standardTags || []).map((t: any) => typeof t === 'object' ? t._id : t)));

      onChange({
        ...question,
        subThemes: remainingIds,
        // Keep only tags still available in remaining subthemes
        selectedIndicatorTags: (question.selectedIndicatorTags || []).filter((id: string) => stillAvailableIndicators.has(id)),
        selectedSdgTags:       (question.selectedSdgTags || []).filter((id: string) => stillAvailableSdgs.has(id)),
        selectedResilienceTags:(question.selectedResilienceTags || []).filter((id: string) => stillAvailableResilience.has(id)),
        selectedEsgTags:       (question.selectedEsgTags || []).filter((id: string) => stillAvailableEsg.has(id)),
        selectedStandardTags:  (question.selectedStandardTags || []).filter((id: string) => stillAvailableStandards.has(id)),
      });
    }
  };

  // When theme changes, clear subThemes and all tags
  const handleThemeChange = (themeId: string) => {
    onChange({
      ...question,
      theme: themeId,
      subThemes: [],
      selectedIndicatorTags: [],
      selectedSdgTags: [],
      selectedResilienceTags: [],
      selectedEsgTags: [],
      selectedStandardTags: [],
    });
  };

  // ── Custom tags ──
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (question.tags.includes(newTag.trim())) { setNewTag(''); return; }
    onChange({ ...question, tags: [...question.tags, newTag.trim()] });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({ ...question, tags: question.tags.filter((tag: string) => tag !== tagToRemove) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
  };

  // ── Taxonomy tag toggle ──
  const handleSelectiveTagToggle = (tagType: string, tagId: string, checked: boolean) => {
    const current = question[tagType] || [];
    onChange({
      ...question,
      [tagType]: checked
        ? [...current, tagId]
        : current.filter((id: string) => id !== tagId)
    });
  };

  const isTagSelected = (tagType: string, tagId: string) =>
    (question[tagType] || []).includes(tagId);

  const getSelectedCount = (tagType: string) =>
    (question[tagType] || []).length;

  const toggleTagSection = (section: string) =>
    setTagSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));

  // ── Demographics ──
  const handleDemographicToggle = (checked: boolean) => {
    if (checked) {
      onChange({
        ...question,
        isStandardDemographic: true,
        demographicType: '',
        demographicCategory: '',
        isGlobalStandard: false,
        demographicMetadata: {
          isRequired: false,
          recommendedForAudience: ['both'],
          complianceRelevant: false,
          sensitivityLevel: 'medium',
          anonymizationRequired: false
        }
      });
    } else {
      const updated = { ...question };
      updated.isStandardDemographic = false;
      updated.demographicType = undefined;
      updated.demographicCategory = undefined;
      updated.isGlobalStandard = false;
      updated.demographicMetadata = undefined;
      onChange(updated);
    }
  };

  const handleDemographicChange = (field: string, value: any) => {
    if (field.startsWith('metadata.')) {
      const metadataField = field.replace('metadata.', '');
      onChange({
        ...question,
        demographicMetadata: { ...question.demographicMetadata, [metadataField]: value }
      });
    } else {
      onChange({ ...question, [field]: value });
    }
  };

  const handleAudienceChange = (audience: string, checked: boolean) => {
    const current = question.demographicMetadata?.recommendedForAudience || [];
    let updated = checked
      ? [...current, audience]
      : current.filter((a: string) => a !== audience);
    if (updated.length === 0) updated = ['both'];
    handleDemographicChange('metadata.recommendedForAudience', updated);
  };

  return (
    <div className="space-y-4">
      {/* Classification */}
      <Card className="border-stratosphere-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-stratosphere-50 to-sky-50">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-stratosphere" />
            <CardTitle className="text-sm text-stratosphere">Question Classification</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Organize your question within the taxonomy structure
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">

          {/* Categories — popover badge multi-select */}
          <div>
            <Label className="text-xs font-medium text-stratosphere mb-1.5 block">
              Categories <span className="text-sky-500">(Optional)</span>
            </Label>

            {/* Selected badges */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedCategories.map(catId => {
                  const cat = categories.find(c => c._id === catId);
                  return cat ? (
                    <Badge
                      key={catId}
                      variant="secondary"
                      className="flex items-center gap-1 bg-forest-50 border-forest-200 text-forest-800 text-xs"
                    >
                      {cat.name}
                      <button
                        onClick={() => handleCategoryToggle(catId, false)}
                        className="hover:text-forest-600 ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between border-stratosphere-200 text-stratosphere h-9 text-xs font-normal"
                >
                  <span className="text-sky-400">
                    {selectedCategories.length > 0
                      ? 'Add more categories...'
                      : 'Select categories...'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 border-stratosphere-200 shadow-lg" align="start">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-stratosphere-100">
                  <Search className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                  <input
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-sky-300 text-stratosphere"
                  />
                  {categorySearch && (
                    <button onClick={() => setCategorySearch('')} className="text-sky-400 hover:text-stratosphere">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-xs text-sky-500 p-3">No categories available</p>
                  ) : (
                    categories
                      .filter(cat => !categorySearch || cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(cat => {
                        const isSelected = selectedCategories.includes(cat._id);
                        return (
                          <div
                            key={cat._id}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-sky-50 cursor-pointer transition-colors"
                            onClick={() => handleCategoryToggle(cat._id, !isSelected)}
                          >
                            <div className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors flex-shrink-0 ${
                              isSelected ? 'bg-stratosphere border-stratosphere' : 'border-stratosphere-300'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-forest-500 flex-shrink-0"></div>
                              <span className="text-sm text-stratosphere">{cat.name}</span>
                            </div>
                          </div>
                        );
                      })
                  )}
                  {categories.length > 0 &&
                    categories.filter(cat => !categorySearch || cat.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-sky-500 p-3 text-center">No categories match your search</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <p className="text-xs text-sky-500 mt-1">
              Broad topical groupings (e.g., "Environmental", "Social Impact")
            </p>
          </div>

          {/* Theme — searchable combobox */}
          <div>
            <Label className="text-xs font-medium text-stratosphere mb-1.5 block">
              Theme <span className="text-sand-700">*</span>
            </Label>
            <Popover open={themePopoverOpen} onOpenChange={setThemePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between border-stratosphere-200 h-9 font-normal text-left"
                >
                  <span className="truncate text-sm text-stratosphere">
                    {question.theme
                      ? themes.find(t => t._id === question.theme)?.name ?? 'Select a theme...'
                      : 'Select a theme...'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-stratosphere-200 shadow-lg" align="start">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-stratosphere-100">
                  <Search className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                  <input
                    placeholder="Search themes..."
                    value={themeSearch}
                    onChange={(e) => setThemeSearch(e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-sky-300 text-stratosphere"
                  />
                  {themeSearch && (
                    <button onClick={() => setThemeSearch('')} className="text-sky-400 hover:text-stratosphere">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {themes
                    .filter(t => !themeSearch || t.name.toLowerCase().includes(themeSearch.toLowerCase()))
                    .map(theme => {
                      const isSelected = question.theme === theme._id;
                      return (
                        <div
                          key={theme._id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-sky-50 cursor-pointer transition-colors"
                          onClick={() => {
                            handleThemeChange(theme._id);
                            setThemePopoverOpen(false);
                            setThemeSearch('');
                          }}
                        >
                          <div className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors flex-shrink-0 ${
                            isSelected ? 'bg-stratosphere border-stratosphere' : 'border-stratosphere-300'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0"></div>
                            <span className="text-sm text-stratosphere">{theme.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  {themes.filter(t => !themeSearch || t.name.toLowerCase().includes(themeSearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-sky-500 p-3 text-center">No themes match your search</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-sky-500 mt-1">Main topic area this question addresses</p>
          </div>

          {/* SubThemes — popover badge multi-select */}
          <div>
            <Label className="text-xs font-medium text-stratosphere mb-1.5 block">
              Subthemes <span className="text-sand-700">*</span>
            </Label>

            {/* Selected badges */}
            {selectedSubThemeIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedSubThemeIds.map(stId => {
                  const st = subThemes.find(s => s._id === stId);
                  return st ? (
                    <Badge
                      key={stId}
                      variant="secondary"
                      className="flex items-center gap-1 bg-clay-50 border-clay-200 text-clay-800 text-xs"
                    >
                      {st.name}
                      <button
                        onClick={() => handleSubThemeToggle(stId, false)}
                        className="hover:text-clay-600 ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!question.theme}
                  className="w-full justify-between border-stratosphere-200 text-stratosphere h-9 text-xs font-normal disabled:opacity-50"
                >
                  <span className="text-sky-400">
                    {!question.theme
                      ? 'Select theme first...'
                      : selectedSubThemeIds.length > 0
                        ? 'Add more subthemes...'
                        : 'Select subthemes...'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border-stratosphere-200 shadow-lg" align="start">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-stratosphere-100">
                  <Search className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                  <input
                    placeholder="Search subthemes..."
                    value={subThemeSearch}
                    onChange={(e) => setSubThemeSearch(e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-sky-300 text-stratosphere"
                  />
                  {subThemeSearch && (
                    <button onClick={() => setSubThemeSearch('')} className="text-sky-400 hover:text-stratosphere">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredSubThemes.length === 0 ? (
                    <p className="text-xs text-sky-500 p-3">No subthemes available for this theme</p>
                  ) : (
                    filteredSubThemes
                      .filter(st => !subThemeSearch || st.name.toLowerCase().includes(subThemeSearch.toLowerCase()))
                      .map(st => {
                        const isSelected = selectedSubThemeIds.includes(st._id);
                        return (
                          <div
                            key={st._id}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-sky-50 cursor-pointer transition-colors"
                            onClick={() => handleSubThemeToggle(st._id, !isSelected)}
                          >
                            <div className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors flex-shrink-0 ${
                              isSelected ? 'bg-stratosphere border-stratosphere' : 'border-stratosphere-300'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex items-center justify-between flex-1 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-2 h-2 rounded-full bg-clay-500 flex-shrink-0"></div>
                                <span className="text-sm text-stratosphere truncate">{st.name}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs bg-ochre-50 text-ochre-700 border-ochre-300 flex-shrink-0 ml-2"
                              >
                                {st.theoryOfChangeStage}
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                  )}
                  {filteredSubThemes.length > 0 &&
                    filteredSubThemes.filter(st => !subThemeSearch || st.name.toLowerCase().includes(subThemeSearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-sky-500 p-3 text-center">No subthemes match your search</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <p className="text-xs text-sky-500 mt-1">
              Specific aspects within the theme — select one or more
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card className="border-stratosphere-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-forest-50 to-grass-50">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-forest-700" />
            <CardTitle className="text-sm text-stratosphere">Target Audience</CardTitle>
          </div>
          <CardDescription className="text-xs">Who should answer this question?</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Select value={question.targetAudience} onValueChange={(value) => onChange({ ...question, targetAudience: value })}>
            <SelectTrigger className="border-stratosphere-200 focus:border-stratosphere focus:ring-stratosphere h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-stratosphere">
              <SelectItem value="internal">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  Internal (Staff, Team Members)
                </div>
              </SelectItem>
              <SelectItem value="external">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-forest-500"></div>
                  External (Community, Beneficiaries)
                </div>
              </SelectItem>
              <SelectItem value="both">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-clay-500"></div>
                  Both (All Respondents)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card className="border-stratosphere-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-clay-50 to-sand-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-clay-700" />
              <div>
                <CardTitle className="text-sm text-stratosphere">Standard Demographics</CardTitle>
                <CardDescription className="text-xs">Reusable demographic questions with compliance features</CardDescription>
              </div>
            </div>
            <Switch
              checked={question.isStandardDemographic || false}
              onCheckedChange={handleDemographicToggle}
              className="data-[state=checked]:bg-stratosphere"
            />
          </div>
        </CardHeader>
        {question.isStandardDemographic && (
          <CardContent className="pt-4 space-y-4">
            <Alert className="bg-clay-50 border-clay-200">
              <Info className="h-4 w-4 text-clay-700" />
              <AlertDescription className="text-xs text-clay-700">
                Standard demographics can be reused across surveys and come with built-in compliance tracking
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Type <span className="text-sand-700">*</span></Label>
                <Select value={question.demographicType || ''} onValueChange={(value) => handleDemographicChange('demographicType', value)}>
                  <SelectTrigger className="h-9 border-stratosphere-200"><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent className="bg-white border-stratosphere">
                    {Object.entries(DEMOGRAPHIC_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Category <span className="text-sand-700">*</span></Label>
                <Select value={question.demographicCategory || ''} onValueChange={(value) => handleDemographicChange('demographicCategory', value)}>
                  <SelectTrigger className="h-9 border-stratosphere-200"><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent className="bg-white border-stratosphere">
                    {Object.entries(DEMOGRAPHIC_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-grass-50 rounded-lg border border-grass-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-grass-700" />
                <div>
                  <Label className="text-xs font-semibold text-stratosphere">Global Standard</Label>
                  <p className="text-xs text-sky-600">Internationally recognized format</p>
                </div>
              </div>
              <Switch
                checked={question.isGlobalStandard || false}
                onCheckedChange={(checked) => handleDemographicChange('isGlobalStandard', checked)}
                className="data-[state=checked]:bg-grass-600"
              />
            </div>
            <Collapsible open={advancedDemographicsOpen} onOpenChange={setAdvancedDemographicsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-stratosphere-200 hover:bg-sky-50">
                  <span className="text-xs font-medium text-stratosphere">Advanced Compliance Settings</span>
                  <ChevronDown className={`h-4 w-4 text-stratosphere transition-transform ${advancedDemographicsOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3 p-3 bg-concrete-50 rounded-lg border border-concrete-200">
                <div>
                  <Label className="text-xs font-medium text-stratosphere mb-2 block">Recommended for Audience</Label>
                  <div className="space-y-2">
                    {Object.entries(TARGET_AUDIENCES).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`audience-${key}`}
                          checked={question.demographicMetadata?.recommendedForAudience?.includes(key) || false}
                          onCheckedChange={(checked) => handleAudienceChange(key, checked as boolean)}
                          className="border-stratosphere data-[state=checked]:bg-stratosphere"
                        />
                        <Label htmlFor={`audience-${key}`} className="text-xs cursor-pointer text-stratosphere">{label as string}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Sensitivity Level</Label>
                  <Select value={question.demographicMetadata?.sensitivityLevel || 'medium'} onValueChange={(value) => handleDemographicChange('metadata.sensitivityLevel', value)}>
                    <SelectTrigger className="h-9 border-stratosphere-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-stratosphere">
                      {Object.entries(SENSITIVITY_LEVELS).map(([key, config]: [string, any]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${config.color}-500`}></div>
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-stratosphere mb-1.5 block">Data Retention (months)</Label>
                  <Input
                    type="number" min="1" max="120"
                    value={question.demographicMetadata?.dataRetentionPeriod || ''}
                    onChange={(e) => handleDemographicChange('metadata.dataRetentionPeriod', parseInt(e.target.value) || undefined)}
                    placeholder="Optional retention period"
                    className="h-9 border-stratosphere-200"
                  />
                </div>
                <div className="space-y-2">
                  {[
                    { field: 'metadata.complianceRelevant', key: 'complianceRelevant', label: 'GDPR Relevant' },
                    { field: 'metadata.anonymizationRequired', key: 'anonymizationRequired', label: 'Requires Anonymization' },
                    { field: 'metadata.isRequired', key: 'isRequired', label: 'Required by Default' },
                  ].map(({ field, key, label }) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-white rounded border border-stratosphere-100">
                      <Label className="text-xs font-medium text-stratosphere">{label}</Label>
                      <Switch
                        checked={question.demographicMetadata?.[key] || false}
                        onCheckedChange={(checked) => handleDemographicChange(field, checked)}
                        className="data-[state=checked]:bg-stratosphere"
                      />
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        )}
      </Card>

      {/* Available Tags — shown when at least one subtheme is selected */}
      {selectedSubThemeIds.length > 0 && (
        <Card className="border-stratosphere-200 shadow-sm">
          <CardHeader className="pb-3 bg-gradient-to-r from-ochre-50 to-sand-50">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-ochre-700" />
              <div>
                <CardTitle className="text-sm text-stratosphere">Available Tags</CardTitle>
                <CardDescription className="text-xs">
                  Select relevant tags from your chosen subthemes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {loadingTags ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin h-6 w-6 border-2 border-stratosphere border-t-transparent rounded-full"></div>
              </div>
            ) : availableTags ? (
              <>
                {/* Indicators */}
                {availableTags.indicators?.length > 0 && (
                  <Collapsible open={tagSectionsOpen.indicators} onOpenChange={() => toggleTagSection('indicators')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-sky-200 hover:bg-sky-50">
                        <span className="flex items-center gap-2 text-sm font-medium text-stratosphere">
                          <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                          Indicators
                          {getSelectedCount('selectedIndicatorTags') > 0 && (
                            <Badge variant="secondary" className="bg-sky-100 text-sky-700 text-xs">
                              {getSelectedCount('selectedIndicatorTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.indicators ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-sky-50 rounded-lg">
                      {availableTags.indicators.map((indicator: Indicator) => (
                        <div key={indicator._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-sky-100 hover:border-sky-300 transition-colors">
                          <Checkbox
                            id={`indicator-${indicator._id}`}
                            checked={isTagSelected('selectedIndicatorTags', indicator._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedIndicatorTags', indicator._id, checked as boolean)}
                            className="mt-1 border-stratosphere data-[state=checked]:bg-stratosphere"
                          />
                          <label htmlFor={`indicator-${indicator._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-stratosphere">{indicator.name}</div>
                            {indicator.description && <div className="text-xs text-sky-600 mt-0.5">{indicator.description}</div>}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* SDGs */}
                {availableTags.sdgs?.length > 0 && (
                  <Collapsible open={tagSectionsOpen.sdgs} onOpenChange={() => toggleTagSection('sdgs')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-grass-200 hover:bg-grass-50">
                        <span className="flex items-center gap-2 text-sm font-medium text-stratosphere">
                          <div className="w-2 h-2 rounded-full bg-grass-500"></div>
                          SDGs
                          {getSelectedCount('selectedSdgTags') > 0 && (
                            <Badge variant="secondary" className="bg-grass-100 text-grass-700 text-xs">
                              {getSelectedCount('selectedSdgTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.sdgs ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-grass-50 rounded-lg">
                      {availableTags.sdgs.map((sdg: SDG) => (
                        <div key={sdg._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-grass-100 hover:border-grass-300 transition-colors">
                          <Checkbox
                            id={`sdg-${sdg._id}`}
                            checked={isTagSelected('selectedSdgTags', sdg._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedSdgTags', sdg._id, checked as boolean)}
                            className="mt-1 border-stratosphere data-[state=checked]:bg-stratosphere"
                          />
                          <label htmlFor={`sdg-${sdg._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-stratosphere">{sdg.code} - {sdg.name}</div>
                            {sdg.description && <div className="text-xs text-grass-600 mt-0.5">{sdg.description}</div>}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Resilience */}
                {availableTags.resilience?.length > 0 && (
                  <Collapsible open={tagSectionsOpen.resilience} onOpenChange={() => toggleTagSection('resilience')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-clay-200 hover:bg-clay-50">
                        <span className="flex items-center gap-2 text-sm font-medium text-stratosphere">
                          <div className="w-2 h-2 rounded-full bg-clay-500"></div>
                          Resilience
                          {getSelectedCount('selectedResilienceTags') > 0 && (
                            <Badge variant="secondary" className="bg-clay-100 text-clay-700 text-xs">
                              {getSelectedCount('selectedResilienceTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.resilience ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-clay-50 rounded-lg">
                      {availableTags.resilience.map((dimension: ResilienceDimension) => (
                        <div key={dimension._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-clay-100 hover:border-clay-300 transition-colors">
                          <Checkbox
                            id={`resilience-${dimension._id}`}
                            checked={isTagSelected('selectedResilienceTags', dimension._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedResilienceTags', dimension._id, checked as boolean)}
                            className="mt-1 border-stratosphere data-[state=checked]:bg-stratosphere"
                          />
                          <label htmlFor={`resilience-${dimension._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-stratosphere">{dimension.code} - {dimension.name}</div>
                            {dimension.description && <div className="text-xs text-clay-600 mt-0.5">{dimension.description}</div>}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* ESG */}
                {availableTags.esg?.length > 0 && (
                  <Collapsible open={tagSectionsOpen.esg} onOpenChange={() => toggleTagSection('esg')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-forest-200 hover:bg-forest-50">
                        <span className="flex items-center gap-2 text-sm font-medium text-stratosphere">
                          <div className="w-2 h-2 rounded-full bg-forest-500"></div>
                          ESG
                          {getSelectedCount('selectedEsgTags') > 0 && (
                            <Badge variant="secondary" className="bg-forest-100 text-forest-700 text-xs">
                              {getSelectedCount('selectedEsgTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.esg ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-forest-50 rounded-lg">
                      {availableTags.esg.map((esg: ESGCategory) => (
                        <div key={esg._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-forest-100 hover:border-forest-300 transition-colors">
                          <Checkbox
                            id={`esg-${esg._id}`}
                            checked={isTagSelected('selectedEsgTags', esg._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedEsgTags', esg._id, checked as boolean)}
                            className="mt-1 border-stratosphere data-[state=checked]:bg-stratosphere"
                          />
                          <label htmlFor={`esg-${esg._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-stratosphere">{esg.code} - {esg.name}</div>
                            <div className="text-xs text-forest-600 mt-0.5">{esg.type}{esg.description && ` • ${esg.description}`}</div>
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Standards */}
                {availableTags.standards?.length > 0 && (
                  <Collapsible open={tagSectionsOpen.standards} onOpenChange={() => toggleTagSection('standards')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-sand-200 hover:bg-sand-50">
                        <span className="flex items-center gap-2 text-sm font-medium text-stratosphere">
                          <div className="w-2 h-2 rounded-full bg-sand-500"></div>
                          Standards
                          {getSelectedCount('selectedStandardTags') > 0 && (
                            <Badge variant="secondary" className="bg-sand-100 text-sand-700 text-xs">
                              {getSelectedCount('selectedStandardTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.standards ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-sand-50 rounded-lg">
                      {availableTags.standards.map((standard: Standard) => (
                        <div key={standard._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-sand-100 hover:border-sand-300 transition-colors">
                          <Checkbox
                            id={`standard-${standard._id}`}
                            checked={isTagSelected('selectedStandardTags', standard._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedStandardTags', standard._id, checked as boolean)}
                            className="mt-1 border-stratosphere data-[state=checked]:bg-stratosphere"
                          />
                          <label htmlFor={`standard-${standard._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-stratosphere">{standard.code} - {standard.name}</div>
                            <div className="text-xs text-sand-600 mt-0.5">{standard.issuingBody}{standard.description && ` • ${standard.description}`}</div>
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </>
            ) : (
              <Alert className="bg-ochre-50 border-ochre-200">
                <AlertCircle className="h-4 w-4 text-ochre-700" />
                <AlertDescription className="text-xs text-ochre-700">
                  No tags available for the selected subthemes.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Tags */}
      <Card className="border-stratosphere-200 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-sand-50 to-ochre-50">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-sand-700" />
            <div>
              <CardTitle className="text-sm text-stratosphere">Custom Tags</CardTitle>
              <CardDescription className="text-xs">Add your own tags for additional categorization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {question.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap p-3 bg-sand-50 rounded-lg border border-sand-200">
              {question.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-white border-sand-300">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="text-sky-500 hover:text-stratosphere">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter..."
              className="flex-grow border-stratosphere-200 focus:border-stratosphere h-9"
            />
            <Button type="button" size="icon" onClick={handleAddTag} className="bg-stratosphere hover:bg-stratosphere-900 h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-sky-500">Press Enter or click + to add custom tags</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetadataPanel;