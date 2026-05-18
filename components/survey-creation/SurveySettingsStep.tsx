// components/survey-creation/SurveySettingsStep.tsx
'use client';

import { useState } from 'react';
import { Settings, Globe, Lock, ArrowLeft, ArrowRight, Calendar, Users, Mail, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SurveyCreationContextType } from '@/types/survey-creation';

interface SurveySettingsStepProps {
  context: SurveyCreationContextType;
  onNext: () => void;
  onBack: () => void;
}

export default function SurveySettingsStep({ context, onNext, onBack }: SurveySettingsStepProps) {
  const { formData, handleSettingsChange } = context;
  const { settings } = formData;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleDateChange = (field: string, value: string) => {
    handleSettingsChange(field, value || undefined);
  };

  return (
    <div className="space-y-6">
      {/* Access Control Settings */}
      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-sky-500" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Public Survey
              </Label>
              <p className="text-sm text-sky-500">
                Allow anyone with the link to access this survey
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.isPublic}
                onCheckedChange={(checked) => handleSettingsChange('isPublic', checked)}
              />
              {settings.isPublic ? (
                <Badge className="bg-emerald-100 text-emerald-700">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Requires Authentication
              </Label>
              <p className="text-sm text-sky-500">
                Users must be logged in to access this survey
              </p>
            </div>
            <Switch
              checked={settings.requiresAuth}
              onCheckedChange={(checked) => handleSettingsChange('requiresAuth', checked)}
              disabled={!settings.isPublic}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Allow Anonymous Responses
              </Label>
              <p className="text-sm text-sky-500">
                Collect responses without requiring user identification
              </p>
            </div>
            <Switch
              checked={settings.allowAnonymous}
              onCheckedChange={(checked) => handleSettingsChange('allowAnonymous', checked)}
            />
          </div>

          {!settings.isPublic && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                This survey is private and will only be accessible to users with explicit permissions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Response Management */}
      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-500" />
            Response Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Allow Multiple Responses
              </Label>
              <p className="text-sm text-sky-500">
                Allow the same user to submit multiple responses
              </p>
            </div>
            <Switch
              checked={settings.allowMultipleResponses}
              onCheckedChange={(checked) => handleSettingsChange('allowMultipleResponses', checked)}
            />
          </div>

          {settings.allowMultipleResponses && (
            <div>
              <Label htmlFor="maxResponses" className="text-sm font-medium text-stratosphere-900">
                Maximum Responses per User (Optional)
              </Label>
              <Input
                id="maxResponses"
                type="number"
                min="1"
                value={settings.maxResponses || ''}
                onChange={(e) => handleSettingsChange('maxResponses', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="No limit"
                className="mt-1 border-concrete-500/30 w-32"
              />
              <p className="text-sm text-sky-500 mt-1">
                Leave empty for unlimited responses
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-500" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-stratosphere-900">
              Start Date (Optional)
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formatDate(settings.startDate)}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="mt-1 border-concrete-500/30 w-48"
            />
            <p className="text-sm text-sky-500 mt-1">
              Survey will be available from this date
            </p>
          </div>

          <div>
            <Label htmlFor="endDate" className="text-sm font-medium text-stratosphere-900">
              End Date (Optional)
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formatDate(settings.endDate)}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="mt-1 border-concrete-500/30 w-48"
              min={formatDate(settings.startDate)}
            />
            <p className="text-sm text-sky-500 mt-1">
              Survey will close on this date
            </p>
          </div>

          {settings.startDate && settings.endDate && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Survey will be active from {new Date(settings.startDate).toLocaleDateString()} to {new Date(settings.endDate).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* User Experience Settings */}
      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-sky-500" />
            User Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Show Progress Bar
              </Label>
              <p className="text-sm text-sky-500">
                Display completion progress to respondents
              </p>
            </div>
            <Switch
              checked={settings.showProgressBar}
              onCheckedChange={(checked) => handleSettingsChange('showProgressBar', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Allow Save & Continue Later
              </Label>
              <p className="text-sm text-sky-500">
                Let users save their progress and return later
              </p>
            </div>
            <Switch
              checked={settings.allowSaveAndContinue}
              onCheckedChange={(checked) => handleSettingsChange('allowSaveAndContinue', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Randomize Question Order
              </Label>
              <p className="text-sm text-sky-500">
                Show questions in random order for each respondent
              </p>
            </div>
            <Switch
              checked={settings.randomizeQuestions}
              onCheckedChange={(checked) => handleSettingsChange('randomizeQuestions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white border-concrete-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-sky-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Send Confirmation Email
              </Label>
              <p className="text-sm text-sky-500">
                Send confirmation email to respondents after submission
              </p>
            </div>
            <Switch
              checked={settings.sendConfirmationEmail}
              onCheckedChange={(checked) => handleSettingsChange('sendConfirmationEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-stratosphere-900">
                Notify on New Response
              </Label>
              <p className="text-sm text-sky-500">
                Get notified when someone submits a response
              </p>
            </div>
            <Switch
              checked={settings.notifyOnResponse}
              onCheckedChange={(checked) => handleSettingsChange('notifyOnResponse', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back: Survey Structure
        </Button>
        <Button onClick={onNext} className="bg-sky-500 hover:bg-sky-600 text-white">
          Next: Review & Create
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}