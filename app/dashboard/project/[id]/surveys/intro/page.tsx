// app/dashboard/project/[id]/surveys/intro/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Book
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // Fetch project data
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
      subtitle: "Build Professional, Human Centred Surveys",
      description: "Create surveys tailored to your stakeholder groups that will enable you to understand what's changing",
      icon: <Book className="h-16 w-16 text-sky-500" />,
      bgGradient: "from-sky-50 via-grass-50 to-grass-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-concrete-500/20 shadow-sm">
            <p className="text-sky-500 leading-relaxed text-lg mb-6">
              The Survey Builder helps you create surveys that track your compliance with the carbon standards and understand what is changing for your stakeholders. 
              Our intelligent system guides you through the entire process, making data collection easier and safer than ever.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50 rounded-lg p-5 border border-sky-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-sky-500 rounded-lg p-2">
                    <CheckSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stratosphere-900 mb-1">Pre-curated Questions</h4>
                    <p className="text-sm text-sky-500">
                      Aligned with VCM standards and the SDG and ESG frameworks
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-grass-50 rounded-lg p-5 border border-grass-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-grass-500 rounded-lg p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stratosphere-900 mb-1">Stakeholder-Specific</h4>
                    <p className="text-sm text-sky-500">
                      Questions tailored to each stakeholder group
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-grass-50 rounded-lg p-5 border border-grass-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-grass-500 rounded-lg p-2">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stratosphere-900 mb-1">Multi-Language Support</h4>
                    <p className="text-sm text-sky-500">
                      Translate surveys for diverse communities
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-ochre-50 rounded-lg p-5 border border-ochre-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-ochre-500 rounded-lg p-2">
                    <MessageSquarePlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stratosphere-900 mb-1">Custom Questions</h4>
                    <p className="text-sm text-sky-500">
                      Create bespoke questions when needed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-500 to-grass-500 rounded-xl p-1">
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere-900 mb-3 text-lg">
                What You'll Learn in This Guide
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sky-500">
                  <div className="bg-sky-50 rounded-full p-1">
                    <CheckSquare className="h-4 w-4 text-sky-500" />
                  </div>
                  How to select the right context for your survey
                </li>
                <li className="flex items-center gap-3 text-sky-500">
                  <div className="bg-sky-50 rounded-full p-1">
                    <CheckSquare className="h-4 w-4 text-sky-500" />
                  </div>
                  Browse and filter from our curated question library
                </li>
                <li className="flex items-center gap-3 text-sky-500">
                  <div className="bg-sky-50 rounded-full p-1">
                    <CheckSquare className="h-4 w-4 text-sky-500" />
                  </div>
                  Create custom questions
                </li>
                <li className="flex items-center gap-3 text-sky-500">
                  <div className="bg-sky-50 rounded-full p-1">
                    <CheckSquare className="h-4 w-4 text-sky-500" />
                  </div>
                  Organize questions into logical sections
                </li>
                <li className="flex items-center gap-3 text-sky-500">
                  <div className="bg-sky-50 rounded-full p-1">
                    <CheckSquare className="h-4 w-4 text-sky-500" />
                  </div>
                  Add translations for accessibility
                </li>
                <li className="flex items-center gap-3 text-sky-500">
                  <div className="bg-sky-50 rounded-full p-1">
                    <CheckSquare className="h-4 w-4 text-sky-500" />
                  </div>
                  Schedule surveys to build your data collection calendar.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 1: Select Your Context",
      subtitle: "Choose Stakeholder Group & Project Stage",
      description: "Every survey is designed for a specific audience within your Theory of Change",
      icon: <Users className="h-16 w-16 text-ochre-500" />,
      bgGradient: "from-ochre-50 via-sand-50 to-clay-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-concrete-500/20 shadow-sm">
            <p className="text-sky-500 leading-relaxed text-lg mb-6">
              Each survey targets one stakeholder group, one Theory of Change assumption, and one indicator, so you collect the data needed to check progress and impact on stakeholders.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-ochre-50 to-white rounded-xl border border-ochre-500/20 p-6">
                <div className="bg-ochre-500 rounded-lg p-3 w-fit mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-stratosphere-900 mb-3 text-lg">Stakeholder Group</h4>
                <p className="text-sky-500 mb-4">
                  Select who will be taking this survey - community members, project staff, 
                  local authorities, or other stakeholder groups you've defined.
                </p>
                <div className="bg-white rounded-lg p-4 border border-ochre-500/10">
                  <p className="text-sm text-sky-500 font-medium mb-2">Examples:</p>
                  <ul className="space-y-2 text-sm text-sky-500">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-ochre-500" />
                      Local Community Members
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-ochre-500" />
                      Project Implementation Staff
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-ochre-500" />
                      Local Government Officials
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-ochre-500" />
                      Partner Organizations
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-forest-50 to-white rounded-xl border border-forest-500/20 p-6">
                <div className="bg-forest-500 rounded-lg p-3 w-fit mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-stratosphere-900 mb-3 text-lg">Theory of Change Stage</h4>
                <p className="text-sky-500 mb-4">
                  Choose the stage - process indicators and outputs (stage 1) our outcome monitoring (Stage 2)
                </p>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-forest-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-forest-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <p className="font-semibold text-stratosphere-900">Stage 1 - Output</p>
                    </div>
                    <p className="text-sm text-sky-500">
                      Are the activities you planned achieving the outputs you intended?
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-forest-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-forest-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <p className="font-semibold text-stratosphere-900">Stage 2 - Outcome</p>
                    </div>
                    <p className="text-sm text-sky-500">
                      Are communities benefitting from the carbon revenue in a way that enhances their wellbeing?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 rounded-xl p-6 border border-sky-500/20">
            <div className="flex items-start gap-4">
              <div className="bg-sky-500 rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-stratosphere-900 mb-2">Smart Filtering</h5>
                <p className="text-sky-500 text-sm">
                  Once you select your context, our system automatically filters the question library 
                  to show only relevant questions for that specific stakeholder group and stage combination.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Browse & Select Questions",
      subtitle: "Choose from Our Curated Question Library",
      description: "Search, filter, and preview questions before adding them to your survey",
      icon: <FileSearch className="h-16 w-16 text-grass-500" />,
      bgGradient: "from-grass-50 via-forest-50 to-sky-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-concrete-500/20 shadow-sm">
            <p className="text-sky-500 leading-relaxed text-lg mb-6">
              Our questions library are linked to your Theory of Change sub-themes and indicators, and can also be browsed by SDGs, ESG, or resilience. You can filter, search, and preview questions before adding them to a survey.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-grass-50 to-white rounded-lg p-5 border border-grass-500/20">
                <div className="bg-grass-500 rounded-lg p-2 w-fit mb-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-stratosphere-900 mb-2">Stakeholder-Specific</h4>
                <p className="text-sm text-sky-500">
                  Questions designed specifically for your selected stakeholder group
                </p>
              </div>

              <div className="bg-gradient-to-br from-grass-50 to-white rounded-lg p-5 border border-grass-500/20">
                <div className="bg-grass-500 rounded-lg p-2 w-fit mb-3">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-stratosphere-900 mb-2">Frequently Asked</h4>
                <p className="text-sm text-sky-500">
                  Common questions used across similar projects
                </p>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-white rounded-lg p-5 border border-sky-500/20">
                <div className="bg-sky-500 rounded-lg p-2 w-fit mb-3">
                  <FileSearch className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-stratosphere-900 mb-2">Compare Groups</h4>
                <p className="text-sm text-sky-500">
                  Enable you to filter your survey responses by different groups
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-grass-500 to-forest-500 rounded-xl p-1">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-stratosphere-900 mb-4 text-lg">
                  Browse Questions By:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-grass-50 rounded-lg p-2">
                      <Grid3x3 className="h-5 w-5 text-grass-500" />
                    </div>
                    <div>
                      <p className="font-medium text-stratosphere-900 mb-1">Themes & Sub-themes</p>
                      <p className="text-sm text-sky-500">
                        Organized into logical categories like environment, social impact, governance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-sky-50 rounded-lg p-2">
                      <CheckSquare className="h-5 w-5 text-sky-500" />
                    </div>
                    <div>
                      <p className="font-medium text-stratosphere-900 mb-1">Framework Tags</p>
                      <p className="text-sm text-sky-500">
                        Filter by SDGs, ESG categories, resilience dimensions, and VCM standards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-grass-50 rounded-lg p-2">
                      <Search className="h-5 w-5 text-grass-500" />
                    </div>
                    <div>
                      <p className="font-medium text-stratosphere-900 mb-1">Text Search</p>
                      <p className="text-sm text-sky-500">
                        Search for specific keywords or concepts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-ochre-50 rounded-lg p-2">
                      <Settings className="h-5 w-5 text-ochre-500" />
                    </div>
                    <div>
                      <p className="font-medium text-stratosphere-900 mb-1">Question Type</p>
                      <p className="text-sm text-sky-500">
                        Multiple choice, text, rating scales, files, location etc.
                      </p>
                    </div>
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
      subtitle: "Create Bespoke Questions (Optional)",
      description: "Sometimes you need to ask something specific to your project",
      icon: <MessageSquarePlus className="h-16 w-16 text-sand-500" />,
      bgGradient: "from-sand-50 via-clay-50 to-ochre-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-concrete-500/20 shadow-sm">
            <p className="text-sky-500 leading-relaxed text-lg mb-6">
              Sometimes you need to ask something specific to your project. You can create bespoke questions 
              that go through an approval workflow before being added to your survey.
            </p>
            
            <div className="bg-gradient-to-br from-sand-50 to-white rounded-xl border border-sand-500/20 p-6">
              <h4 className="font-bold text-stratosphere-900 mb-6 text-lg flex items-center gap-2">
                <MessageSquarePlus className="h-6 w-6 text-sand-500" />
                Bespoke Question Workflow
              </h4>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-sand-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="w-0.5 h-full bg-sand-500/20 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-lg p-4 border border-sand-500/20">
                      <h5 className="font-semibold text-stratosphere-900 mb-2">Create Your Question</h5>
                      <p className="text-sm text-sky-500 mb-3">
                        Write the question text, select the type (multiple choice, text, rating, etc.), 
                        and add any options or validation rules needed.
                      </p>
                      <div className="bg-sand-50 rounded p-3">
                        <p className="text-xs text-sand-900 font-medium">Example:</p>
                        <p className="text-sm text-sky-500 italic mt-1">
                          "How has the carbon offset project affected your household's access to clean water?"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-sand-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="w-0.5 h-full bg-sand-500/20 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white rounded-lg p-4 border border-sand-500/20">
                      <h5 className="font-semibold text-stratosphere-900 mb-2">Approval Process</h5>
                      <p className="text-sm text-sky-500 mb-3">
                        Project managers or creators review your question for quality, clarity, 
                        and alignment with project goals.
                      </p>
                      <div className="flex gap-2">
                        <div className="bg-grass-50 border border-grass-500/20 rounded px-3 py-1 text-xs text-grass-500 font-medium">
                          ✓ Approved
                        </div>
                        <div className="bg-ochre-50 border border-ochre-500/20 rounded px-3 py-1 text-xs text-ochre-500 font-medium">
                          ⚠ Needs Revision
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="bg-sand-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-lg p-4 border border-sand-500/20">
                      <h5 className="font-semibold text-stratosphere-900 mb-2">Add to Survey</h5>
                      <p className="text-sm text-sky-500">
                        Once approved, your bespoke question becomes available to add to any survey 
                        in your project. It can also be elevated to the global question library by 
                        ConnectGo staff if it's particularly useful.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-ochre-50 rounded-xl p-6 border border-ochre-500/20">
            <div className="flex items-start gap-4">
              <div className="bg-ochre-500 rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-stratosphere-900 mb-2">Best Practices</h5>
                <ul className="space-y-2 text-sm text-sky-500">
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-ochre-500 mt-0.5 flex-shrink-0" />
                    Keep questions clear and concise
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-ochre-500 mt-0.5 flex-shrink-0" />
                    Avoid leading or biased language
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-ochre-500 mt-0.5 flex-shrink-0" />
                    Consider cultural sensitivity
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-ochre-500 mt-0.5 flex-shrink-0" />
                    Test with a small group first
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Organise & Configure",
      subtitle: "Structure Your Survey",
      description: "Create logical flow with sections, ordering, and customisation",
      icon: <CheckSquare className="h-16 w-16 text-clay-500" />,
      bgGradient: "from-clay-50 via-concrete-50 to-stratosphere-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-concrete-500/20 shadow-sm">
            <p className="text-sky-500 leading-relaxed text-lg mb-6">
              Create a logical flow within your survey for your respondents by organising questions into sections, 
              setting required fields, and adding custom instructions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-clay-50 to-white rounded-lg p-5 border border-clay-500/20">
                <div className="bg-clay-500 rounded-lg p-2 w-fit mb-3">
                  <Grid3x3 className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-stratosphere-900 mb-2">Sections</h4>
                <p className="text-sm text-sky-500">
                  Group related questions together for better organisation and easier navigation
                </p>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-white rounded-lg p-5 border border-sky-500/20">
                <div className="bg-sky-500 rounded-lg p-2 w-fit mb-3">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-stratosphere-900 mb-2">Reordering</h4>
                <p className="text-sm text-sky-500">
                  Drag and drop questions to create the perfect flow for your respondents
                </p>
              </div>

              <div className="bg-gradient-to-br from-grass-50 to-white rounded-lg p-5 border border-grass-500/20">
                <div className="bg-grass-500 rounded-lg p-2 w-fit mb-3">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-stratosphere-900 mb-2">Customisation</h4>
                <p className="text-sm text-sky-500">
                  Modify question text, add context, and set validation rules as needed
                </p>
              </div>

              <div className="bg-gradient-to-br from-grass-50 to-white rounded-lg p-5 border border-grass-500/20">
                <div className="bg-grass-500 rounded-lg p-2 w-fit mb-3">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-stratosphere-900 mb-2">Categories</h4>
                <p className="text-sm text-sky-500">
                  Tag surveys as baseline, monitoring, evaluation, or custom categories
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-clay-500 to-forest-500 rounded-xl p-1">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-stratosphere-900 mb-4 text-lg">
                  Survey Configuration Options
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-stratosphere-50 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-clay-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-stratosphere-900 mb-1">Required vs Optional</p>
                      <p className="text-sm text-sky-500">
                        Mark which questions must be answered before submission
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-stratosphere-50 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-clay-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-stratosphere-900 mb-1">Custom Instructions</p>
                      <p className="text-sm text-sky-500">
                        Add context or examples to help respondents understand the question
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-stratosphere-50 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-clay-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-stratosphere-900 mb-1">Estimated Duration of the Survey</p>
                      <p className="text-sm text-sky-500">
                        Automatically calculated based on number and type of questions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Add Translations",
      subtitle: "Make Your Survey Accessible (Optional)",
      description: "Reach diverse communities with multi-language support",
      icon: <Languages className="h-16 w-16 text-grass-500" />,
      bgGradient: "from-grass-50 via-sky-50 to-grass-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-concrete-500/20 shadow-sm">
            <p className="text-sky-500 leading-relaxed text-lg mb-6">
              Reach diverse communities by translating your survey into local languages. 
              Translations maintain the same structure while adapting content appropriately.
            </p>
            
            <div className="bg-gradient-to-br from-grass-50 to-white rounded-xl border border-grass-500/20 p-6 mb-6">
              <h4 className="font-bold text-stratosphere-900 mb-6 text-lg flex items-center gap-2">
                <Languages className="h-6 w-6 text-grass-500" />
                Translation Workflow
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-grass-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold mx-auto mb-3">
                    1
                  </div>
                  <h5 className="font-semibold text-stratosphere-900 mb-2">Create Draft</h5>
                  <p className="text-sm text-sky-500">
                    Start translating survey content
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-grass-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold mx-auto mb-3">
                    2
                  </div>
                  <h5 className="font-semibold text-stratosphere-900 mb-2">Submit Review</h5>
                  <p className="text-sm text-sky-500">
                    Send to language expert
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-grass-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold mx-auto mb-3">
                    3
                  </div>
                  <h5 className="font-semibold text-stratosphere-900 mb-2">Get Approved</h5>
                  <p className="text-sm text-sky-500">
                    Quality check complete
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-grass-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold mx-auto mb-3">
                    4
                  </div>
                  <h5 className="font-semibold text-stratosphere-900 mb-2">Publish</h5>
                  <p className="text-sm text-sky-500">
                    Available to respondents
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sky-50 rounded-lg p-5 border border-sky-500/20">
                <div className="flex items-start gap-3">
                  <Languages className="h-5 w-5 text-sky-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-stratosphere-900 mb-2">Translation Best Practices</h5>
                    <ul className="space-y-2 text-sm text-sky-500">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                        Work with native speakers
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                        Consider cultural context
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                        Test with local community
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                        Keep meaning consistent
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-grass-50 rounded-lg p-5 border border-grass-500/20">
                <div className="flex items-start gap-3">
                  <CheckSquare className="h-5 w-5 text-grass-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-stratosphere-900 mb-2">Cultural Adaptation</h5>
                    <p className="text-sm text-sky-500 mb-3">
                      Beyond word-for-word translation, adapt questions to be culturally appropriate 
                      while maintaining their core meaning and intent.
                    </p>
                    <div className="bg-white rounded p-3 border border-grass-500/10">
                      <p className="text-xs text-grass-900 font-medium mb-1">Example:</p>
                      <p className="text-xs text-sky-500">
                        "Agricultural practices" might become "farming methods" or "cultivation techniques" 
                        depending on local terminology
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-ochre-50 rounded-xl p-6 border border-ochre-500/20">
            <div className="flex items-start gap-4">
              <div className="bg-ochre-500 rounded-lg p-2 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-stratosphere-900 mb-2">Pro Tip</h5>
                <p className="text-sm text-sky-500">
                  Work with local translators who understand both the language and the cultural context 
                  of your project area for best results. Consider having translations reviewed by multiple 
                  community members to ensure clarity and appropriateness.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "You're Ready to Build!",
      subtitle: "Start Creating Your Survey",
      description: "You now understand the complete survey building process",
      icon: <PlayCircle className="h-16 w-16 text-sky-500" />,
      bgGradient: "from-sky-50 via-grass-50 to-grass-50",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-8 border border-concrete-500/20 shadow-sm text-center">
            <div className="bg-grass-500 rounded-full p-4 w-fit mx-auto mb-6">
              <CheckSquare className="h-12 w-12 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-stratosphere-900 mb-3">
              Congratulations!
            </h3>
            <p className="text-sky-500 text-lg mb-8 max-w-2xl mx-auto">
              You now understand how to create professional, human centered surveys for your carbon sector projects. 
              Remember, you can always return to this guide from the help menu if you need a refresher.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-sky-50 rounded-lg p-4 border border-sky-500/20">
                <div className="text-3xl font-bold text-sky-500 mb-1">5</div>
                <p className="text-sm text-sky-500">Steps Covered</p>
              </div>
              <div className="bg-grass-50 rounded-lg p-4 border border-grass-500/20">
                <div className="text-3xl font-bold text-grass-500 mb-1">∞</div>
                <p className="text-sm text-sky-500">Survey Possibilities</p>
              </div>
              <div className="bg-grass-50 rounded-lg p-4 border border-grass-500/20">
                <div className="text-3xl font-bold text-grass-500 mb-1">100%</div>
                <p className="text-sm text-sky-500">GDPR Compliant</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-50 to-grass-50 rounded-xl p-6 border border-sky-500/20 mb-6">
              <h4 className="font-semibold text-stratosphere-900 mb-4 text-lg">
                Choose Your Next Step
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                  <Button 
                    size="lg"
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Building Survey
                  </Button>
                </Link>
                <Link href={`/dashboard/project/${projectId}/surveys/templates`}>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="w-full border-sky-500/30 text-sky-500 hover:bg-sky-50"
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
                className="text-sky-500 hover:text-stratosphere-900"
              >
                Skip to Survey Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-grass-500 to-forest-500 rounded-xl p-1">
            <div className="bg-white rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-grass-500" />
                Quick Reference
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 text-grass-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sky-500">Select stakeholder group & stage first</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 text-grass-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sky-500">Use filters to find relevant questions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 text-grass-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sky-500">Create bespoke questions when needed</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 text-grass-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sky-500">Organize with sections for clarity</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 text-grass-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sky-500">Add translations for accessibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckSquare className="h-4 w-4 text-grass-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sky-500">Test before publishing to stakeholders</span>
                </div>
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
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-stratosphere-900 font-medium">Loading guide...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stratosphere-50">
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={projectId}
        projectName={project?.name || 'Project'}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-concrete-500/20 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <Link 
                href={`/dashboard/project/${projectId}/surveys`}
                className="flex items-center text-sky-500 hover:text-stratosphere-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back to Surveys</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-sky-500">
                  Slide {currentStep + 1} of {steps.length}
                </div>
                <Link href={`/dashboard/project/${projectId}/surveys/builder`}>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
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
          <div className={`bg-gradient-to-br ${currentStepData.bgGradient} rounded-2xl p-8 mb-8 border border-concrete-500/20`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-sky-500 mb-2">
                  {currentStepData.subtitle}
                </div>
                <h1 className="text-4xl font-bold text-stratosphere-900 mb-2">
                  {currentStepData.title}
                </h1>
                <p className="text-lg text-sky-500">
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
          <div className="flex items-center justify-between pt-8 border-t border-concrete-500/20">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={isFirstStep}
              className="border-concrete-500/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {!isLastStep && (
              <Button
                size="lg"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20"
              >
                Next Slide
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilderIntroPage;