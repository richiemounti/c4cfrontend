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
      icon: <Book className="h-16 w-16 text-neutral-500" />,
      bgGradient: "from-neutral-50 via-sage-50 to-sage-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-stone-500/20 shadow-sm">
            <p className="text-neutral-500 leading-relaxed text-lg mb-6">
              This module helps you create surveys that capture real change safely and clearly.
              Everything&apos;s grounded in your Theory of Change, so the questions you ask connect
              directly to the outcomes you&apos;re tracking.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-lg p-5 border border-neutral-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-neutral-500 rounded-lg p-2">
                    <CheckSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink-900 mb-1">Pre-curated Questions</h4>
                    <p className="text-sm text-neutral-500">
                      Aligned with recognised frameworks like the SDGs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-sage-50 rounded-lg p-5 border border-sage-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-sage-500 rounded-lg p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink-900 mb-1">Stakeholder-Specific</h4>
                    <p className="text-sm text-neutral-500">
                      Questions tailored to each group
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-sage-50 rounded-lg p-5 border border-sage-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-sage-500 rounded-lg p-2">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink-900 mb-1">Multi-Language Support</h4>
                    <p className="text-sm text-neutral-500">
                      Translate for the communities you work with
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gold-50 rounded-lg p-5 border border-gold-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-gold-500 rounded-lg p-2">
                    <MessageSquarePlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink-900 mb-1">Custom Questions</h4>
                    <p className="text-sm text-neutral-500">
                      Create bespoke ones when needed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-neutral-500 to-sage-500 rounded-xl p-1">
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-ink-900 mb-3 text-lg">
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
                  <li key={item} className="flex items-center gap-3 text-neutral-500">
                    <div className="bg-neutral-50 rounded-full p-1">
                      <CheckSquare className="h-4 w-4 text-neutral-500" />
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
      icon: <Users className="h-16 w-16 text-gold-500" />,
      bgGradient: "from-gold-50 via-coral-50 to-burgundy-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-stone-500/20 shadow-sm">
            <p className="text-neutral-500 leading-relaxed text-lg mb-6">
              Each survey targets one stakeholder group and one stage of your Theory of Change, so you
              collect exactly the data you need to check progress and understand impact.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gold-50 to-white rounded-xl border border-gold-500/20 p-6">
                <div className="bg-gold-500 rounded-lg p-3 w-fit mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-ink-900 mb-3 text-lg">Stakeholder Group</h4>
                <p className="text-neutral-500">
                  Who&apos;s taking this survey — community members, project staff, partner
                  organisations, or any group you&apos;ve defined.
                </p>
              </div>

              <div className="bg-gradient-to-br from-petrol-50 to-white rounded-xl border border-petrol-500/20 p-6">
                <div className="bg-petrol-500 rounded-lg p-3 w-fit mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-ink-900 mb-3 text-lg">Theory of Change Stage</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-petrol-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-petrol-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <p className="font-semibold text-ink-900">Stage 1 — Actions</p>
                    </div>
                    <p className="text-sm text-neutral-500">
                      Are your planned activities achieving the outputs you intended?
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-petrol-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-petrol-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <p className="font-semibold text-ink-900">Stage 2 — Outcomes</p>
                    </div>
                    <p className="text-sm text-neutral-500">
                      Are stakeholders experiencing the change you set out to create?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-500/20">
            <div className="flex items-start gap-4">
              <div className="bg-neutral-500 rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-ink-900 mb-2">Smart Filtering</h5>
                <p className="text-neutral-500 text-sm">
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
      icon: <FileSearch className="h-16 w-16 text-sage-500" />,
      bgGradient: "from-sage-50 via-petrol-50 to-neutral-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-stone-500/20 shadow-sm">
            <p className="text-neutral-500 leading-relaxed text-lg mb-6">
              Questions link directly to your Theory of Change sub-themes, and can also be browsed by
              framework (like the SDGs) or theme. Filter, search, and preview before adding anything to
              your survey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-sage-50 to-white rounded-lg p-5 border border-sage-500/20">
                <div className="bg-sage-500 rounded-lg p-2 w-fit mb-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-ink-900 mb-2">Stakeholder-Specific</h4>
                <p className="text-sm text-neutral-500">
                  Questions designed for your selected group
                </p>
              </div>

              <div className="bg-gradient-to-br from-sage-50 to-white rounded-lg p-5 border border-sage-500/20">
                <div className="bg-sage-500 rounded-lg p-2 w-fit mb-3">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-ink-900 mb-2">Frequently Asked</h4>
                <p className="text-sm text-neutral-500">
                  Common questions used across similar projects
                </p>
              </div>

              <div className="bg-gradient-to-br from-neutral-50 to-white rounded-lg p-5 border border-neutral-500/20">
                <div className="bg-neutral-500 rounded-lg p-2 w-fit mb-3">
                  <FileSearch className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-ink-900 mb-2">Compare Groups</h4>
                <p className="text-sm text-neutral-500">
                  Filter responses by different stakeholder groups
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sage-500 to-petrol-500 rounded-xl p-1">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-ink-900 mb-4 text-lg">
                  Browse Questions By
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-sage-50 rounded-lg p-2">
                      <Grid3x3 className="h-5 w-5 text-sage-500" />
                    </div>
                    <p className="font-medium text-ink-900">Themes & sub-themes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-neutral-50 rounded-lg p-2">
                      <Search className="h-5 w-5 text-neutral-500" />
                    </div>
                    <p className="font-medium text-ink-900">Text search</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-sage-50 rounded-lg p-2">
                      <CheckSquare className="h-5 w-5 text-sage-500" />
                    </div>
                    <p className="font-medium text-ink-900">Framework tags</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-gold-50 rounded-lg p-2">
                      <Settings className="h-5 w-5 text-gold-500" />
                    </div>
                    <p className="font-medium text-ink-900">Question type</p>
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
      icon: <MessageSquarePlus className="h-16 w-16 text-coral-500" />,
      bgGradient: "from-coral-50 via-burgundy-50 to-gold-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-stone-500/20 shadow-sm">
            <p className="text-neutral-500 leading-relaxed text-lg mb-6">
              Create bespoke questions that go through a quick approval process before joining your
              survey.
            </p>

            <div className="bg-gradient-to-br from-coral-50 to-white rounded-xl border border-coral-500/20 p-6">
              <h4 className="font-bold text-ink-900 mb-6 text-lg flex items-center gap-2">
                <MessageSquarePlus className="h-6 w-6 text-coral-500" />
                Bespoke Question Workflow
              </h4>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-coral-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="w-0.5 h-full bg-coral-500/20 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-lg p-4 border border-coral-500/20">
                      <h5 className="font-semibold text-ink-900 mb-2">Create Your Question</h5>
                      <p className="text-sm text-neutral-500 mb-3">
                        Write the text, choose the type, and add any options needed.
                      </p>
                      <div className="bg-coral-50 rounded p-3">
                        <p className="text-xs text-coral-900 font-medium">Example:</p>
                        <p className="text-sm text-neutral-500 italic mt-1">
                          &quot;How has this programme affected your confidence in managing daily life
                          independently?&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-coral-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-coral-500/20 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-lg p-4 border border-coral-500/20">
                      <h5 className="font-semibold text-ink-900 mb-2">Approval</h5>
                      <p className="text-sm text-neutral-500">
                        A project manager or creator reviews it for clarity and fit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-coral-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-lg p-4 border border-coral-500/20">
                      <h5 className="font-semibold text-ink-900 mb-2">Add to Survey</h5>
                      <p className="text-sm text-neutral-500">
                        Once approved, it&apos;s available across your project (and may be added to the
                        shared question library if it&apos;s broadly useful).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gold-50 rounded-xl p-6 border border-gold-500/20">
            <div className="flex items-start gap-4">
              <div className="bg-gold-500 rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-ink-900 mb-2">Best Practices</h5>
                <ul className="space-y-2 text-sm text-neutral-500">
                  {[
                    'Keep questions clear and concise',
                    'Avoid leading or biased language',
                    'Consider cultural sensitivity',
                    'Test with a small group first',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckSquare className="h-4 w-4 text-gold-500 mt-0.5 flex-shrink-0" />
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
      icon: <CheckSquare className="h-16 w-16 text-burgundy-500" />,
      bgGradient: "from-burgundy-50 via-stone-50 to-ink-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-stone-500/20 shadow-sm">
            <p className="text-neutral-500 leading-relaxed text-lg mb-6">
              Organise questions into sections, set required fields, and add instructions to guide
              people through your survey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-burgundy-50 to-white rounded-lg p-5 border border-burgundy-500/20">
                <div className="bg-burgundy-500 rounded-lg p-2 w-fit mb-3">
                  <Grid3x3 className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-ink-900 mb-2">Sections</h4>
                <p className="text-sm text-neutral-500">
                  Group related questions for easier navigation
                </p>
              </div>

              <div className="bg-gradient-to-br from-neutral-50 to-white rounded-lg p-5 border border-neutral-500/20">
                <div className="bg-neutral-500 rounded-lg p-2 w-fit mb-3">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-ink-900 mb-2">Reordering</h4>
                <p className="text-sm text-neutral-500">
                  Drag and drop to create the right flow
                </p>
              </div>

              <div className="bg-gradient-to-br from-sage-50 to-white rounded-lg p-5 border border-sage-500/20">
                <div className="bg-sage-500 rounded-lg p-2 w-fit mb-3">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-ink-900 mb-2">Customisation</h4>
                <p className="text-sm text-neutral-500">
                  Adjust question text and validation rules
                </p>
              </div>

              <div className="bg-gradient-to-br from-sage-50 to-white rounded-lg p-5 border border-sage-500/20">
                <div className="bg-sage-500 rounded-lg p-2 w-fit mb-3">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-ink-900 mb-2">Categories</h4>
                <p className="text-sm text-neutral-500">
                  Tag surveys as baseline, monitoring, or evaluation
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-burgundy-500 to-petrol-500 rounded-xl p-1">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-ink-900 mb-4 text-lg">
                  Also Configure
                </h4>
                <div className="space-y-3">
                  {[
                    'Which questions are required',
                    'Custom instructions for respondents',
                    'Estimated duration (calculated automatically)',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 p-3 bg-ink-50 rounded-lg">
                      <CheckSquare className="h-5 w-5 text-burgundy-500 mt-0.5 flex-shrink-0" />
                      <p className="font-medium text-ink-900">{item}</p>
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
      icon: <Languages className="h-16 w-16 text-sage-500" />,
      bgGradient: "from-sage-50 via-neutral-50 to-sage-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-stone-500/20 shadow-sm">
            <p className="text-neutral-500 leading-relaxed text-lg mb-6">
              Translations keep the same structure while adapting content appropriately — not just
              word-for-word.
            </p>

            <div className="bg-gradient-to-br from-sage-50 to-white rounded-xl border border-sage-500/20 p-6 mb-6">
              <h4 className="font-bold text-ink-900 mb-6 text-lg flex items-center gap-2">
                <Languages className="h-6 w-6 text-sage-500" />
                Translation Workflow
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Create Draft', 'Submit for Review', 'Get Approved', 'Publish'].map((label, i) => (
                  <div key={label} className="text-center">
                    <div className="bg-sage-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold mx-auto mb-3">
                      {i + 1}
                    </div>
                    <h5 className="font-semibold text-ink-900 mb-2">{label}</h5>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 rounded-lg p-5 border border-neutral-500/20">
                <div className="flex items-start gap-3">
                  <Languages className="h-5 w-5 text-neutral-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-ink-900 mb-2">Best Practices</h5>
                    <ul className="space-y-2 text-sm text-neutral-500">
                      {[
                        'Work with native speakers',
                        'Consider cultural context',
                        'Test with the local community',
                        'Keep meaning consistent',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-neutral-500 mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-sage-50 rounded-lg p-5 border border-sage-500/20">
                <div className="flex items-start gap-3">
                  <CheckSquare className="h-5 w-5 text-sage-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-ink-900 mb-2">Example</h5>
                    <p className="text-sm text-neutral-500 mb-3">
                      &quot;Life skills training&quot; might become a more locally familiar phrase
                      depending on context — the goal is clarity, not literal translation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gold-50 rounded-xl p-6 border border-gold-500/20">
            <div className="flex items-start gap-4">
              <div className="bg-gold-500 rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-ink-900 mb-2">Pro Tip</h5>
                <p className="text-sm text-neutral-500">
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
      icon: <PlayCircle className="h-16 w-16 text-neutral-500" />,
      bgGradient: "from-neutral-50 via-sage-50 to-sage-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-8 border border-stone-500/20 shadow-sm text-center">
            <div className="bg-sage-500 rounded-full p-4 w-fit mx-auto mb-6">
              <CheckSquare className="h-12 w-12 text-white" />
            </div>

            <p className="text-neutral-500 text-lg mb-8 max-w-2xl mx-auto">
              You can create clear, respectful surveys that keep people&apos;s data safe and help you
              understand what&apos;s really changing for the people you work with. Come back to this
              guide anytime from the help menu if you need a refresher.
            </p>

            <div className="bg-gradient-to-r from-neutral-50 to-sage-50 rounded-xl p-6 border border-neutral-500/20 mb-6">
              <h4 className="font-semibold text-ink-900 mb-4 text-lg">
                Choose Your Next Step
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                  <Button
                    size="lg"
                    className="w-full bg-neutral-500 hover:bg-neutral-600 text-white shadow-lg shadow-neutral-500/20"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Building Survey
                  </Button>
                </Link>
                <Link href={`/dashboard/project/${projectId}/surveys/templates`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-neutral-500/30 text-neutral-500 hover:bg-neutral-50"
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
                className="text-neutral-500 hover:text-ink-900"
              >
                Skip to Survey Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-sage-500 to-petrol-500 rounded-xl p-1">
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sage-500" />
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
                    <CheckSquare className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-500">{item}</span>
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
      <div className="flex min-h-screen bg-ink-50">
        <ProjectSidebar
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-500 mx-auto mb-4"></div>
            <p className="text-ink-900 font-medium">Loading guide...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Sidebar */}
      <ProjectSidebar
        projectId={projectId}
        projectName={project?.name || 'Project'}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-stone-500/20 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/dashboard/project/${projectId}/surveys`}
                className="flex items-center text-neutral-500 hover:text-ink-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back to Surveys</span>
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-ink-900">Survey Builder</span>
                <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-neutral-500/30 text-neutral-500 hover:bg-neutral-50"
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
          <div className={`bg-gradient-to-br ${currentStepData.bgGradient} rounded-2xl p-8 mb-8 border border-stone-500/20`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-500 mb-2">
                  {currentStepData.subtitle}
                </div>
                <h1 className="text-4xl font-bold text-ink-900 mb-2">
                  {currentStepData.title}
                </h1>
                <p className="text-lg text-neutral-500">
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
          <div className="flex items-center justify-between pt-8 border-t border-stone-500/20">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={isFirstStep}
              className="border-stone-500/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-neutral-500">
              Slide {currentStep + 1} of {steps.length}
            </div>

            {!isLastStep ? (
              <Button
                size="lg"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="bg-neutral-500 hover:bg-neutral-600 text-white shadow-lg shadow-neutral-500/20"
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
