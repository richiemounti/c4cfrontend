// components/survey/ConsentFormSelector.tsx
'use client';

import { useState } from 'react';
import { 
  FileCheck, 
  Globe, 
  Building2, 
  FolderOpen,
  Check,
  Clock,
  Languages
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsentForm, AvailableConsentFormsResponse } from '@/types';

interface ConsentFormSelectorProps {
  consentForms: AvailableConsentFormsResponse;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const ConsentFormSelector = ({
  consentForms,
  selectedId,
  onSelect
}: ConsentFormSelectorProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const ConsentFormCard = ({ consentForm }: { consentForm: ConsentForm }) => {
    const isSelected = selectedId === consentForm._id;
    const isProjectSpecific = consentForms.grouped.projectSpecific.some(cf => cf._id === consentForm._id);
    const isOrgWide = consentForms.grouped.organizationWide.some(cf => cf._id === consentForm._id);
    const isGlobalTemplate = consentForms.grouped.globalTemplates.some(cf => cf._id === consentForm._id);

    const getScopeIcon = () => {
      if (isProjectSpecific) return <FolderOpen className="h-4 w-4" />;
      if (isOrgWide) return <Building2 className="h-4 w-4" />;
      if (isGlobalTemplate) return <Globe className="h-4 w-4" />;
      return <FileCheck className="h-4 w-4" />;
    };

    const getScopeLabel = () => {
      if (isProjectSpecific) return 'Project-Specific';
      if (isOrgWide) return 'Organization-Wide';
      if (isGlobalTemplate) return 'Global Template';
      return 'Unknown';
    };

    const getScopeBadgeColor = () => {
      if (isProjectSpecific) return 'bg-coral-50 text-coral-500 border-coral-500/20';
      if (isOrgWide) return 'bg-sky-50 text-sky-500 border-sky-500/20';
      if (isGlobalTemplate) return 'bg-clay-50 text-clay-500 border-clay-500/20';
      return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
    };

    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-coral-500 border-coral-500 bg-coral-50/30' 
            : 'bg-white border-concrete-500/20 hover:border-sky-500/50'
        }`}
        onClick={() => onSelect(isSelected ? null : consentForm._id)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-stratosphere-900 text-lg">
                  {consentForm.name}
                </h3>
                {isSelected && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-coral-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              <p className="text-sm text-sky-500 line-clamp-2 mb-3">
                {consentForm.description}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs flex items-center gap-1 ${getScopeBadgeColor()}`}
                >
                  {getScopeIcon()}
                  {getScopeLabel()}
                </Badge>

                {consentForm.isTemplate && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-ochre-50 text-ochre-500 border-ochre-500/20"
                  >
                    Template
                  </Badge>
                )}

                {consentForm.isActive ? (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-grass-50 text-grass-500 border-grass-500/20"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-concrete-50 text-concrete-500 border-concrete-500/20"
                  >
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-concrete-500/10">
            <div className="flex items-center gap-4 text-xs text-sky-500">
              {consentForm.version && (
                <span className="flex items-center gap-1">
                  <FileCheck className="h-3 w-3" />
                  v{consentForm.version}
                </span>
              )}
              
              {consentForm.defaultLanguage && (
                <span className="flex items-center gap-1 uppercase">
                  <Languages className="h-3 w-3" />
                  {consentForm.defaultLanguage}
                </span>
              )}
              
              {consentForm.translations && consentForm.translations.length > 0 && (
                <span>+{consentForm.translations.length} translations</span>
              )}
            </div>

            {/* {typeof consentForm.updatedAt === 'string' || consentForm.updatedAt instanceof Date ? (
              <span className="text-xs text-sky-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(consentForm.updatedAt).toLocaleDateString()}
              </span>
            ) : null} */}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConsentForms = (forms: ConsentForm[]) => {
    if (forms.length === 0) {
      return (
        <Card className="bg-white border-concrete-500/20">
          <CardContent className="py-12">
            <div className="text-center">
              <FileCheck className="h-12 w-12 text-concrete-500/50 mx-auto mb-3" />
              <p className="text-sky-500">No consent forms in this category</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map(form => (
          <ConsentFormCard key={form._id} consentForm={form} />
        ))}
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          All ({consentForms.all.length})
        </TabsTrigger>
        <TabsTrigger value="project" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Project ({consentForms.grouped.projectSpecific.length})
        </TabsTrigger>
        <TabsTrigger value="organization" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Organization ({consentForms.grouped.organizationWide.length})
        </TabsTrigger>
        <TabsTrigger value="global" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Global ({consentForms.grouped.globalTemplates.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        {renderConsentForms(consentForms.all)}
      </TabsContent>

      <TabsContent value="project">
        {renderConsentForms(consentForms.grouped.projectSpecific)}
      </TabsContent>

      <TabsContent value="organization">
        {renderConsentForms(consentForms.grouped.organizationWide)}
      </TabsContent>

      <TabsContent value="global">
        {renderConsentForms(consentForms.grouped.globalTemplates)}
      </TabsContent>
    </Tabs>
  );
};