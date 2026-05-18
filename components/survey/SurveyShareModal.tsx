// components/survey/SurveyShareModal.tsx
'use client';

import { useState } from 'react';
import { Copy, Link, Mail, MessageSquare, X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SurveyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  surveyId: string;
  surveyTitle: string;
  surveyStatus: string;
}

export const SurveyShareModal = ({ isOpen, onClose, projectId, surveyId, surveyTitle, surveyStatus }: SurveyShareModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const surveyUrl = `${window.location.origin}/survey/${surveyId}`;
  const previewUrl = `${window.location.origin}/dashboard/project/${projectId}/surveys/${surveyId}/take?preview=true`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent(`Survey: ${surveyTitle}`);
    const body = encodeURIComponent(`Please take our survey: ${surveyUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(`Please take our survey: ${surveyTitle}\n${surveyUrl}`);
    window.open(`https://wa.me/?text=${message}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-stratosphere-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-stratosphere-900">
              Share Survey
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-sky-500">{surveyTitle}</p>
            <Badge variant={surveyStatus === 'published' ? 'default' : 'secondary'}>
              {surveyStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {surveyStatus !== 'published' && (
            <div className="p-4 bg-ochre-50 border border-ochre-500/20 rounded-lg">
              <p className="text-sm text-ochre-600">
                This survey is not published yet. Only the preview link will work.
              </p>
            </div>
          )}

          {/* Survey Link */}
          <div className="space-y-3">
            <Label className="text-stratosphere-900 font-medium">Survey Link</Label>
            <div className="flex gap-2">
              <Input
                value={surveyStatus === 'published' ? surveyUrl : previewUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(
                  surveyStatus === 'published' ? surveyUrl : previewUrl, 
                  'Survey link'
                )}
                className="px-3"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-sky-500">
              {surveyStatus === 'published' 
                ? 'Share this link with your respondents'
                : 'Preview link - for testing purposes only'
              }
            </p>
          </div>

          {/* Quick Share Options */}
          <div className="space-y-3">
            <Label className="text-stratosphere-900 font-medium">Quick Share</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={openEmailClient}
                className="flex items-center gap-2 justify-center"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={shareOnWhatsApp}
                className="flex items-center gap-2 justify-center"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="pt-4 border-t border-concrete-500/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-sky-500">Survey ID:</span>
              <code className="bg-stratosphere-50 px-2 py-1 rounded text-xs">{surveyId}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};