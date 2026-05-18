// app/dashboard/project/[id]/surveys/[surveyId]/consent/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileCheck, 
  Plus,
  Save,
  X,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { ConsentFormSelector } from '@/components/survey/ConsentFormSelector';
import { ConsentFormPreview } from '@/components/survey/ConsentFormPreview';
import { CreateConsentFormModal } from '@/components/survey/CreateConsentFormModal';
import { EditConsentFormModal } from '@/components/survey/EditConsentFormModal';
import { useSurvey } from '@/hooks/useSurvey';
import { useToast } from "@/hooks/use-toast";
import * as consentFormApi from '@/lib/api/consentForm';
import * as surveyApi from '@/lib/api/survey';
import { AvailableConsentFormsResponse } from '@/types';

interface PageParams {
  id: string;
  surveyId: string;
}

const SurveyConsentPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId, surveyId } = params;
  
  const { survey, loading, fetchSurvey } = useSurvey(surveyId);
  
  const [consentForms, setConsentForms] = useState<AvailableConsentFormsResponse | null>(null);
  const [consentFormsLoading, setConsentFormsLoading] = useState(false);
  const [selectedConsentFormId, setSelectedConsentFormId] = useState<string | null>(null);
  const [consentRequired, setConsentRequired] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchConsentForms = async () => {
    if (!projectId) return;
    
    setConsentFormsLoading(true);
    try {
      const response = await consentFormApi.getAvailableConsentFormsForProject(projectId);
      setConsentForms(response.data);
    } catch (error) {
      console.error('Error fetching consent forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consent forms',
        variant: 'destructive',
      });
    } finally {
      setConsentFormsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchConsentForms();
    }
  }, [projectId]);

  useEffect(() => {
    if (survey) {
      const currentConsentFormId = typeof survey.consentForm === 'object' 
        ? survey.consentForm?._id 
        : survey.consentForm;
      
      setSelectedConsentFormId(currentConsentFormId || null);
      setConsentRequired(survey.consentRequired ?? true);
    }
  }, [survey]);

  useEffect(() => {
    if (survey) {
      const currentConsentFormId = typeof survey.consentForm === 'object' 
        ? survey.consentForm?._id 
        : survey.consentForm;
      
      const hasFormChanged = selectedConsentFormId !== (currentConsentFormId || null);
      const hasRequiredChanged = consentRequired !== (survey.consentRequired ?? true);
      
      setHasChanges(hasFormChanged || hasRequiredChanged);
    }
  }, [selectedConsentFormId, consentRequired, survey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await surveyApi.attachConsentFormToSurvey(surveyId, {
        consentFormId: selectedConsentFormId,
        consentRequired
      });
      
      await fetchSurvey();
      
      toast({
        title: 'Success',
        description: selectedConsentFormId 
          ? 'Consent form attached successfully' 
          : 'Consent form removed successfully',
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating consent form:', error);
      toast({
        title: 'Error',
        description: 'Failed to update consent form',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await surveyApi.removeConsentFormFromSurvey(surveyId);
      setSelectedConsentFormId(null);
      setConsentRequired(true);
      
      await fetchSurvey();
      
      toast({
        title: 'Success',
        description: 'Consent form removed successfully',
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error removing consent form:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove consent form',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConsentFormCreated = () => {
    setShowCreateModal(false);
    fetchConsentForms();
    toast({
      title: 'Success',
      description: 'Consent form created successfully',
    });
  };

  const handleConsentFormUpdated = () => {
    setShowEditModal(false);
    fetchConsentForms();
    toast({
      title: 'Success',
      description: 'Consent form updated successfully',
    });
  };

  // The full consent form object for the currently selected form
  const selectedConsentForm = consentForms?.all.find(cf => cf._id === selectedConsentFormId);

  if (loading || consentFormsLoading) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          <p className="text-stratosphere-900 font-medium ml-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Project"
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-ochre-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">Survey Not Found</h2>
            <Link href={`/dashboard/project/${projectId}/surveys`}>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                Back to Surveys
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stratosphere-50">
      <ProjectSidebar 
        projectId={projectId}
        projectName={typeof survey.project === 'object' ? survey.project?.name : 'Project'}
      />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-concrete-500/20">
          <Link 
            href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
            className="flex items-center text-sky-500 hover:text-stratosphere-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Survey Details
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-stratosphere-900 mb-1 flex items-center gap-2">
                <FileCheck className="h-7 w-7 text-clay-500" />
                Consent Form Management
              </h1>
              <p className="text-sky-500">
                Attach a consent form to {survey.title}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="bg-ochre-50 text-ochre-500 border-ochre-500/20">
                  Unsaved Changes
                </Badge>
              )}
              
              {selectedConsentFormId && (
                <Button
                  onClick={handleRemove}
                  disabled={saving}
                  variant="outline"
                  className="border-ochre-500/30 text-ochre-500 hover:bg-ochre-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
              
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="select" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="select">Select Consent Form</TabsTrigger>
                <TabsTrigger value="preview" disabled={!selectedConsentFormId}>
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="select" className="space-y-6">
                {/* Consent Required Toggle */}
                <Card className="bg-white border-concrete-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-stratosphere-900">
                      Consent Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="consent-required" className="text-base font-medium text-stratosphere-900">
                          Require Consent
                        </Label>
                        <p className="text-sm text-sky-500">
                          Respondents must accept the consent form before taking the survey
                        </p>
                      </div>
                      <Switch
                        id="consent-required"
                        checked={consentRequired}
                        onCheckedChange={setConsentRequired}
                        disabled={!selectedConsentFormId}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Available Consent Forms */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-stratosphere-900">
                        Available Consent Forms
                      </h2>
                      <p className="text-sm text-sky-500">
                        Choose from project-specific, organization-wide, or global templates
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Edit button — only shown when a form is selected */}
                      {selectedConsentForm && (
                        <Button
                          onClick={() => setShowEditModal(true)}
                          variant="outline"
                          className="border-clay-500/30 text-clay-500 hover:bg-clay-50"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Selected
                        </Button>
                      )}

                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-clay-500 hover:bg-clay-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New
                      </Button>
                    </div>
                  </div>

                  {consentForms && consentForms.all.length > 0 ? (
                    <ConsentFormSelector
                      consentForms={consentForms}
                      selectedId={selectedConsentFormId}
                      onSelect={setSelectedConsentFormId}
                    />
                  ) : (
                    <Card className="bg-white border-concrete-500/20">
                      <CardContent className="py-12">
                        <div className="text-center">
                          <FileCheck className="h-16 w-16 text-concrete-500/50 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-stratosphere-900 mb-2">
                            No Consent Forms Available
                          </h3>
                          <p className="text-sky-500 mb-6">
                            Create your first consent form to get started
                          </p>
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-clay-500 hover:bg-clay-600 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Consent Form
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview">
                {selectedConsentForm && (
                  <div className="space-y-4">
                    {/* Edit shortcut from the preview tab */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setShowEditModal(true)}
                        variant="outline"
                        className="border-clay-500/30 text-clay-500 hover:bg-clay-50"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit This Form
                      </Button>
                    </div>

                    <ConsentFormPreview consentForm={selectedConsentForm} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Create Consent Form Modal */}
      <CreateConsentFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={projectId}
        onSuccess={handleConsentFormCreated}
      />

      {/* Edit Consent Form Modal — only rendered when a form is selected */}
      {selectedConsentForm && (
        <EditConsentFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          consentForm={selectedConsentForm}
          projectId={projectId}
          onSuccess={handleConsentFormUpdated}
        />
      )}
    </div>
  );
};

export default SurveyConsentPage;