'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  FileSearch,
  Users,
  CheckSquare,
  Languages,
  Sparkles,
  BookOpen,
  MessageSquarePlus,
  PlayCircle,
  Grid3x3,
  Settings,
  Search,
  Book,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getProject } from '@/lib/api/project';

interface PageParams {
  id: string;
}

const SurveyBuilderIntroPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { id: projectId } = params;
  const [currentStep, setCurrentStep] = useState(0);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const steps = [
    {
      title: "Welcome to your Survey Builder Guide",
      subtitle: "Build surveys tailored to your stakeholder groups",
      description: "So you can understand what's actually changing for them",
      icon: <Book className="h-16 w-16 text-c4c-petrol" />,
      bgGradient: "from-c4c-grey-bg via-c4c-tint-sage to-c4c-tint-sage",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-c4c-rule/20 shadow-sm">
            <p className="text-c4c-petrol leading-relaxed text-lg mb-6">
              This module helps you create surveys that capture real change safely and clearly.
              Everything&apos;s grounded in your Theory of Change, so the questions you ask connect
              directly to the outcomes you&apos;re tracking.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-c4c-grey-bg rounded-lg p-5 border border-c4c-rule/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-c4c-petrol rounded-lg p-2">
                    <CheckSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Pre-curated Questions</h4>
                    <p className="text-sm text-c4c-petrol">
                      Aligned with recognised frameworks like the SDGs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-c4c-tint-sage rounded-lg p-5 border border-c4c-sage/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-c4c-sage rounded-lg p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Stakeholder-Specific</h4>
                    <p className="text-sm text-c4c-petrol">
                      Questions tailored to each group
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-c4c-tint-sage rounded-lg p-5 border border-c4c-sage/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-c4c-sage rounded-lg p-2">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Multi-Language Support</h4>
                    <p className="text-sm text-c4c-petrol">
                      Translate for the communities you work with
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-c4c-tint-gold rounded-lg p-5 border border-c4c-yellow/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-c4c-yellow rounded-lg p-2">
                    <MessageSquarePlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Custom Questions</h4>
                    <p className="text-sm text-c4c-petrol">
                      Create bespoke ones when needed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-c4c-petrol to-c4c-sage rounded-xl p-1">
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-black mb-3 text-lg">
                What You&apos;ll Learn in This Guide
              </h4>
              <ul className="space-y-3">
                {[
                  'How to select the right context for your survey',
                  'How to browse and filter the question library',
                  'How to create custom questions',
                  'How to organise questions into sections',
                  'How to add translations',
                  'How to schedule your surveys',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-c4c-petrol">
                    <div className="bg-c4c-grey-bg rounded-full p-1">
                      <CheckSquare className="h-4 w-4 text-c4c-petrol" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Select Your Context",
      subtitle: "Every survey is designed for a specific audience",
      description: "within your Theory of Change",
      icon: <Users className="h-16 w-16 text-c4c-petrol" />,
      bgGradient: "from-c4c-tint-gold via-c4c-tint-gold to-c4c-tint-gold",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-c4c-rule/20 shadow-sm">
            <p className="text-c4c-petrol leading-relaxed text-lg mb-6">
              Each survey targets one stakeholder group and one stage of your Theory of Change, so you
              collect exactly the data you need to check progress and understand impact.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-c4c-tint-gold to-white rounded-xl border border-c4c-yellow/20 p-6">
                <div className="bg-c4c-yellow rounded-lg p-3 w-fit mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-black mb-3 text-lg">Stakeholder Group</h4>
                <p className="text-c4c-petrol">
                  Who&apos;s taking this survey — community members, project staff, partner
                  organisations, or any group you&apos;ve defined.
                </p>
              </div>

              <div className="bg-gradient-to-br from-c4c-tint-cyan to-white rounded-xl border border-c4c-petrol/20 p-6">
                <div className="bg-c4c-petrol rounded-lg p-3 w-fit mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-black mb-3 text-lg">Theory of Change Stage</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-c4c-petrol/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-c4c-petrol text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <p className="font-semibold text-black">Stage 1 — Actions</p>
                    </div>
                    <p className="text-sm text-c4c-petrol">
                      Are your planned activities achieving the outputs you intended?
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-c4c-petrol/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-c4c-petrol text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <p className="font-semibold text-black">Stage 2 — Outcomes</p>
                    </div>
                    <p className="text-sm text-c4c-petrol">
                      Are stakeholders experiencing the change you set out to create?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-c4c-grey-bg rounded-xl p-6 border border-c4c-rule/20">
            <div className="flex items-start gap-4">
              <div className="bg-c4c-petrol rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-black mb-2">Smart Filtering</h5>
                <p className="text-c4c-petrol text-sm">
                  Once you select your context, the question library automatically filters to show
                  only what&apos;s relevant.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Browse & Select Questions",
      subtitle: "Choose from our curated question library",
      description: "Filter, search, and preview before adding anything to your survey",
      icon: <FileSearch className="h-16 w-16 text-c4c-sage" />,
      bgGradient: "from-c4c-tint-sage via-c4c-tint-cyan to-c4c-grey-bg",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-c4c-rule/20 shadow-sm">
            <p className="text-c4c-petrol leading-relaxed text-lg mb-6">
              Questions link directly to your Theory of Change sub-themes, and can also be browsed by
              framework (like the SDGs) or theme. Filter, search, and preview before adding anything to
              your survey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-c4c-tint-sage to-white rounded-lg p-5 border border-c4c-sage/20">
                <div className="bg-c4c-sage rounded-lg p-2 w-fit mb-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-black mb-2">Stakeholder-Specific</h4>
                <p className="text-sm text-c4c-petrol">
                  Questions designed for your selected group
                </p>
              </div>

              <div className="bg-gradient-to-br from-c4c-tint-sage to-white rounded-lg p-5 border border-c4c-sage/20">
                <div className="bg-c4c-sage rounded-lg p-2 w-fit mb-3">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-black mb-2">Frequently Asked</h4>
                <p className="text-sm text-c4c-petrol">
                  Common questions used across similar projects
                </p>
              </div>

              <div className="bg-gradient-to-br from-c4c-grey-bg to-white rounded-lg p-5 border border-c4c-rule/20">
                <div className="bg-c4c-petrol rounded-lg p-2 w-fit mb-3">
                  <FileSearch className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-black mb-2">Compare Groups</h4>
                <p className="text-sm text-c4c-petrol">
                  Filter responses by different stakeholder groups
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-c4c-sage to-c4c-petrol rounded-xl p-1">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-black mb-4 text-lg">
                  Browse Questions By
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-c4c-tint-sage rounded-lg p-2">
                      <Grid3x3 className="h-5 w-5 text-c4c-sage" />
                    </div>
                    <p className="font-medium text-black">Themes & sub-themes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-c4c-grey-bg rounded-lg p-2">
                      <Search className="h-5 w-5 text-c4c-petrol" />
                    </div>
                    <p className="font-medium text-black">Text search</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-c4c-tint-sage rounded-lg p-2">
                      <CheckSquare className="h-5 w-5 text-c4c-sage" />
                    </div>
                    <p className="font-medium text-black">Framework tags</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-c4c-tint-gold rounded-lg p-2">
                      <Settings className="h-5 w-5 text-c4c-petrol" />
                    </div>
                    <p className="font-medium text-black">Question type</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Add Custom Questions",
      subtitle: "Sometimes you need to ask something specific to your project",
      description: "(optional)",
      icon: <MessageSquarePlus className="h-16 w-16 text-c4c-petrol" />,
      bgGradient: "from-c4c-grey-bg via-c4c-grey-bg to-c4c-grey-bg",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-c4c-rule/20 shadow-sm">
            <p className="text-c4c-petrol leading-relaxed text-lg mb-6">
              Create bespoke questions that go through a quick approval process before joining your
              survey.
            </p>

            <div className="bg-gradient-to-br from-c4c-grey-bg to-white rounded-xl border border-c4c-rule p-6">
              <h4 className="font-bold text-black mb-6 text-lg flex items-center gap-2">
                <MessageSquarePlus className="h-6 w-6 text-c4c-petrol" />
                Bespoke Question Workflow
              </h4>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-c4c-petrol text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="w-0.5 h-full bg-c4c-rule mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-lg p-4 border border-c4c-rule">
                      <h5 className="font-semibold text-black mb-2">Create Your Question</h5>
                      <p className="text-sm text-c4c-petrol mb-3">
                        Write the text, choose the type, and add any options needed.
                      </p>
                      <div className="bg-c4c-grey-bg rounded p-3">
                        <p className="text-xs text-black font-medium">Example:</p>
                        <p className="text-sm text-c4c-petrol italic mt-1">
                          &quot;How has this programme affected your confidence in managing daily life
                          independently?&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-c4c-petrol text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-c4c-rule mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-lg p-4 border border-c4c-rule">
                      <h5 className="font-semibold text-black mb-2">Approval</h5>
                      <p className="text-sm text-c4c-petrol">
                        A project manager or creator reviews it for clarity and fit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-c4c-petrol text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-lg p-4 border border-c4c-rule">
                      <h5 className="font-semibold text-black mb-2">Add to Survey</h5>
                      <p className="text-sm text-c4c-petrol">
                        Once approved, it&apos;s available across your project (and may be added to the
                        shared question library if it&apos;s broadly useful).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-c4c-tint-gold rounded-xl p-6 border border-c4c-yellow/20">
            <div className="flex items-start gap-4">
              <div className="bg-c4c-yellow rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-black mb-2">Best Practices</h5>
                <ul className="space-y-2 text-sm text-c4c-petrol">
                  {[
                    'Keep questions clear and concise',
                    'Avoid leading or biased language',
                    'Consider cultural sensitivity',
                    'Test with a small group first',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckSquare className="h-4 w-4 text-c4c-petrol mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Organise & Configure",
      subtitle: "Create a logical flow for your respondents",
      description: "Organise questions into sections, set required fields, and add instructions",
      icon: <CheckSquare className="h-16 w-16 text-c4c-petrol" />,
      bgGradient: "from-c4c-grey-bg via-c4c-grey-bg to-c4c-grey-bg",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-c4c-rule/20 shadow-sm">
            <p className="text-c4c-petrol leading-relaxed text-lg mb-6">
              Organise questions into sections, set required fields, and add instructions to guide
              people through your survey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-c4c-tint-cyan to-white rounded-lg p-5 border border-c4c-cobalt/20">
                <div className="bg-c4c-cobalt rounded-lg p-2 w-fit mb-3">
                  <Grid3x3 className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-black mb-2">Sections</h4>
                <p className="text-sm text-c4c-petrol">
                  Group related questions for easier navigation
                </p>
              </div>

              <div className="bg-gradient-to-br from-c4c-grey-bg to-white rounded-lg p-5 border border-c4c-rule/20">
                <div className="bg-c4c-petrol rounded-lg p-2 w-fit mb-3">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-black mb-2">Reordering</h4>
                <p className="text-sm text-c4c-petrol">
                  Drag and drop to create the right flow
                </p>
              </div>

              <div className="bg-gradient-to-br from-c4c-tint-sage to-white rounded-lg p-5 border border-c4c-sage/20">
                <div className="bg-c4c-sage rounded-lg p-2 w-fit mb-3">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-black mb-2">Customisation</h4>
                <p className="text-sm text-c4c-petrol">
                  Adjust question text and validation rules
                </p>
              </div>

              <div className="bg-gradient-to-br from-c4c-tint-sage to-white rounded-lg p-5 border border-c4c-sage/20">
                <div className="bg-c4c-sage rounded-lg p-2 w-fit mb-3">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-black mb-2">Categories</h4>
                <p className="text-sm text-c4c-petrol">
                  Tag surveys as baseline, monitoring, or evaluation
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-c4c-petrol to-c4c-petrol rounded-xl p-1">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-black mb-4 text-lg">
                  Also Configure
                </h4>
                <div className="space-y-3">
                  {[
                    'Which questions are required',
                    'Custom instructions for respondents',
                    'Estimated duration (calculated automatically)',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 p-3 bg-c4c-grey-bg rounded-lg">
                      <CheckSquare className="h-5 w-5 text-c4c-petrol mt-0.5 flex-shrink-0" />
                      <p className="font-medium text-black">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Add Translations",
      subtitle: "Reach the communities you work with, in their own language",
      description: "(optional)",
      icon: <Languages className="h-16 w-16 text-c4c-sage" />,
      bgGradient: "from-c4c-tint-sage via-c4c-grey-bg to-c4c-tint-sage",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-c4c-rule/20 shadow-sm">
            <p className="text-c4c-petrol leading-relaxed text-lg mb-6">
              Translations keep the same structure while adapting content appropriately — not just
              word-for-word.
            </p>

            <div className="bg-gradient-to-br from-c4c-tint-sage to-white rounded-xl border border-c4c-sage/20 p-6 mb-6">
              <h4 className="font-bold text-black mb-6 text-lg flex items-center gap-2">
                <Languages className="h-6 w-6 text-c4c-sage" />
                Translation Workflow
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Create Draft', 'Submit for Review', 'Get Approved', 'Publish'].map((label, i) => (
                  <div key={label} className="text-center">
                    <div className="bg-c4c-sage text-white rounded-full h-12 w-12 flex items-center justify-center font-bold mx-auto mb-3">
                      {i + 1}
                    </div>
                    <h5 className="font-semibold text-black mb-2">{label}</h5>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-c4c-grey-bg rounded-lg p-5 border border-c4c-rule/20">
                <div className="flex items-start gap-3">
                  <Languages className="h-5 w-5 text-c4c-petrol mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-black mb-2">Best Practices</h5>
                    <ul className="space-y-2 text-sm text-c4c-petrol">
                      {[
                        'Work with native speakers',
                        'Consider cultural context',
                        'Test with the local community',
                        'Keep meaning consistent',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-c4c-petrol mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-c4c-tint-sage rounded-lg p-5 border border-c4c-sage/20">
                <div className="flex items-start gap-3">
                  <CheckSquare className="h-5 w-5 text-c4c-sage mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-black mb-2">Example</h5>
                    <p className="text-sm text-c4c-petrol mb-3">
                      &quot;Life skills training&quot; might become a more locally familiar phrase
                      depending on context — the goal is clarity, not literal translation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-c4c-tint-gold rounded-xl p-6 border border-c4c-yellow/20">
            <div className="flex items-start gap-4">
              <div className="bg-c4c-yellow rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-black mb-2">Pro Tip</h5>
                <p className="text-sm text-c4c-petrol">
                  Where possible, have translations reviewed by more than one community member to
                  check clarity and appropriateness.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "You're Ready to Build!",
      subtitle: "You now understand the full survey-building process",
      description: "from selecting context through to publishing",
      icon: <PlayCircle className="h-16 w-16 text-c4c-petrol" />,
      bgGradient: "from-c4c-grey-bg via-c4c-tint-sage to-c4c-tint-sage",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-8 border border-c4c-rule/20 shadow-sm text-center">
            <div className="bg-c4c-sage rounded-full p-4 w-fit mx-auto mb-6">
              <CheckSquare className="h-12 w-12 text-white" />
            </div>

            <p className="text-c4c-petrol text-lg mb-8 max-w-2xl mx-auto">
              You can create clear, respectful surveys that keep people&apos;s data safe and help you
              understand what&apos;s really changing for the people you work with. Come back to this
              guide anytime from the help menu if you need a refresher.
            </p>

            <div className="bg-gradient-to-r from-c4c-grey-bg to-c4c-tint-sage rounded-xl p-6 border border-c4c-rule/20 mb-6">
              <h4 className="font-semibold text-black mb-4 text-lg">
                Choose Your Next Step
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                  <Button
                    size="lg"
                    className="w-full bg-c4c-coral text-black hover:bg-c4c-petrol hover:text-white"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Building Survey
                  </Button>
                </Link>
                <Link href={`/dashboard/project/${projectId}/surveys/templates`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-c4c-rule/30 text-c4c-petrol hover:bg-c4c-grey-bg"
                  >
                    <FileSearch className="h-5 w-5 mr-2" />
                    Browse Templates
                  </Button>
                </Link>
              </div>
            </div>

            <Link href={`/dashboard/project/${projectId}/surveys`}>
              <Button
                variant="ghost"
                className="text-c4c-petrol hover:text-black"
              >
                Skip to Survey Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-c4c-sage to-c4c-petrol rounded-xl p-1">
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-black mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-c4c-sage" />
                Quick Reference
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  'Select stakeholder group and stage first',
                  'Use filters to find relevant questions',
                  'Create bespoke questions when needed',
                  'Organise with sections for clarity',
                  'Add translations for accessibility',
                  'Test before publishing to stakeholders',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-c4c-sage mt-0.5 flex-shrink-0" />
                    <span className="text-c4c-petrol">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-rule mx-auto mb-4"></div>
            <p className="text-black font-medium">Loading guide...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      {/* Sidebar */}
      <ProjectSidebar
        projectId={projectId}
        projectName={project?.name || 'Project'}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-c4c-rule/20 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/dashboard/project/${projectId}/surveys`}
                className="flex items-center text-c4c-petrol hover:text-black transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back to Surveys</span>
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-black">Survey Builder</span>
                <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-c4c-rule/30 text-c4c-petrol hover:bg-c4c-grey-bg"
                  >
                    Skip Guide
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <Progress value={progress} className="h-1 rounded-none" />
        </div>

        {/* Content Area */}
        <div className="px-8 py-12">
          {/* Step Header */}
          <div className={`bg-gradient-to-br ${currentStepData.bgGradient} rounded-2xl p-8 mb-8 border border-c4c-rule/20`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="bg-white rounded-2xl p-6">
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-c4c-petrol mb-2">
                  {currentStepData.subtitle}
                </div>
                <h1 className="text-4xl font-bold text-black mb-2">
                  {currentStepData.title}
                </h1>
                <p className="text-lg text-c4c-petrol">
                  {currentStepData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-c4c-rule/20">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={isFirstStep}
              className="border-c4c-rule/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-c4c-petrol">
              Slide {currentStep + 1} of {steps.length}
            </div>

            {!isLastStep ? (
              <Button
                size="lg"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="bg-c4c-petrol hover:bg-black text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="w-[88px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilderIntroPage;
