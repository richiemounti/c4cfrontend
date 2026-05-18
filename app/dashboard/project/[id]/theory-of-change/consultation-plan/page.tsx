// /app/dashboard/projects/[projectId]/theory-of-change/consultation-plan/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Save, CheckCircle, ArrowLeft, Calendar, Users, HelpCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getProject, getProjectSite } from '@/lib/api/project';
import { 
  createOrUpdateConsultationPlan, 
  getConsultationPlanBySite,
  getStakeholderGroupsForSite,
  completeConsultationPlan
} from '@/lib/api/tocConsultationPlan';
import type { 
  ConsultationPlanFormData, 
  ConsultationPlan, 
  StakeholderGroup,
  StakeholderGroupSelection 
} from '@/types';

export default function ConsultationPlanPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const projectId = params.id as string;
  const siteId = searchParams.get('siteId');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [projectSite, setProjectSite] = useState<any>(null);
  const [existingPlan, setExistingPlan] = useState<ConsultationPlan | null>(null);
  const [availableStakeholders, setAvailableStakeholders] = useState<StakeholderGroup[]>([]);
  
  const [formData, setFormData] = useState<ConsultationPlanFormData>({
    projectId,
    projectSiteId: siteId || '',
    stakeholderGroups: [],
    consultationQuestions: {
      howManyPeople: '',
      whoInvitedHow: '',
      whereHow: '',
      underRepresentedGroups: '',
      costsPlanning: '',
      permissions: ''
    },
    plannedConsultationDates: {
      startDate: '',
      endDate: '',
      dateDescription: ''
    }
  });

  const getCategoryName = (category: any) => {
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    return '';
  };

  useEffect(() => {
    if (!siteId) {
      router.push(`/dashboard/project/${projectId}/theory-of-change`);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details
        const projectData = await getProject(projectId);
        setProject(projectData.data);
        
        // Fetch project site details
        const siteData = await getProjectSite(siteId);
        setProjectSite(siteData.data);
        
        // Fetch available stakeholder groups
        const stakeholdersData = await getStakeholderGroupsForSite(siteId);
        console.log('Stakeholders response:', stakeholdersData);
        
        // Extract stakeholder groups from the correct path: data.data.stakeholderGroups
        const stakeholderGroups = stakeholdersData.data?.data?.stakeholderGroups || [];
        console.log('Extracted stakeholder groups:', stakeholderGroups);
        
        setAvailableStakeholders(stakeholderGroups);
        
        // Try to fetch existing consultation plan
        try {
          const planData = await getConsultationPlanBySite(siteId);
          const plan = planData.data;
          
          if (plan && plan.data) {
            setExistingPlan(plan.data);
            
            // Pre-populate form with existing data
            setFormData({
              projectId,
              projectSiteId: siteId,
              stakeholderGroups: plan.data.stakeholderGroups || [],
              consultationQuestions: plan.data.consultationQuestions || {
                howManyPeople: '',
                whoInvitedHow: '',
                whereHow: '',
                underRepresentedGroups: '',
                costsPlanning: '',
                permissions: ''
              },
              plannedConsultationDates: {
                startDate: plan.data.plannedConsultationDates?.startDate 
                  ? new Date(plan.data.plannedConsultationDates.startDate).toISOString().split('T')[0]
                  : '',
                endDate: plan.data.plannedConsultationDates?.endDate
                  ? new Date(plan.data.plannedConsultationDates.endDate).toISOString().split('T')[0]
                  : '',
                dateDescription: plan.data.plannedConsultationDates?.dateDescription || ''
              }
            });
          }
        } catch (planError) {
          console.log('No existing consultation plan found');
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load consultation plan data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, siteId, router, toast]);


  const handleStakeholderSelection = (stakeholderId: string, isSelected: boolean) => {
    setFormData(prev => {
      const existingIndex = prev.stakeholderGroups?.findIndex(
        sg => sg.stakeholderGroup === stakeholderId
      );

      if (existingIndex !== undefined && existingIndex !== -1) {
        // Update existing stakeholder
        const updated = [...(prev.stakeholderGroups || [])];
        updated[existingIndex] = { ...updated[existingIndex], isSelected };
        return { ...prev, stakeholderGroups: updated };
      } else {
        // Add new stakeholder
        return {
          ...prev,
          stakeholderGroups: [
            ...(prev.stakeholderGroups || []),
            {
              stakeholderGroup: stakeholderId,
              isSelected,
              notes: ''
            }
          ]
        };
      }
    });
  };

  const handleStakeholderNotes = (stakeholderId: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      stakeholderGroups: prev.stakeholderGroups?.map(sg => 
        sg.stakeholderGroup === stakeholderId 
          ? { ...sg, notes }
          : sg
      ) || []
    }));
  };

  const handleQuestionChange = (questionKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      consultationQuestions: {
        ...prev.consultationQuestions,
        [questionKey]: value
      }
    }));
  };

  const handleDateChange = (dateKey: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      plannedConsultationDates: {
        ...prev.plannedConsultationDates,
        [dateKey]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Filter out unselected stakeholders before saving
      const dataToSave = {
        ...formData,
        stakeholderGroups: formData.stakeholderGroups?.filter(sg => sg.isSelected) || []
      };
      
      await createOrUpdateConsultationPlan(dataToSave);
      
      toast({
        title: "Success",
        description: "✅ Your consultation plan for this site has been saved. You've defined who will be consulted, how, and when.",
      });
      
      // Refresh data to get the updated plan
      const planData = await getConsultationPlanBySite(siteId!);
      if (planData.data && planData.data.data) {
        setExistingPlan(planData.data.data);
      }
      
    } catch (error) {
      console.error('Error saving consultation plan:', error);
      toast({
        title: "Error",
        description: "Failed to save consultation plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleComplete = async () => {
    if (!existingPlan) {
      toast({
        title: "Error",
        description: "Please save the plan first",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await completeConsultationPlan(existingPlan._id);
      
      toast({
        title: "Success",
        description: "✅ Consultation plan completed! You are now ready to begin Stage 1 of your Theory of Change.",
      });
      
      // FIXED: Add a longer delay and force reload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back with a reload flag
      router.push(`/dashboard/project/${projectId}/theory-of-change?selectedSite=${siteId}&reload=true`);
      
    } catch (error) {
      console.error('Error completing consultation plan:', error);
      toast({
        title: "Error",
        description: "Failed to complete consultation plan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  const getCompletionPercentage = () => {
    if (!formData.stakeholderGroups || !formData.consultationQuestions || !formData.plannedConsultationDates) {
      return 0;
    }

    let sections = 0;
    let completedSections = 0;

    // Stakeholder selection
    sections++;
    if (formData.stakeholderGroups.some(sg => sg.isSelected)) {
      completedSections++;
    }

    // Consultation questions - at least one question should be answered
    sections++;
    const questions = formData.consultationQuestions;
    const hasAnsweredQuestions = questions && Object.values(questions).some(q => 
      q !== null && 
      q !== undefined && 
      typeof q === 'string' && 
      q.trim() !== ''
    );
    if (hasAnsweredQuestions) {
      completedSections++;
    }

    // Planned dates
    sections++;
    if (formData.plannedConsultationDates.startDate || 
        formData.plannedConsultationDates.endDate || 
        (formData.plannedConsultationDates.dateDescription && 
         formData.plannedConsultationDates.dateDescription.trim() !== '')) {
      completedSections++;
    }

    return Math.round((completedSections / sections) * 100);
  };

  const canComplete = () => {
    return getCompletionPercentage() === 100 && existingPlan && !existingPlan.isCompleted;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
          <p className="text-stratosphere font-medium ml-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (!project || !projectSite) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-stratosphere font-medium">Project site not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-sky-tint">
      {project && (
        <ProjectSidebar 
          projectId={project._id}
          projectName={project.name}
        />
      )}
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Theory of Change
          </button>
          <div>
            <h1 className="text-2xl font-medium text-stratosphere">Consultation Planning</h1>
            <p className="text-gray-500 mt-2">
              Plan your stakeholder consultations for <strong>{projectSite.name}</strong>
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress Card */}
            <Card className="bg-white border border-sky">
              <CardHeader>
                <CardTitle className="text-stratosphere">Planning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
                  <div 
                    className="h-2 rounded-full bg-stratosphere transition-all duration-300" 
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
                <p className="text-gray-600">{getCompletionPercentage()}% complete</p>
                {existingPlan?.isCompleted && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="h-4 w-4 text-grass-500" />
                    <span className="text-sm text-grass-500">Consultation plan completed</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 1: Stakeholder Selection */}
            <Card className="bg-white border border-sky">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stratosphere">
                  <Users className="h-5 w-5" />
                  Select Stakeholder Groups
                </CardTitle>
                <CardDescription>
                  Choose which stakeholder groups will participate in your consultation process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableStakeholders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No stakeholder groups available for this site.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Make sure stakeholder groups are set up for this project site.
                    </p>
                  </div>
                ) : (
                  availableStakeholders.map(stakeholder => {
                    const selection = formData.stakeholderGroups?.find(
                      sg => sg.stakeholderGroup === stakeholder._id || 
                            sg.stakeholderGroup === (stakeholder._id as any)?._id
                    );
                    const isSelected = selection?.isSelected || false;
                    
                    return (
                      <div key={stakeholder._id} className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={stakeholder._id}
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleStakeholderSelection(stakeholder._id, !!checked)
                            }
                            disabled={existingPlan?.isCompleted}
                            className="border-sky data-[state=checked]:bg-stratosphere data-[state=checked]:border-stratosphere mt-1"
                          />
                          <div className="flex-1">
                            <Label 
                              htmlFor={stakeholder._id}
                              className="text-stratosphere font-medium cursor-pointer"
                            >
                              {stakeholder.name}
                              {stakeholder.category && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({getCategoryName(stakeholder.category)})
                                </span>
                              )}
                            </Label>
                            {stakeholder.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {stakeholder.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="ml-6">
                            <Label htmlFor={`notes-${stakeholder._id}`} className="text-sm text-stratosphere font-medium">
                              Notes (optional)
                            </Label>
                            <Textarea
                              id={`notes-${stakeholder._id}`}
                              placeholder="Add any specific notes about engaging this stakeholder group..."
                              value={selection?.notes || ''}
                              onChange={(e) => handleStakeholderNotes(stakeholder._id, e.target.value)}
                              className="mt-1 border-sky focus:border-stratosphere"
                              rows={2}
                              disabled={existingPlan?.isCompleted}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Section 2: Consultation Questions */}
            <Card className="bg-white border border-sky">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stratosphere">
                  <HelpCircle className="h-5 w-5" />
                  Consultation Planning Questions
                </CardTitle>
                <CardDescription>
                  Answer these questions to plan your consultation activities effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="howManyPeople" className="text-stratosphere font-medium">
                      How many people do you expect to participate in your consultation?
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-stratosphere cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">What number is manageable, inclusive, and fair? Consider group size, representativeness, and practicality.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="howManyPeople"
                    placeholder="Describe expected participation numbers and demographics..."
                    value={formData.consultationQuestions?.howManyPeople || ''}
                    onChange={(e) => handleQuestionChange('howManyPeople', e.target.value)}
                    className="border-sky focus:border-stratosphere"
                    rows={3}
                    disabled={existingPlan?.isCompleted}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="whoInvitedHow" className="text-stratosphere font-medium">
                      Who will be invited and how will they be invited?
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-stratosphere cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Who leads invitations? Will you use posters, local leaders, or direct outreach?</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="whoInvitedHow"
                    placeholder="Describe your invitation strategy and communication methods..."
                    value={formData.consultationQuestions?.whoInvitedHow || ''}
                    onChange={(e) => handleQuestionChange('whoInvitedHow', e.target.value)}
                    className="border-sky focus:border-stratosphere"
                    rows={3}
                    disabled={existingPlan?.isCompleted}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="whereHow" className="text-stratosphere font-medium">
                      Where and how will the consultation take place?
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-stratosphere cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Choose accessible venues and inclusive formats like group discussions, interviews, or a mix.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="whereHow"
                    placeholder="Describe venues, format (in-person/online), and logistics..."
                    value={formData.consultationQuestions?.whereHow || ''}
                    onChange={(e) => handleQuestionChange('whereHow', e.target.value)}
                    className="border-sky focus:border-stratosphere"
                    rows={3}
                    disabled={existingPlan?.isCompleted}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="underRepresentedGroups" className="text-stratosphere font-medium">
                      How will you ensure under-represented groups are included?
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-stratosphere cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Consider holding separate sessions (e.g. for women or youth) and removing participation barriers.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="underRepresentedGroups"
                    placeholder="Describe strategies for inclusive participation..."
                    value={formData.consultationQuestions?.underRepresentedGroups || ''}
                    onChange={(e) => handleQuestionChange('underRepresentedGroups', e.target.value)}
                    className="border-sky focus:border-stratosphere"
                    rows={3}
                    disabled={existingPlan?.isCompleted}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="costsPlanning" className="text-stratosphere font-medium">
                      What are the costs and resource requirements?
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-stratosphere cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Budget for time, travel, refreshments, facilitators, translators, or reimbursements.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="costsPlanning"
                    placeholder="Describe budget, personnel, and other resources needed..."
                    value={formData.consultationQuestions?.costsPlanning || ''}
                    onChange={(e) => handleQuestionChange('costsPlanning', e.target.value)}
                    className="border-sky focus:border-stratosphere"
                    rows={3}
                    disabled={existingPlan?.isCompleted}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="permissions" className="text-stratosphere font-medium">
                      What permissions or approvals do you need?
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 hover:text-stratosphere cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">Consider approvals from local leaders or courtesy visits before community engagement.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="permissions"
                    placeholder="Describe any regulatory approvals, permits, or institutional permissions..."
                    value={formData.consultationQuestions?.permissions || ''}
                    onChange={(e) => handleQuestionChange('permissions', e.target.value)}
                    className="border-sky focus:border-stratosphere"
                    rows={3}
                    disabled={existingPlan?.isCompleted}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Planned Dates */}
            <Card className="bg-white border border-sky">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-stratosphere">
                  <Calendar className="h-5 w-5" />
                  Planned Consultation Dates
                </CardTitle>
                <CardDescription>
                  Schedule your consultation activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Label htmlFor="startDate" className="text-stratosphere font-medium">
                        Start Date
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 hover:text-stratosphere cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Specify the planned date(s) for consultation activities at this site.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.plannedConsultationDates?.startDate || ''}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      className="border-sky focus:border-stratosphere"
                      disabled={existingPlan?.isCompleted}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate" className="text-stratosphere font-medium">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.plannedConsultationDates?.endDate || ''}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      className="mt-1 border-sky focus:border-stratosphere"
                      disabled={existingPlan?.isCompleted}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dateDescription" className="text-stratosphere font-medium">
                    Additional Date Information
                  </Label>
                  <Textarea
                    id="dateDescription"
                    placeholder="Describe your consultation timeline, key milestones, or flexible scheduling."
                    value={formData.plannedConsultationDates?.dateDescription || ''}
                    onChange={(e) => handleDateChange('dateDescription', e.target.value)}
                    className="mt-2 border-sky focus:border-stratosphere"
                    rows={3}
                    disabled={existingPlan?.isCompleted}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!existingPlan?.isCompleted && (
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change`)}
                  className="border-sky text-stratosphere hover:bg-sky-tint"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-ochre-500 hover:bg-ochre-600 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Plan
                    </>
                  )}
                </Button>
                
                {canComplete() && (
                  <Button
                    onClick={handleComplete}
                    disabled={saving}
                    className="bg-grass-500 hover:bg-grass-600 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Plan
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {existingPlan?.isCompleted && (
              <div className="p-4 bg-grass-50 rounded-lg border border-grass-100">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-grass-500" />
                  <p className="text-grass-900 font-medium">
                    Consultation plan completed! You can now proceed to Theory of Change stages.
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change?selectedSite=${siteId}`)}
                  className="bg-stratosphere hover:bg-sky text-white"
                >
                  Return to Theory of Change
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}