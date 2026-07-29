// app/dashboard/project/[id]/theory-of-change/guide/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  Target,
  MapPin,
  ClipboardList,
  ShieldCheck,
  PlayCircle,
  CheckSquare,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getProject } from '@/lib/api/project';

interface PageParams {
  id: string;
}

type GuideBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'checklist'; items: string[] }
  | { type: 'steps'; items: { title: string; description: string }[] };

interface GuideSlide {
  label: string;
  heading: string;
  icon: JSX.Element;
  bgGradient: string;
  blocks: GuideBlock[];
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    label: 'Slide 1 — Welcome',
    heading: 'Welcome to your Theory of Change Guide',
    icon: <GitBranch className="h-16 w-16 text-forest-500" />,
    bgGradient: 'from-forest-50 via-sky-50 to-grass-50',
    blocks: [
      {
        type: 'paragraph',
        text: "Map the pathway from what you do to what changes for the people you work with — and build in the evidence to test whether it's actually working.",
      },
      { type: 'subheading', text: 'A Theory of Change helps you:' },
      {
        type: 'bullets',
        items: [
          'Set out a clear pathway from your actions to the change you\'re aiming for',
          'Make sure your team and your stakeholders are working from the same understanding',
          'Spot risks and unintended consequences early',
          "Build the framework you'll use to track progress and learn what's actually happening",
        ],
      },
      { type: 'subheading', text: "What you'll learn in this guide" },
      {
        type: 'checklist',
        items: [
          'The two stages — Actions and Outcomes — and how they connect',
          'How to choose the right working scope for this exercise',
          'What to define at each stage',
          'How this feeds into surveys and results later on',
        ],
      },
    ],
  },
  {
    label: 'Slide 2 — The Two Stages',
    heading: 'Two stages, one pathway — built with your stakeholders',
    icon: <Target className="h-16 w-16 text-sky-500" />,
    bgGradient: 'from-sky-50 via-grass-50 to-grass-50',
    blocks: [
      {
        type: 'steps',
        items: [
          {
            title: 'Stage 1 — Actions (internal focus)',
            description: "What you and your team will actually do. Define your specific actions, who's responsible, and the timeframes involved.",
          },
          {
            title: 'Stage 2 — Outcomes (external focus)',
            description: "What changes for stakeholders as a result. Set out the outcomes you expect, the risks involved, and how you'll know it's working.",
          },
        ],
      },
      {
        type: 'paragraph',
        text: "Between the two, plan how you'll consult the stakeholders this work affects — their input is what keeps both stages grounded in reality, not assumptions.",
      },
      {
        type: 'paragraph',
        text: 'You can complete either stage first, and return to build out the other as your thinking develops.',
      },
    ],
  },
  {
    label: 'Slide 3 — Choose Your Working Scope',
    heading: 'Project-wide, or site-specific?',
    icon: <MapPin className="h-16 w-16 text-clay-500" />,
    bgGradient: 'from-clay-50 via-sand-50 to-ochre-50',
    blocks: [
      {
        type: 'paragraph',
        text: "Build your Theory of Change at project level if you're setting overall strategy, or at site level if you need to address what's different about a particular location — its stakeholders, its context, its dynamics.",
      },
      {
        type: 'paragraph',
        text: "Working at site level means factoring in consultation with the stakeholders specific to that site, so their input shapes the pathway from the start.",
      },
    ],
  },
  {
    label: "Slide 4 — What You'll Define",
    heading: "What you'll define at each stage",
    icon: <ClipboardList className="h-16 w-16 text-grass-500" />,
    bgGradient: 'from-grass-50 via-forest-50 to-sky-50',
    blocks: [
      { type: 'subheading', text: 'Stage 1 — Actions' },
      {
        type: 'bullets',
        items: [
          "The specific actions and activities you'll take",
          "Who's responsible for each one",
          'Timeframes and milestones',
          "What resources you'll need",
        ],
      },
      { type: 'subheading', text: 'Stage 2 — Outcomes' },
      {
        type: 'bullets',
        items: [
          'The outcomes and impact you expect to see',
          "The risks involved, and how you'll manage them",
          'What success actually looks like',
        ],
      },
    ],
  },
  {
    label: 'Slide 5 — Best Practices',
    heading: 'Three things to keep in mind',
    icon: <ShieldCheck className="h-16 w-16 text-sand-500" />,
    bgGradient: 'from-sand-50 via-clay-50 to-ochre-50',
    blocks: [
      {
        type: 'steps',
        items: [
          {
            title: 'Start where you have clarity.',
            description: "If you know your actions but not yet the outcomes, start with Stage 1 — you can return to Stage 2 once you've learned more.",
          },
          {
            title: 'Name the risks honestly.',
            description: "A Theory of Change that only shows the upside won't help you learn.",
          },
          {
            title: 'Treat it as living, not fixed.',
            description: "Revisit it as circumstances change or you learn more about what's working.",
          },
        ],
      },
    ],
  },
  {
    label: 'Slide 6 — Ready to Start',
    heading: 'Ready to build your Theory of Change?',
    icon: <PlayCircle className="h-16 w-16 text-forest-500" />,
    bgGradient: 'from-forest-50 via-sky-50 to-grass-50',
    blocks: [
      {
        type: 'paragraph',
        text: 'You know the two stages and how they connect. Time to map your own.',
      },
    ],
  },
];

const renderBlock = (block: GuideBlock, index: number) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-sky-500 leading-relaxed text-lg mb-4">
          {block.text}
        </p>
      );
    case 'subheading':
      return (
        <h4 key={index} className="font-semibold text-stratosphere-900 mb-3 text-lg">
          {block.text}
        </h4>
      );
    case 'bullets':
      return (
        <ul key={index} className="space-y-3 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sky-500">
              <div className="h-1.5 w-1.5 rounded-full bg-forest-500 mt-2.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'checklist':
      return (
        <ul key={index} className="space-y-3 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sky-500">
              <div className="bg-grass-50 rounded-full p-1 flex-shrink-0">
                <CheckSquare className="h-4 w-4 text-grass-500" />
              </div>
              {item}
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <div key={index} className="space-y-4 mb-6">
          {block.items.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest-500 text-white flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 bg-white rounded-lg p-4 border border-forest-500/10">
                <h5 className="font-semibold text-stratosphere-900 mb-1">{step.title}</h5>
                <p className="text-sm text-sky-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

const TheoryOfChangeGuidePage = ({ params }: { params: PageParams }) => {
  const { id: projectId } = params;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await getProject(projectId);
        setProject(response.data);
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

  const currentSlide = GUIDE_SLIDES[currentStep];
  const progress = ((currentStep + 1) / GUIDE_SLIDES.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === GUIDE_SLIDES.length - 1;

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const writeParagraph = (text: string, fontSize = 11, lineHeight = 6) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, contentWidth);
        ensureSpace(lines.length * lineHeight);
        doc.text(lines, margin, y);
        y += lines.length * lineHeight + 2;
      };

      const writeBullet = (text: string) => {
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(`•  ${text}`, contentWidth - 4);
        ensureSpace(lines.length * 6);
        doc.text(lines, margin + 2, y);
        y += lines.length * 6 + 1;
      };

      doc.setFontSize(22);
      doc.text('Theory of Change Guide', margin, y);
      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(120);
      doc.text(project?.name ? `Project: ${project.name}` : 'Project', margin, y);
      doc.setTextColor(0);
      y += 14;

      GUIDE_SLIDES.forEach((slide, slideIndex) => {
        ensureSpace(14);
        doc.setFontSize(15);
        doc.text(`${slideIndex + 1}. ${slide.heading}`, margin, y);
        y += 9;

        slide.blocks.forEach((block) => {
          if (block.type === 'paragraph') {
            writeParagraph(block.text);
          } else if (block.type === 'subheading') {
            ensureSpace(8);
            doc.setFontSize(12);
            doc.text(block.text, margin, y);
            y += 7;
          } else if (block.type === 'bullets' || block.type === 'checklist') {
            block.items.forEach((item) => writeBullet(item));
            y += 2;
          } else if (block.type === 'steps') {
            block.items.forEach((step, i) => {
              writeParagraph(`${i + 1}. ${step.title} — ${step.description}`);
            });
          }
        });

        y += 6;
      });

      doc.save(`theory-of-change-guide${project?.name ? `-${project.name.replace(/\s+/g, '-')}` : ''}.pdf`);
    } catch (error) {
      console.error('Error generating guide PDF:', error);
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar projectId={projectId} projectName="Loading..." />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stratosphere-50">
      <ProjectSidebar projectId={projectId} projectName={project?.name || 'Project'} />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-concrete-500/20 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/dashboard/project/${projectId}/theory-of-change`}
                className="flex items-center text-sky-500 hover:text-stratosphere-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back to Theory of Change</span>
              </Link>

              <div className="flex items-center gap-4">
                <div className="text-sm text-sky-500">
                  Slide {currentStep + 1} of {GUIDE_SLIDES.length}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="border-forest-500/30 text-forest-500 hover:bg-forest-50"
                >
                  <Download size={16} className="mr-2" />
                  {downloadingPDF ? 'Preparing PDF...' : 'Download PDF'}
                </Button>
                <Link href={`/dashboard/project/${projectId}/theory-of-change`}>
                  <Button variant="outline" size="sm" className="border-sky-500/30 text-sky-500 hover:bg-sky-50">
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
          {/* Slide Header */}
          <div className={`bg-gradient-to-br ${currentSlide.bgGradient} rounded-2xl p-8 mb-8 border border-concrete-500/20`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                {currentSlide.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-sky-500 mb-2">{currentSlide.label}</div>
                <h1 className="text-3xl font-bold text-stratosphere-900">{currentSlide.heading}</h1>
              </div>
            </div>
          </div>

          {/* Slide Content */}
          <div className="bg-white rounded-xl p-6 border border-concrete-500/20 shadow-sm mb-8">
            {currentSlide.blocks.map((block, i) => renderBlock(block, i))}

            {isLastStep && (
              <div className="mt-4">
                <Link href={`/dashboard/project/${projectId}/theory-of-change`}>
                  <Button size="lg" className="w-full bg-forest-500 hover:bg-forest-600 text-white">
                    <GitBranch className="h-5 w-5 mr-2" />
                    Build your Theory of Change
                  </Button>
                </Link>
              </div>
            )}
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
                onClick={() => setCurrentStep(Math.min(GUIDE_SLIDES.length - 1, currentStep + 1))}
                className="bg-forest-500 hover:bg-forest-600 text-white"
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

export default TheoryOfChangeGuidePage;
