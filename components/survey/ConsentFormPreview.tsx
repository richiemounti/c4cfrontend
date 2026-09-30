// components/survey/ConsentFormPreview.tsx
'use client';

import { 
  FileCheck, 
  Globe, 
  Building2, 
  FolderOpen,
  User,
  Calendar,
  Languages,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConsentForm } from '@/types';

interface ConsentFormPreviewProps {
  consentForm: ConsentForm;
}

export const ConsentFormPreview = ({ consentForm }: ConsentFormPreviewProps) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScopeInfo = () => {
    if (consentForm.project) {
      return {
        icon: <FolderOpen className="h-4 w-4" />,
        label: 'Project-Specific',
        color: 'bg-c4c-tint-cyan text-c4c-cobalt border-c4c-cobalt/20'
      };
    }
    if (consentForm.organization) {
      return {
        icon: <Building2 className="h-4 w-4" />,
        label: 'Organization-Wide',
        color: 'bg-c4c-grey-bg text-c4c-petrol border-c4c-rule/20'
      };
    }
    return {
      icon: <Globe className="h-4 w-4" />,
      label: 'Global Template',
      color: 'bg-c4c-tint-gold text-c4c-petrol border-c4c-yellow/20'
    };
  };

  const scopeInfo = getScopeInfo();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white border-c4c-rule/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <FileCheck className="h-8 w-8 text-c4c-petrol" />
                <div>
                  <CardTitle className="text-2xl font-bold text-black">
                    {consentForm.name}
                  </CardTitle>
                  <p className="text-sm text-c4c-petrol mt-1">
                    Version {consentForm.version}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${scopeInfo.color}`}
                >
                  {scopeInfo.icon}
                  {scopeInfo.label}
                </Badge>

                {consentForm.isActive ? (
                  <Badge
                    variant="outline"
                    className="bg-c4c-tint-sage text-c4c-sage border-c4c-sage/20 flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-c4c-grey-bg text-c4c-petrol border-c4c-rule/20"
                  >
                    Inactive
                  </Badge>
                )}

                {consentForm.isTemplate && (
                  <Badge
                    variant="outline"
                    className="bg-c4c-tint-gold text-c4c-petrol border-c4c-yellow/20"
                  >
                    Template
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-c4c-petrol">
                <User className="h-4 w-4" />
                Created By
              </div>
              <p className="text-black">
                {typeof consentForm.creator === 'object' && consentForm.creator?.name
                  ? consentForm.creator.name
                  : 'Unknown'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-c4c-petrol">
                <Calendar className="h-4 w-4" />
                Last Updated
              </div>
              <p className="text-black">
                {formatDate(consentForm.updatedAt)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-c4c-petrol">
                <Languages className="h-4 w-4" />
                Languages
              </div>
              <p className="text-black uppercase">
                {consentForm.defaultLanguage}
                {consentForm.translations && consentForm.translations.length > 0 && 
                  ` +${consentForm.translations.length}`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Text Preview */}
      <Card className="bg-white border-c4c-rule/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            Consent Form Text
          </CardTitle>
          <p className="text-sm text-c4c-petrol">
            This is how the consent form will appear to survey respondents
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-c4c-grey-bg rounded-lg p-6 border border-c4c-rule/20">
            <div className="prose prose-sm max-w-none">
              <p className="text-black whitespace-pre-wrap leading-relaxed">
                {consentForm.description}
              </p>
            </div>
          </div>

          {/* Simulated Consent Checkbox */}
          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-c4c-rule/20">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="w-5 h-5 rounded border-2 border-c4c-rule bg-white flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-c4c-petrol" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-black">
                  {consentForm.agreementLabel || 'I have read and agree to the above terms'}
                </p>
                <p className="text-xs text-c4c-petrol mt-1">
                  Preview only - Respondents will check this before proceeding
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translations */}
      {consentForm.translations && consentForm.translations.length > 0 && (
        <Card className="bg-white border-c4c-rule/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Available Translations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consentForm.translations.map((translation, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="uppercase bg-c4c-grey-bg text-c4c-petrol border-c4c-rule/20"
                      >
                        {translation.language}
                      </Badge>
                      <span className="text-sm font-medium text-black">
                        {translation.name}
                      </span>
                    </div>
                    <p className="text-sm text-c4c-petrol pl-4 border-l-2 border-c4c-rule/20">
                      {translation.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="bg-white border-c4c-rule/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-black">
            Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-c4c-petrol">Created:</span>
              <p className="text-black font-medium">
                {formatDate(consentForm.createdAt)}
              </p>
            </div>
            <div>
              <span className="text-c4c-petrol">Last Updated:</span>
              <p className="text-black font-medium">
                {formatDate(consentForm.updatedAt)}
              </p>
            </div>
            {consentForm.templateCategory && (
              <div>
                <span className="text-c4c-petrol">Template Category:</span>
                <p className="text-black font-medium capitalize">
                  {consentForm.templateCategory.replace('_', ' ')}
                </p>
              </div>
            )}
            {typeof consentForm.creator === 'object' && consentForm.creator?.email && (
              <div>
                <span className="text-c4c-petrol">Creator Email:</span>
                <p className="text-black font-medium">
                  {consentForm.creator.email}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};