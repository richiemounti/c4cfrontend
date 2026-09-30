// components/forms/ImpactForm.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader, X, Plus, HelpCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getAvailableSubThemesForImpacts } from '@/lib/api/theoryOfChange';
import { fetchAllThemes } from '@/lib/api/theme';
import InstructionalPanel from '@/components/InstructionalPanel';
import { CreateImpactData, RiskItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getImpactRisks } from '@/lib/api/theoryOfChange';
import CreateRiskModal from '@/components/project/modals/CreateRiskModal';
import EditRiskModal from '@/components/project/modals/EditRiskModal';

interface ImpactFormData {
  projectId: string;
  projectSiteId?: string;
  stageId: string;
  themeId: string;
  subThemeIds: string[];
  outcome: string;
  notes?: string;
}

interface Theme {
  _id: string;
  name: string;
  description?: string;
}

interface SubTheme {
  _id: string;
  name: string;
  description?: string;
  theme: {
    _id: string;
    name: string;
  };
  indicatorTags?: Array<{ _id: string; name: string }>;
  sdgTags?: Array<{ _id: string; code: string; name: string }>;
  resilienceTags?: Array<{ _id: string; code: string; name: string }>;
  esgTags?: Array<{ _id: string; code: string; name: string; type: string }>;
  standardTags?: Array<{ _id: string; code: string; name: string; issuingBody: string }>;
}

interface SubThemesByTheme {
  theme: Theme;
  subThemes: SubTheme[];
}

interface ImpactFormProps {
  projectId: string;
  projectSiteId?: string;
  stageId: string;
  stakeholderGroups: any[];
  // Passed when editing an existing impact (enables linked risks section)
  impactId?: string;
  organizationId?: string;
  userRole?: 'manager' | 'projectCreator' | 'organiser' | 'reviewer';
  currentUser?: { _id: string; name: string; email: string };
  initialData?: {
    _id?: string;
    stakeholderGroups: { _id: string; name: string }[];
    themes: Theme[];
    subThemes: SubTheme[];
    outcome: string;
    notes?: string;
    sdgTags?: string[];
    resilienceTags?: string[];
  };
  onSubmit: (data: CreateImpactData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  title?: string;
}

export default function ImpactForm({
  projectId,
  projectSiteId,
  stageId,
  stakeholderGroups,
  impactId,
  organizationId,
  userRole,
  currentUser,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Impact',
  title = 'Impact Details'
}: ImpactFormProps) {
  const { toast } = useToast();

  const [themes, setThemes] = useState<Theme[]>([]);
  const [availableSubThemes, setAvailableSubThemes] = useState<SubTheme[]>([]);
  const [subThemesByTheme, setSubThemesByTheme] = useState<SubThemesByTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedSubThemes, setSelectedSubThemes] = useState<string[]>([]);
  const [selectedStakeholderIds, setSelectedStakeholderIds] = useState<string[]>([]);
  const [loadingSubThemes, setLoadingSubThemes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [clickedTheme, setClickedTheme] = useState<string | null>(null);
  const [clickedSubTheme, setClickedSubTheme] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Risk register state (edit mode only)
  const [linkedRisks, setLinkedRisks] = useState<RiskItem[]>([]);
  const [loadingRisks, setLoadingRisks] = useState(false);
  const [showCreateRiskModal, setShowCreateRiskModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ImpactFormData>();

  const watchedThemeId = watch('themeId');
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setClickedTheme(null);
        setClickedSubTheme(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
      
        // Load Stage 2 - Outcome and Both themes, excluding Demographics
        const [stage2Themes, bothThemes] = await Promise.all([
          fetchAllThemes({ theoryOfChangeStage: 'Stage 2 - Outcome', status: 'published' }),
          fetchAllThemes({ theoryOfChangeStage: 'Both', status: 'published' }),
        ]);
        const merged = [...stage2Themes, ...bothThemes];
        const seen = new Set<string>();
        const filteredThemes = merged.filter(theme => {
          if (seen.has(theme._id) || theme.name.toLowerCase() === 'demographics') return false;
          seen.add(theme._id);
          return true;
        });
        setThemes(filteredThemes);
        
        // Set basic form values
        setValue('projectId', projectId);
        setValue('stageId', stageId);
        if (projectSiteId) {
          setValue('projectSiteId', projectSiteId);
        }
        
        if (initialData) {
          setSelectedStakeholderIds(initialData.stakeholderGroups.map(g => g._id));
          setValue('outcome', initialData.outcome);
          setValue('notes', initialData.notes || '');

          const themeId = initialData.themes[0]?._id;
          const subThemeIds = initialData.subThemes.map(st => st._id);
          
          if (themeId) {
            setSelectedTheme(themeId);
            setValue('themeId', themeId);
          }
          setSelectedSubThemes(subThemeIds);
          setValue('subThemeIds', subThemeIds);
        }
      } catch (error) {
        console.error("Error initializing form:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeForm();
  }, [projectId, stageId, projectSiteId, initialData, setValue]);

  
  useEffect(() => {
    if (selectedTheme) {
      const fetchSubThemes = async () => {
        try {
          setLoadingSubThemes(true);
          const response = await getAvailableSubThemesForImpacts([selectedTheme]);
          
          if (response.data.success) {
            setAvailableSubThemes(response.data.data.availableSubThemes);
            setSubThemesByTheme(response.data.data.subThemesByTheme);
          }
        } catch (error) {
          console.error("Error fetching subthemes:", error);
          setAvailableSubThemes([]);
          setSubThemesByTheme([]);
        } finally {
          setLoadingSubThemes(false);
        }
      };
      
      fetchSubThemes();
    } else {
      setAvailableSubThemes([]);
      setSubThemesByTheme([]);
      setSelectedSubThemes([]);
      setValue('subThemeIds', []);
    }
  }, [selectedTheme, setValue]);

  useEffect(() => {
    setValue('themeId', selectedTheme);
  }, [selectedTheme, setValue]);

  useEffect(() => {
    setValue('subThemeIds', selectedSubThemes);
  }, [selectedSubThemes, setValue]);

  const handleSubThemeToggle = (subThemeId: string) => {
    const newSelectedSubThemes = selectedSubThemes.includes(subThemeId)
      ? selectedSubThemes.filter(id => id !== subThemeId)
      : [...selectedSubThemes, subThemeId];
    
    setSelectedSubThemes(newSelectedSubThemes);
  };

  const removeSubTheme = (subThemeId: string) => {
    handleSubThemeToggle(subThemeId);
  };

  const getSelectedThemeName = () => {
    return themes.find(theme => theme._id === selectedTheme);
  };

  const getSelectedSubThemeNames = () => {
    return availableSubThemes.filter(subTheme => selectedSubThemes.includes(subTheme._id));
  };

  // Load linked risks when in edit mode
  useEffect(() => {
    if (!impactId) return;
    const fetchRisks = async () => {
      try {
        setLoadingRisks(true);
        const { data } = await getImpactRisks(impactId);
        setLinkedRisks(data.data || []);
      } catch (err) {
        console.error('Error loading linked risks:', err);
      } finally {
        setLoadingRisks(false);
      }
    };
    fetchRisks();
  }, [impactId]);

  const handleThemeInfoClick = (e: React.MouseEvent, themeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setClickedTheme(clickedTheme === themeId ? null : themeId);
    setClickedSubTheme(null);
  };

  const handleSubThemeInfoClick = (e: React.MouseEvent, subThemeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setClickedSubTheme(clickedSubTheme === subThemeId ? null : subThemeId);
    setClickedTheme(null);
  };
  
  const handleFormSubmit: SubmitHandler<ImpactFormData> = async (data) => {
    setSubmitAttempted(true);

    if (selectedStakeholderIds.length === 0) {
      toast({ title: 'Missing Stakeholder Group', description: 'Please select at least one stakeholder group before saving.', variant: 'destructive' });
      return;
    }
    if (!selectedTheme) {
      toast({ title: 'Missing Theme', description: 'Please select a theme before saving.', variant: 'destructive' });
      return;
    }
    if (selectedSubThemes.length === 0) {
      toast({ title: 'Missing SubTheme', description: 'Please select at least one subtheme before saving.', variant: 'destructive' });
      return;
    }

    const impactData: CreateImpactData = {
      ...data,
      projectSiteId,
      stakeholderGroupIds: selectedStakeholderIds,
      themeIds: [selectedTheme],
      subThemeIds: selectedSubThemes
    };

    await onSubmit(impactData);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral"></div>
        <p className="text-black font-medium ml-3">Loading form...</p>
      </div>
    );
  }

  return (
    <Card className="bg-white border border-c4c-rule max-w-4xl">
      <CardHeader>
        <CardTitle className="text-black">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <input type="hidden" {...register('projectId')} />
          <input type="hidden" {...register('stageId')} />
          <input type="hidden" {...register('themeId')} />
          
          <div className="space-y-4">
            <InstructionalPanel
              title="Select Stakeholder Group"
              variant="compact"
              texts={[
                {
                  content: "Choose the stakeholder group who will benefit from carbon revenue. You will map outcomes for each group separately.",
                  type: "info"
                }
              ]}
            />
            
            <div className="space-y-2">
              <label className="font-medium text-black">Stakeholder Group</label>
              {stakeholderGroups.length > 0 ? (
                <div className={`border rounded-md p-3 space-y-2 ${submitAttempted && selectedStakeholderIds.length === 0 ? 'border-c4c-burgundy' : 'border-c4c-rule'}`}>
                  {stakeholderGroups.map(group => (
                    <div key={group._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sg-${group._id}`}
                        checked={selectedStakeholderIds.includes(group._id)}
                        onCheckedChange={(checked) => {
                          setSelectedStakeholderIds(prev =>
                            checked ? [...prev, group._id] : prev.filter(id => id !== group._id)
                          );
                        }}
                      />
                      <label htmlFor={`sg-${group._id}`} className="text-sm text-black cursor-pointer leading-none">{group.name}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-c4c-petrol border border-c4c-rule rounded-md p-3">No stakeholder groups available</p>
              )}
              {submitAttempted && selectedStakeholderIds.length === 0 && (
                <p className="text-sm text-c4c-burgundy">Please select at least one stakeholder group</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <InstructionalPanel
              title="Select Domain of Change"
              variant="compact"
              texts={[
                {
                  content: "Choose the area of well-being that the carbon revenue could strengthen for this stakeholder group.",
                  type: "info"
                }
              ]}
            />
            
            <div className="space-y-2">
              <label className="font-medium text-black">Theme</label>
              <p className="text-sm text-c4c-petrol">Select the domain of change that applies to this impact</p>

              {selectedTheme && (
                <div className="flex items-center gap-2 p-3 bg-c4c-grey-bg rounded-md">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getSelectedThemeName()?.name}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTheme('');
                        setSelectedSubThemes([]);
                      }}
                      className="ml-1 hover:bg-c4c-grey-bg rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                  {getSelectedThemeName()?.description && (
                    <button
                      type="button"
                      onClick={(e) => handleThemeInfoClick(e, selectedTheme)}
                      className="p-1 hover:bg-c4c-grey-bg rounded-full transition-colors"
                    >
                      <HelpCircle
                        className={`h-4 w-4 transition-colors ${
                          clickedTheme === selectedTheme ? 'text-black' : 'text-c4c-petrol hover:text-black'
                        }`}
                      />
                    </button>
                  )}
                </div>
              )}

              {!selectedTheme && (
                <Select
                  value={selectedTheme}
                  onValueChange={(value) => {
                    setSelectedTheme(value);
                    setSelectedSubThemes([]);
                  }}
                  disabled={selectedStakeholderIds.length === 0}
                >
                  <SelectTrigger className="border-c4c-rule text-black focus:border-c4c-petrol focus:ring-c4c-petrol">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-c4c-rule">
                    {themes.map(theme => (
                      <SelectItem key={theme._id} value={theme._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{theme.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {!selectedTheme && (
                <p className="text-sm text-c4c-burgundy">Please select a theme</p>
              )}
            </div>
          </div>
          
          {/* SubTheme Selection */}
          <div className="space-y-4">
            <InstructionalPanel
              title="Select Key Outcomes"
              variant="compact"
              texts={[
                {
                  content: "Refine your focus by selecting the specific sub-domains that describe the changes this group wants to achieve.",
                  type: "info"
                }
              ]}
            />
            
            <div className="space-y-2">
              <label className="font-medium text-black">SubThemes</label>
              <p className="text-sm text-c4c-petrol">
                Select specific key outcomes within your chosen domain
                {!selectedTheme && " (select theme first)"}
              </p>

              {loadingSubThemes && (
                <div className="flex items-center justify-center p-4">
                  <Loader className="animate-spin mr-2" size={16} />
                  <span className="text-sm text-c4c-petrol">Loading subthemes...</span>
                </div>
              )}

              {/* Selected SubThemes Display with Info Icons */}
              {selectedSubThemes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-c4c-grey-bg rounded-md">
                  {getSelectedSubThemeNames().map(subTheme => (
                    <div key={subTheme._id} className="flex items-center gap-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {subTheme.name}
                        <button
                          type="button"
                          onClick={() => removeSubTheme(subTheme._id)}
                          className="ml-1 hover:bg-c4c-grey-bg rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                      {(subTheme.description ||
                        (subTheme.indicatorTags && subTheme.indicatorTags.length > 0) ||
                        (subTheme.sdgTags && subTheme.sdgTags.length > 0) ||
                        (subTheme.resilienceTags && subTheme.resilienceTags.length > 0) ||
                        (subTheme.esgTags && subTheme.esgTags.length > 0) ||
                        (subTheme.standardTags && subTheme.standardTags.length > 0)) && (
                        <button
                          type="button"
                          onClick={(e) => handleSubThemeInfoClick(e, subTheme._id)}
                          className="p-1 hover:bg-c4c-grey-bg rounded-full transition-colors"
                        >
                          <HelpCircle
                            className={`h-3 w-3 transition-colors ${
                              clickedSubTheme === subTheme._id ? 'text-black' : 'text-c4c-petrol hover:text-black'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* SubTheme Selection Checkboxes - WITH INFO ICONS */}
              {subThemesByTheme.length > 0 && !loadingSubThemes && (
                <div className="space-y-4 max-h-64 overflow-y-auto border border-c4c-rule rounded-md p-3">
                  {subThemesByTheme.map(themeGroup => (
                    <div key={themeGroup.theme._id} className="space-y-2">
                      <h4 className="font-medium text-sm text-black border-b pb-1">
                        {themeGroup.theme.name}
                      </h4>
                      <div className="grid grid-cols-1 gap-2 pl-2">
                        {themeGroup.subThemes.map(subTheme => {
                          // Check if this subtheme has any tags or description
                          const hasInfo = subTheme.description || 
                            (subTheme.indicatorTags && subTheme.indicatorTags.length > 0) ||
                            (subTheme.sdgTags && subTheme.sdgTags.length > 0) ||
                            (subTheme.resilienceTags && subTheme.resilienceTags.length > 0) ||
                            (subTheme.esgTags && subTheme.esgTags.length > 0) ||
                            (subTheme.standardTags && subTheme.standardTags.length > 0);
                          
                          return (
                            <div key={subTheme._id} className="flex items-center space-x-2 relative">
                              <Checkbox
                                id={`subtheme-${subTheme._id}`}
                                checked={selectedSubThemes.includes(subTheme._id)}
                                onCheckedChange={() => handleSubThemeToggle(subTheme._id)}
                              />
                              <label 
                                htmlFor={`subtheme-${subTheme._id}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                              >
                                {subTheme.name}
                              </label>
                              {hasInfo && (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => handleSubThemeInfoClick(e, subTheme._id)}
                                    className="p-1 hover:bg-c4c-grey-bg rounded-full transition-colors"
                                  >
                                    <HelpCircle
                                      className={`h-4 w-4 transition-colors ${
                                        clickedSubTheme === subTheme._id ? 'text-black' : 'text-c4c-petrol hover:text-black'
                                      }`}
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTheme && selectedSubThemes.length === 0 && !loadingSubThemes && (
                <p className="text-sm text-c4c-burgundy">Please select at least one subtheme</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <InstructionalPanel
              title="Define Expected Outcome"
              variant="compact"
              texts={[
                {
                  content: "Given the domains of change that you have chosen, now define the expected outcome you hope to see for this stakeholder group as a result of the carbon revenue.",
                  type: "info"
                },
                {
                  content: "An outcome should be framed to be SMART - specific, measurable, realistic and timebound.",
                  type: "note"
                },
                {
                  content: `An example of a SMART outcome is "By December 2026, at least 60% of participating households in [target area] have increased their average monthly income from diversified livelihood activities by 30% compared to the 2025 baseline"`,
                  type: "note"
                }
              ]}
            />
            
            <div className="space-y-2">
              <label className="font-medium text-black">Expected Outcome</label>
              <Textarea
                {...register('outcome', { required: 'Outcome is required' })}
                placeholder="Describe the expected outcome or change you hope to see for this stakeholder group"
                rows={3}
                className="border-c4c-rule focus:border-c4c-petrol focus:ring-c4c-petrol"
              />
              {errors.outcome && (
                <p className="text-sm text-c4c-burgundy">{errors.outcome.message}</p>
              )}
            </div>
          </div>

          {/* ── Linked Risks (edit mode only) ──────────────────────────── */}
          {impactId && (
            <div className="space-y-3 rounded-lg border border-c4c-rule p-4 bg-c4c-grey-bg/30">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-black" />
                  <span className="font-medium text-black">
                    Risk Register
                  </span>
                  {linkedRisks.length > 0 && (
                    <span className="text-xs font-medium bg-c4c-tint-coral text-c4c-burgundy px-2 py-0.5 rounded-full">
                      {linkedRisks.length} logged
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!organizationId || !userRole || !currentUser) {
                      toast({
                        title: 'Cannot open risk form',
                        description: 'Organization, role, and user info are required. Please reload the page.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    setShowCreateRiskModal(true);
                  }}
                  className="border-black text-black hover:bg-c4c-grey-bg"
                >
                  <Plus className="mr-1 h-3 w-3" /> Log Risk
                </Button>
              </div>

              {/* Risk list */}
              {loadingRisks ? (
                <div className="flex items-center gap-2 py-3 text-sm text-c4c-petrol">
                  <Loader className="animate-spin h-4 w-4" /> Loading risks...
                </div>
              ) : linkedRisks.length === 0 ? (
                <div className="rounded-md border-2 border-dashed border-c4c-rule p-5 text-center text-c4c-petrol bg-white">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1.5 text-c4c-petrol/40" />
                  <p className="text-sm font-medium">No risks logged yet</p>
                  <p className="text-xs mt-1 text-c4c-petrol">
                    Click "Log Risk" to add a risk to the register for this outcome
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedRisks.map(risk => (
                    <button
                      key={risk._id}
                      type="button"
                      onClick={() => {
                        if (!userRole || !currentUser) return;
                        setEditingRisk(risk);
                      }}
                      className="w-full text-left rounded-md border border-c4c-rule p-3 bg-white hover:border-black hover:bg-c4c-grey-bg/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-black truncate">{risk.name}</p>
                          <p className="text-xs text-c4c-petrol truncate mt-0.5">{risk.riskDescription}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            risk.riskScore === 'high'   ? 'bg-c4c-tint-coral text-c4c-burgundy' :
                            risk.riskScore === 'medium' ? 'bg-c4c-tint-gold text-black' :
                                                          'bg-c4c-tint-sage text-black'
                          }`}>
                            {risk.riskScore}
                          </span>
                          <span className="text-xs text-c4c-petrol capitalize">{risk.status}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* CreateRiskModal — opened by the "Log Risk" button above */}
              {organizationId && userRole && currentUser && (
                <CreateRiskModal
                  isOpen={showCreateRiskModal}
                  onClose={() => setShowCreateRiskModal(false)}
                  projectId={projectId}
                  organizationId={organizationId}
                  userRole={userRole}
                  currentUser={currentUser}
                  projectSites={projectSiteId ? [{ _id: projectSiteId, name: 'Current Site' }] : []}
                  riskSource="toc_stage2"
                  sourceReference={impactId}
                  sourceFieldName="Social Impact Outcome"
                  onRiskCreated={async () => {
                    setShowCreateRiskModal(false);
                    try {
                      const { data } = await getImpactRisks(impactId);
                      setLinkedRisks(data.data || []);
                    } catch (err) {
                      console.error('Error reloading risks:', err);
                    }
                  }}
                />
              )}

              {/* EditRiskModal — opened by clicking a risk row above */}
              {editingRisk && userRole && currentUser && (
                <EditRiskModal
                  isOpen={!!editingRisk}
                  onClose={() => setEditingRisk(null)}
                  risk={editingRisk}
                  userRole={userRole}
                  currentUser={currentUser}
                  onRiskUpdated={async () => {
                    setEditingRisk(null);
                    try {
                      const { data } = await getImpactRisks(impactId);
                      setLinkedRisks(data.data || []);
                    } catch (err) {
                      console.error('Error reloading risks:', err);
                    }
                  }}
                />
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="font-medium text-black">Notes</label>
            <Textarea
              {...register('notes')}
              placeholder="Additional notes about this social impact"
              rows={3}
              className="border-c4c-rule focus:border-c4c-petrol focus:ring-c4c-petrol"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-c4c-rule">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-c4c-rule text-c4c-petrol hover:bg-c4c-grey-bg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-c4c-coral text-black hover:bg-c4c-petrol hover:text-white"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </form>
        
        {/* Modal for Theme Description */}
        {clickedTheme && (
          <div 
            ref={tooltipRef}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setClickedTheme(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-c4c-petrol text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {themes.find(t => t._id === clickedTheme)?.name}
                </h3>
                <button
                  onClick={() => setClickedTheme(null)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                <p className="text-c4c-petrol leading-relaxed whitespace-pre-line">
                  {themes.find(t => t._id === clickedTheme)?.description}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal for SubTheme Description and Tags */}
        {clickedSubTheme && (
          <div 
            ref={tooltipRef}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setClickedSubTheme(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-c4c-petrol text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {availableSubThemes.find(st => st._id === clickedSubTheme)?.name}
                </h3>
                <button
                  onClick={() => setClickedSubTheme(null)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {/* Description */}
                <p className="text-c4c-petrol leading-relaxed whitespace-pre-line mb-4">
                  {availableSubThemes.find(st => st._id === clickedSubTheme)?.description}
                </p>
                
                {/* Tags Section */}
                {(() => {
                  const subTheme = availableSubThemes.find(st => st._id === clickedSubTheme);
                  const hasTags = subTheme && (
                    (subTheme.indicatorTags && subTheme.indicatorTags.length > 0) ||
                    (subTheme.sdgTags && subTheme.sdgTags.length > 0) ||
                    (subTheme.resilienceTags && subTheme.resilienceTags.length > 0) ||
                    (subTheme.esgTags && subTheme.esgTags.length > 0) ||
                    (subTheme.standardTags && subTheme.standardTags.length > 0)
                  );
                  
                  if (!hasTags) return null;
                  
                  return (
                    <div className="border-t border-c4c-rule pt-4 mt-4">
                      <h4 className="font-semibold text-black mb-3">Associated Tags</h4>
                      <div className="space-y-3">
                        {/* Indicators */}
                        {subTheme.indicatorTags && subTheme.indicatorTags.length > 0 && (
                          <div>
                            <label className="text-sm text-c4c-petrol font-medium">Indicators:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {subTheme.indicatorTags.map((tag) => (
                                <span key={tag._id} className="inline-flex items-center rounded-full bg-c4c-grey-bg px-3 py-1 text-xs text-black font-medium">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SDGs */}
                        {subTheme.sdgTags && subTheme.sdgTags.length > 0 && (
                          <div>
                            <label className="text-sm text-c4c-petrol font-medium">SDGs:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {subTheme.sdgTags.map((tag) => (
                                <span key={tag._id} className="inline-flex items-center rounded-full bg-c4c-tint-cyan px-3 py-1 text-xs text-c4c-cobalt font-medium">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resilience */}
                        {subTheme.resilienceTags && subTheme.resilienceTags.length > 0 && (
                          <div>
                            <label className="text-sm text-c4c-petrol font-medium">Resilience:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {subTheme.resilienceTags.map((tag) => (
                                <span key={tag._id} className="inline-flex items-center rounded-full bg-c4c-tint-sage px-3 py-1 text-xs text-black font-medium">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ESG */}
                        {subTheme.esgTags && subTheme.esgTags.length > 0 && (
                          <div>
                            <label className="text-sm text-c4c-petrol font-medium">ESG:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {subTheme.esgTags.map((tag) => (
                                <span key={tag._id} className="inline-flex items-center rounded-full bg-c4c-tint-gold px-3 py-1 text-xs text-black font-medium">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Standards */}
                        {subTheme.standardTags && subTheme.standardTags.length > 0 && (
                          <div>
                            <label className="text-sm text-c4c-petrol font-medium">Standards:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {subTheme.standardTags.map((tag) => (
                                <span key={tag._id} className="inline-flex items-center rounded-full bg-c4c-tint-cyan px-3 py-1 text-xs text-c4c-cobalt font-medium">
                                  {tag.issuingBody}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}