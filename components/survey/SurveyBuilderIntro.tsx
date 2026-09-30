// components/surveys/SurveyBuilderIntro.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  FileSearch, 
  Users, 
  CheckSquare, 
  Languages, 
  Sparkles,
  ArrowRight,
  BookOpen,
  MessageSquarePlus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface SurveyBuilderIntroProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const SurveyBuilderIntro = ({ open, onClose, projectId }: SurveyBuilderIntroProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Survey Builder",
      description: "Create professional surveys tailored to your stakeholder groups and project needs",
      icon: <Sparkles className="h-12 w-12 text-c4c-petrol" />,
      content: (
        <div className="space-y-4">
          <p className="text-c4c-petrol leading-relaxed">
            The Survey Builder helps you create comprehensive, compliant surveys for your carbon sector projects.
            Our intelligent system guides you through the entire process, ensuring you capture the right data
            while maintaining GDPR compliance.
          </p>
          <div className="bg-c4c-grey-bg border border-c4c-rule/20 rounded-lg p-4">
            <h4 className="font-medium text-black mb-2">What makes our surveys special?</h4>
            <ul className="space-y-2 text-sm text-c4c-petrol">
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 text-c4c-sage mt-0.5 flex-shrink-0" />
                Pre-curated questions aligned with industry standards (SDGs, ESG, etc.)
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 text-c4c-sage mt-0.5 flex-shrink-0" />
                Stakeholder-specific and Theory of Change-aligned questions
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 text-c4c-sage mt-0.5 flex-shrink-0" />
                Multi-language support for diverse communities
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 text-c4c-sage mt-0.5 flex-shrink-0" />
                Custom question creation when you need something specific
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Select Your Context",
      description: "Choose the stakeholder group and project stage",
      icon: <Users className="h-12 w-12 text-c4c-petrol" />,
      content: (
        <div className="space-y-4">
          <p className="text-c4c-petrol leading-relaxed">
            Every survey is designed for a specific stakeholder group within a Theory of Change stage.
            This ensures questions are relevant and meaningful to your respondents.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-c4c-yellow/20 bg-c4c-tint-gold/50">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-c4c-petrol mb-3" />
                <h4 className="font-medium text-black mb-2">Stakeholder Group</h4>
                <p className="text-sm text-c4c-petrol">
                  Select who will be taking this survey - community members, project staff,
                  local authorities, or other stakeholder groups you've defined.
                </p>
              </CardContent>
            </Card>
            <Card className="border-c4c-petrol/20 bg-c4c-tint-cyan/50">
              <CardContent className="pt-6">
                <BookOpen className="h-8 w-8 text-c4c-petrol mb-3" />
                <h4 className="font-medium text-black mb-2">Theory of Change Stage</h4>
                <p className="text-sm text-c4c-petrol">
                  Choose the stage - baseline data collection (Stage 1) or outcome monitoring (Stage 2).
                  This filters questions to what's appropriate for that phase.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Browse & Select Questions",
      description: "Choose from curated questions or create your own",
      icon: <FileSearch className="h-12 w-12 text-c4c-sage" />,
      content: (
        <div className="space-y-4">
          <p className="text-c4c-petrol leading-relaxed">
            Our question library is organized by themes and aligned with major frameworks.
            You can filter, search, and preview questions before adding them to your survey.
          </p>
          <div className="bg-c4c-tint-sage border border-c4c-sage/20 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-black">Question Sources:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-white rounded-full p-2">
                  <CheckSquare className="h-4 w-4 text-c4c-sage" />
                </div>
                <div>
                  <div className="font-medium text-black text-sm">Stakeholder-Specific</div>
                  <div className="text-sm text-c4c-petrol">
                    Questions designed specifically for your selected stakeholder group
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-white rounded-full p-2">
                  <CheckSquare className="h-4 w-4 text-c4c-sage" />
                </div>
                <div>
                  <div className="font-medium text-black text-sm">Frequently Asked</div>
                  <div className="text-sm text-c4c-petrol">
                    Common questions used across similar projects
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-white rounded-full p-2">
                  <CheckSquare className="h-4 w-4 text-c4c-sage" />
                </div>
                <div>
                  <div className="font-medium text-black text-sm">Demographics</div>
                  <div className="text-sm text-c4c-petrol">
                    GDPR-compliant demographic questions for proper data categorization
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Add Custom Questions (Optional)",
      description: "Create bespoke questions when needed",
      icon: <MessageSquarePlus className="h-12 w-12 text-c4c-petrol" />,
      content: (
        <div className="space-y-4">
          <p className="text-c4c-petrol leading-relaxed">
            Sometimes you need to ask something specific to your project. You can create bespoke questions
            that go through an approval workflow before being added to your survey.
          </p>
          <Card className="border-c4c-petrol/20 bg-c4c-tint-cyan/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <span className="text-c4c-petrol font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black text-sm">Create Your Question</div>
                    <div className="text-sm text-c4c-petrol">Write the question text and select the type</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <span className="text-c4c-petrol font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black text-sm">Approval Process</div>
                    <div className="text-sm text-c4c-petrol">Project managers review for quality</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <span className="text-c4c-petrol font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black text-sm">Add to Survey</div>
                    <div className="text-sm text-c4c-petrol">Once approved, use in your surveys</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Step 4: Organize & Configure",
      description: "Structure your survey with sections and logic",
      icon: <CheckSquare className="h-12 w-12 text-c4c-cobalt" />,
      content: (
        <div className="space-y-4">
          <p className="text-c4c-petrol leading-relaxed">
            Create a logical flow for your respondents by organizing questions into sections,
            setting required fields, and adding custom instructions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-c4c-tint-cyan border border-c4c-cobalt/20 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-c4c-cobalt" />
                Sections
              </h4>
              <p className="text-sm text-c4c-petrol">
                Group related questions together for better organization and easier navigation
              </p>
            </div>
            <div className="bg-c4c-tint-cyan border border-c4c-cobalt/20 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-c4c-cobalt" />
                Reordering
              </h4>
              <p className="text-sm text-c4c-petrol">
                Drag and drop questions to create the perfect flow for your respondents
              </p>
            </div>
            <div className="bg-c4c-tint-cyan border border-c4c-cobalt/20 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-c4c-cobalt" />
                Customization
              </h4>
              <p className="text-sm text-c4c-petrol">
                Modify question text, add context, and set validation rules as needed
              </p>
            </div>
            <div className="bg-c4c-tint-cyan border border-c4c-cobalt/20 rounded-lg p-4">
              <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-c4c-cobalt" />
                Categories
              </h4>
              <p className="text-sm text-c4c-petrol">
                Tag surveys as baseline, monitoring, evaluation, or custom categories
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Add Translations (Optional)",
      description: "Make your survey accessible in multiple languages",
      icon: <Languages className="h-12 w-12 text-c4c-petrol" />,
      content: (
        <div className="space-y-4">
          <p className="text-c4c-petrol leading-relaxed">
            Reach diverse communities by translating your survey into local languages.
            Translations maintain the same structure while adapting content appropriately.
          </p>
          <Card className="border-c4c-petrol/20 bg-c4c-tint-cyan/50">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Languages className="h-5 w-5 text-c4c-petrol mt-0.5" />
                  <div>
                    <div className="font-medium text-black text-sm mb-1">Translation Workflow</div>
                    <p className="text-sm text-c4c-petrol">
                      Create translation drafts, submit for review, and publish when approved.
                      Respondents can then take the survey in their preferred language.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Languages className="h-5 w-5 text-c4c-petrol mt-0.5" />
                  <div>
                    <div className="font-medium text-black text-sm mb-1">Cultural Adaptation</div>
                    <p className="text-sm text-c4c-petrol">
                      Beyond word-for-word translation, adapt questions to be culturally appropriate
                      while maintaining their core meaning and intent.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="bg-c4c-tint-gold border border-c4c-yellow/20 rounded-lg p-4">
            <p className="text-sm text-c4c-petrol">
              <strong>Pro Tip:</strong> Work with local translators who understand both the language
              and the cultural context of your project area for best results.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Build Your Survey!",
      description: "You're all set to create effective, compliant surveys",
      icon: <Sparkles className="h-12 w-12 text-c4c-petrol" />,
      content: (
        <div className="space-y-4">
          <p className="text-c4c-petrol leading-relaxed">
            You now understand the survey building process. Remember, you can always return to this guide
            from the help menu if you need a refresher.
          </p>
          <div className="bg-gradient-to-br from-c4c-grey-bg to-c4c-tint-sage border border-c4c-rule/20 rounded-lg p-6">
            <h4 className="font-medium text-black mb-4 text-center">Quick Start Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  onClose();
                  router.push(`/dashboard/project/${projectId}/surveys/builder`);
                }}
                className="bg-c4c-coral text-black hover:bg-c4c-petrol hover:text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Building
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  router.push(`/dashboard/project/${projectId}/surveys/templates`);
                }}
                variant="outline"
                className="border-c4c-rule/30 text-c4c-petrol hover:bg-c4c-grey-bg"
              >
                Browse Templates
              </Button>
            </div>
          </div>
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-c4c-petrol hover:text-black"
            >
              Skip for now, I'll explore on my own
            </Button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <div>
                <DialogTitle className="text-2xl text-black">
                  {currentStepData.title}
                </DialogTitle>
                <DialogDescription className="text-c4c-petrol mt-1">
                  {currentStepData.description}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {currentStepData.content}
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-c4c-petrol'
                  : 'w-2 bg-c4c-rule hover:bg-c4c-petrol/50'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-c4c-rule/20">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={isFirstStep}
            className="border-c4c-rule/30"
          >
            Previous
          </Button>

          <div className="text-sm text-c4c-petrol">
            Step {currentStep + 1} of {steps.length}
          </div>

          <Button
            onClick={() => {
              if (isLastStep) {
                onClose();
              } else {
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
              }
            }}
            className="bg-c4c-petrol hover:bg-black text-white"
          >
            {isLastStep ? 'Get Started' : 'Next'}
            {!isLastStep && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyBuilderIntro;