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
      <Card className="border-c4c-rule shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-c4c-grey-bg to-c4c-grey-bg">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-black" />
            <CardTitle className="text-sm text-black">Question Classification</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Organize your question within the taxonomy structure
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">

          {/* Categories — popover badge multi-select */}
          <div>
            <Label className="text-xs font-medium text-black mb-1.5 block">
              Categories <span className="text-c4c-petrol">(Optional)</span>
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
                      className="flex items-center gap-1 bg-c4c-tint-cyan border-c4c-petrol text-black text-xs"
                    >
                      {cat.name}
                      <button
                        onClick={() => handleCategoryToggle(catId, false)}
                        className="hover:text-c4c-petrol ml-0.5"
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
                  className="w-full justify-between border-c4c-rule text-black h-9 text-xs font-normal"
                >
                  <span className="text-c4c-petrol">
                    {selectedCategories.length > 0
                      ? 'Add more categories...'
                      : 'Select categories...'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 border-c4c-rule" align="start">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-c4c-rule">
                  <Search className="h-3.5 w-3.5 text-c4c-petrol flex-shrink-0" />
                  <input
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-c4c-rule text-black"
                  />
                  {categorySearch && (
                    <button onClick={() => setCategorySearch('')} className="text-c4c-petrol hover:text-black">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-xs text-c4c-petrol p-3">No categories available</p>
                  ) : (
                    categories
                      .filter(cat => !categorySearch || cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(cat => {
                        const isSelected = selectedCategories.includes(cat._id);
                        return (
                          <div
                            key={cat._id}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-c4c-grey-bg cursor-pointer transition-colors"
                            onClick={() => handleCategoryToggle(cat._id, !isSelected)}
                          >
                            <div className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors flex-shrink-0 ${
                              isSelected ? 'bg-c4c-petrol border-c4c-petrol' : 'border-c4c-rule'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-c4c-petrol flex-shrink-0"></div>
                              <span className="text-sm text-black">{cat.name}</span>
                            </div>
                          </div>
                        );
                      })
                  )}
                  {categories.length > 0 &&
                    categories.filter(cat => !categorySearch || cat.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-c4c-petrol p-3 text-center">No categories match your search</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <p className="text-xs text-c4c-petrol mt-1">
              Broad topical groupings (e.g., "Environmental", "Social Impact")
            </p>
          </div>

          {/* Theme — searchable combobox */}
          <div>
            <Label className="text-xs font-medium text-black mb-1.5 block">
              Theme <span className="text-c4c-burgundy">*</span>
            </Label>
            <Popover open={themePopoverOpen} onOpenChange={setThemePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between border-c4c-rule h-9 font-normal text-left"
                >
                  <span className="truncate text-sm text-black">
                    {question.theme
                      ? themes.find(t => t._id === question.theme)?.name ?? 'Select a theme...'
                      : 'Select a theme...'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-c4c-rule" align="start">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-c4c-rule">
                  <Search className="h-3.5 w-3.5 text-c4c-petrol flex-shrink-0" />
                  <input
                    placeholder="Search themes..."
                    value={themeSearch}
                    onChange={(e) => setThemeSearch(e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-c4c-rule text-black"
                  />
                  {themeSearch && (
                    <button onClick={() => setThemeSearch('')} className="text-c4c-petrol hover:text-black">
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
                          className="flex items-center gap-2 px-3 py-2 hover:bg-c4c-grey-bg cursor-pointer transition-colors"
                          onClick={() => {
                            handleThemeChange(theme._id);
                            setThemePopoverOpen(false);
                            setThemeSearch('');
                          }}
                        >
                          <div className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors flex-shrink-0 ${
                            isSelected ? 'bg-c4c-petrol border-c4c-petrol' : 'border-c4c-rule'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-c4c-petrol flex-shrink-0"></div>
                            <span className="text-sm text-black">{theme.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  {themes.filter(t => !themeSearch || t.name.toLowerCase().includes(themeSearch.toLowerCase())).length === 0 && (
                    <p className="text-xs text-c4c-petrol p-3 text-center">No themes match your search</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-c4c-petrol mt-1">Main topic area this question addresses</p>
          </div>

          {/* SubThemes — popover badge multi-select */}
          <div>
            <Label className="text-xs font-medium text-black mb-1.5 block">
              Subthemes <span className="text-c4c-burgundy">*</span>
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
                      className="flex items-center gap-1 bg-c4c-tint-coral border-c4c-burgundy text-black text-xs"
                    >
                      {st.name}
                      <button
                        onClick={() => handleSubThemeToggle(stId, false)}
                        className="hover:text-c4c-burgundy ml-0.5"
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
                  className="w-full justify-between border-c4c-rule text-black h-9 text-xs font-normal disabled:opacity-50"
                >
                  <span className="text-c4c-petrol">
                    {!question.theme
                      ? 'Select theme first...'
                      : selectedSubThemeIds.length > 0
                        ? 'Add more subthemes...'
                        : 'Select subthemes...'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 border-c4c-rule" align="start">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-c4c-rule">
                  <Search className="h-3.5 w-3.5 text-c4c-petrol flex-shrink-0" />
                  <input
                    placeholder="Search subthemes..."
                    value={subThemeSearch}
                    onChange={(e) => setSubThemeSearch(e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent placeholder:text-c4c-rule text-black"
                  />
                  {subThemeSearch && (
                    <button onClick={() => setSubThemeSearch('')} className="text-c4c-petrol hover:text-black">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredSubThemes.length === 0 ? (
                    <p className="text-xs text-c4c-petrol p-3">No subthemes available for this theme</p>
                  ) : (
                    filteredSubThemes
                      .filter(st => !subThemeSearch || st.name.toLowerCase().includes(subThemeSearch.toLowerCase()))
                      .map(st => {
                        const isSelected = selectedSubThemeIds.includes(st._id);
                        return (
                          <div
                            key={st._id}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-c4c-grey-bg cursor-pointer transition-colors"
                            onClick={() => handleSubThemeToggle(st._id, !isSelected)}
                          >
                            <div className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-colors flex-shrink-0 ${
                              isSelected ? 'bg-c4c-petrol border-c4c-petrol' : 'border-c4c-rule'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex items-center justify-between flex-1 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-2 h-2 rounded-full bg-c4c-cobalt flex-shrink-0"></div>
                                <span className="text-sm text-black truncate">{st.name}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs bg-c4c-tint-gold text-black border-c4c-yellow flex-shrink-0 ml-2"
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
                    <p className="text-xs text-c4c-petrol p-3 text-center">No subthemes match your search</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <p className="text-xs text-c4c-petrol mt-1">
              Specific aspects within the theme — select one or more
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card className="border-c4c-rule shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-c4c-tint-cyan to-c4c-tint-sage">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-c4c-petrol" />
            <CardTitle className="text-sm text-black">Target Audience</CardTitle>
          </div>
          <CardDescription className="text-xs">Who should answer this question?</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Select value={question.targetAudience} onValueChange={(value) => onChange({ ...question, targetAudience: value })}>
            <SelectTrigger className="border-c4c-rule focus:border-ink focus:ring-ink h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-ink">
              <SelectItem value="internal">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-c4c-petrol"></div>
                  Internal (Staff, Team Members)
                </div>
              </SelectItem>
              <SelectItem value="external">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-c4c-petrol"></div>
                  External (Community, Beneficiaries)
                </div>
              </SelectItem>
              <SelectItem value="both">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-c4c-cobalt"></div>
                  Both (All Respondents)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card className="border-c4c-rule shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-c4c-tint-coral to-c4c-tint-coral">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-c4c-burgundy" />
              <div>
                <CardTitle className="text-sm text-black">Standard Demographics</CardTitle>
                <CardDescription className="text-xs">Reusable demographic questions with compliance features</CardDescription>
              </div>
            </div>
            <Switch
              checked={question.isStandardDemographic || false}
              onCheckedChange={handleDemographicToggle}
              className="data-[state=checked]:bg-c4c-petrol"
            />
          </div>
        </CardHeader>
        {question.isStandardDemographic && (
          <CardContent className="pt-4 space-y-4">
            <Alert className="bg-c4c-tint-coral border-c4c-burgundy">
              <Info className="h-4 w-4 text-c4c-burgundy" />
              <AlertDescription className="text-xs text-c4c-burgundy">
                Standard demographics can be reused across surveys and come with built-in compliance tracking
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-black mb-1.5 block">Type <span className="text-c4c-burgundy">*</span></Label>
                <Select value={question.demographicType || ''} onValueChange={(value) => handleDemographicChange('demographicType', value)}>
                  <SelectTrigger className="h-9 border-c4c-rule"><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent className="bg-white border-ink">
                    {Object.entries(DEMOGRAPHIC_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-black mb-1.5 block">Category <span className="text-c4c-burgundy">*</span></Label>
                <Select value={question.demographicCategory || ''} onValueChange={(value) => handleDemographicChange('demographicCategory', value)}>
                  <SelectTrigger className="h-9 border-c4c-rule"><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent className="bg-white border-ink">
                    {Object.entries(DEMOGRAPHIC_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-c4c-tint-sage rounded-lg border border-c4c-sage">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-c4c-petrol" />
                <div>
                  <Label className="text-xs font-semibold text-black">Global Standard</Label>
                  <p className="text-xs text-c4c-petrol">Internationally recognized format</p>
                </div>
              </div>
              <Switch
                checked={question.isGlobalStandard || false}
                onCheckedChange={(checked) => handleDemographicChange('isGlobalStandard', checked)}
                className="data-[state=checked]:bg-c4c-petrol"
              />
            </div>
            <Collapsible open={advancedDemographicsOpen} onOpenChange={setAdvancedDemographicsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-c4c-rule hover:bg-c4c-grey-bg">
                  <span className="text-xs font-medium text-black">Advanced Compliance Settings</span>
                  <ChevronDown className={`h-4 w-4 text-black transition-transform ${advancedDemographicsOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3 p-3 bg-c4c-grey-bg rounded-lg border border-c4c-rule">
                <div>
                  <Label className="text-xs font-medium text-black mb-2 block">Recommended for Audience</Label>
                  <div className="space-y-2">
                    {Object.entries(TARGET_AUDIENCES).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`audience-${key}`}
                          checked={question.demographicMetadata?.recommendedForAudience?.includes(key) || false}
                          onCheckedChange={(checked) => handleAudienceChange(key, checked as boolean)}
                          className="border-ink data-[state=checked]:bg-c4c-petrol"
                        />
                        <Label htmlFor={`audience-${key}`} className="text-xs cursor-pointer text-black">{label as string}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-black mb-1.5 block">Sensitivity Level</Label>
                  <Select value={question.demographicMetadata?.sensitivityLevel || 'medium'} onValueChange={(value) => handleDemographicChange('metadata.sensitivityLevel', value)}>
                    <SelectTrigger className="h-9 border-c4c-rule"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-ink">
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
                  <Label className="text-xs font-medium text-black mb-1.5 block">Data Retention (months)</Label>
                  <Input
                    type="number" min="1" max="120"
                    value={question.demographicMetadata?.dataRetentionPeriod || ''}
                    onChange={(e) => handleDemographicChange('metadata.dataRetentionPeriod', parseInt(e.target.value) || undefined)}
                    placeholder="Optional retention period"
                    className="h-9 border-c4c-rule"
                  />
                </div>
                <div className="space-y-2">
                  {[
                    { field: 'metadata.complianceRelevant', key: 'complianceRelevant', label: 'GDPR Relevant' },
                    { field: 'metadata.anonymizationRequired', key: 'anonymizationRequired', label: 'Requires Anonymization' },
                    { field: 'metadata.isRequired', key: 'isRequired', label: 'Required by Default' },
                  ].map(({ field, key, label }) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-white rounded border border-c4c-rule">
                      <Label className="text-xs font-medium text-black">{label}</Label>
                      <Switch
                        checked={question.demographicMetadata?.[key] || false}
                        onCheckedChange={(checked) => handleDemographicChange(field, checked)}
                        className="data-[state=checked]:bg-c4c-petrol"
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
        <Card className="border-c4c-rule shadow-sm">
          <CardHeader className="pb-3 bg-c4c-grey-bg">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-black" />
              <div>
                <CardTitle className="text-sm text-black">Available Tags</CardTitle>
                <CardDescription className="text-xs">
                  Select relevant tags from your chosen subthemes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {loadingTags ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin h-6 w-6 border-2 border-c4c-petrol border-t-transparent rounded-full"></div>
              </div>
            ) : availableTags ? (
              <>
                {/* Indicators */}
                {availableTags.indicators?.length > 0 && (
                  <Collapsible open={tagSectionsOpen.indicators} onOpenChange={() => toggleTagSection('indicators')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-c4c-rule hover:bg-c4c-grey-bg">
                        <span className="flex items-center gap-2 text-sm font-medium text-black">
                          <div className="w-2 h-2 rounded-full bg-c4c-petrol"></div>
                          Indicators
                          {getSelectedCount('selectedIndicatorTags') > 0 && (
                            <Badge variant="secondary" className="bg-c4c-rule text-c4c-petrol text-xs">
                              {getSelectedCount('selectedIndicatorTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.indicators ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-c4c-grey-bg rounded-lg">
                      {availableTags.indicators.map((indicator: Indicator) => (
                        <div key={indicator._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-c4c-rule hover:border-c4c-rule transition-colors">
                          <Checkbox
                            id={`indicator-${indicator._id}`}
                            checked={isTagSelected('selectedIndicatorTags', indicator._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedIndicatorTags', indicator._id, checked as boolean)}
                            className="mt-1 border-ink data-[state=checked]:bg-c4c-petrol"
                          />
                          <label htmlFor={`indicator-${indicator._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-black">{indicator.name}</div>
                            {indicator.description && <div className="text-xs text-c4c-petrol mt-0.5">{indicator.description}</div>}
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
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-c4c-sage hover:bg-c4c-tint-sage">
                        <span className="flex items-center gap-2 text-sm font-medium text-black">
                          <div className="w-2 h-2 rounded-full bg-c4c-sage"></div>
                          SDGs
                          {getSelectedCount('selectedSdgTags') > 0 && (
                            <Badge variant="secondary" className="bg-c4c-tint-sage text-c4c-petrol text-xs">
                              {getSelectedCount('selectedSdgTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.sdgs ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-c4c-tint-sage rounded-lg">
                      {availableTags.sdgs.map((sdg: SDG) => (
                        <div key={sdg._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-c4c-sage hover:border-c4c-sage transition-colors">
                          <Checkbox
                            id={`sdg-${sdg._id}`}
                            checked={isTagSelected('selectedSdgTags', sdg._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedSdgTags', sdg._id, checked as boolean)}
                            className="mt-1 border-ink data-[state=checked]:bg-c4c-petrol"
                          />
                          <label htmlFor={`sdg-${sdg._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-black">{sdg.code} - {sdg.name}</div>
                            {sdg.description && <div className="text-xs text-c4c-petrol mt-0.5">{sdg.description}</div>}
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
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-c4c-cobalt hover:bg-c4c-tint-cyan">
                        <span className="flex items-center gap-2 text-sm font-medium text-black">
                          <div className="w-2 h-2 rounded-full bg-c4c-cobalt"></div>
                          Resilience
                          {getSelectedCount('selectedResilienceTags') > 0 && (
                            <Badge variant="secondary" className="bg-c4c-tint-cyan text-c4c-cobalt text-xs">
                              {getSelectedCount('selectedResilienceTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.resilience ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-c4c-tint-cyan rounded-lg">
                      {availableTags.resilience.map((dimension: ResilienceDimension) => (
                        <div key={dimension._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-c4c-cobalt hover:border-c4c-cobalt transition-colors">
                          <Checkbox
                            id={`resilience-${dimension._id}`}
                            checked={isTagSelected('selectedResilienceTags', dimension._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedResilienceTags', dimension._id, checked as boolean)}
                            className="mt-1 border-ink data-[state=checked]:bg-c4c-petrol"
                          />
                          <label htmlFor={`resilience-${dimension._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-black">{dimension.code} - {dimension.name}</div>
                            {dimension.description && <div className="text-xs text-c4c-cobalt mt-0.5">{dimension.description}</div>}
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
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-c4c-petrol hover:bg-c4c-tint-cyan">
                        <span className="flex items-center gap-2 text-sm font-medium text-black">
                          <div className="w-2 h-2 rounded-full bg-c4c-petrol"></div>
                          ESG
                          {getSelectedCount('selectedEsgTags') > 0 && (
                            <Badge variant="secondary" className="bg-c4c-tint-cyan text-c4c-petrol text-xs">
                              {getSelectedCount('selectedEsgTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.esg ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-c4c-tint-cyan rounded-lg">
                      {availableTags.esg.map((esg: ESGCategory) => (
                        <div key={esg._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-c4c-petrol hover:border-c4c-petrol transition-colors">
                          <Checkbox
                            id={`esg-${esg._id}`}
                            checked={isTagSelected('selectedEsgTags', esg._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedEsgTags', esg._id, checked as boolean)}
                            className="mt-1 border-ink data-[state=checked]:bg-c4c-petrol"
                          />
                          <label htmlFor={`esg-${esg._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-black">{esg.code} - {esg.name}</div>
                            <div className="text-xs text-c4c-petrol mt-0.5">{esg.type}{esg.description && ` • ${esg.description}`}</div>
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
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto border border-c4c-yellow hover:bg-c4c-tint-gold">
                        <span className="flex items-center gap-2 text-sm font-medium text-black">
                          <div className="w-2 h-2 rounded-full bg-c4c-yellow"></div>
                          Standards
                          {getSelectedCount('selectedStandardTags') > 0 && (
                            <Badge variant="secondary" className="bg-c4c-tint-gold text-c4c-petrol text-xs">
                              {getSelectedCount('selectedStandardTags')} selected
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${tagSectionsOpen.standards ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2 p-3 bg-c4c-tint-gold rounded-lg">
                      {availableTags.standards.map((standard: Standard) => (
                        <div key={standard._id} className="flex items-start space-x-2 p-2 bg-white rounded border border-c4c-yellow hover:border-c4c-yellow transition-colors">
                          <Checkbox
                            id={`standard-${standard._id}`}
                            checked={isTagSelected('selectedStandardTags', standard._id)}
                            onCheckedChange={(checked) => handleSelectiveTagToggle('selectedStandardTags', standard._id, checked as boolean)}
                            className="mt-1 border-ink data-[state=checked]:bg-c4c-petrol"
                          />
                          <label htmlFor={`standard-${standard._id}`} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium text-black">{standard.code} - {standard.name}</div>
                            <div className="text-xs text-c4c-petrol mt-0.5">{standard.issuingBody}{standard.description && ` • ${standard.description}`}</div>
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </>
            ) : (
              <Alert className="bg-c4c-tint-gold border-c4c-yellow">
                <AlertCircle className="h-4 w-4 text-black" />
                <AlertDescription className="text-xs text-black">
                  No tags available for the selected subthemes.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Tags */}
      <Card className="border-c4c-rule shadow-sm">
        <CardHeader className="pb-3 bg-c4c-grey-bg">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-c4c-petrol" />
            <div>
              <CardTitle className="text-sm text-black">Custom Tags</CardTitle>
              <CardDescription className="text-xs">Add your own tags for additional categorization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {question.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap p-3 bg-c4c-grey-bg rounded-lg border border-c4c-rule">
              {question.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-white border-c4c-rule">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="text-c4c-petrol hover:text-black">
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
              className="flex-grow border-c4c-rule focus:border-ink h-9"
            />
            <Button type="button" size="icon" onClick={handleAddTag} className="bg-c4c-coral hover:bg-c4c-petrol h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-c4c-petrol">Press Enter or click + to add custom tags</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetadataPanel;