// app/dashboard/project/[id]/stakeholders/guide/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  ListChecks,
  Map,
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
    heading: 'Welcome to your Stakeholder Mapping Guide',
    icon: <Users className="h-16 w-16 text-ochre-500" />,
    bgGradient: 'from-ochre-50 via-sand-50 to-clay-50',
    blocks: [
      {
        type: 'paragraph',
        text: "Map the people and groups who shape this project, or are shaped by it — before you plan how to work with them.",
      },
      { type: 'subheading', text: 'Stakeholder mapping helps you:' },
      {
        type: 'bullets',
        items: [
          'Spot risks and tensions early',
          'Design work that responds to real needs, not assumptions',
          'Build and keep trust with the communities and partners you work alongside',
          "Handle people's data safely and with proper consent",
        ],
      },
      { type: 'subheading', text: "What you'll learn in this guide" },
      {
        type: 'checklist',
        items: [
          'Who counts as a stakeholder on this project',
          'How to capture their interests, concerns and influence',
          'The difference between project-level and site-level stakeholders',
          'How this connects to your Theory of Change',
        ],
      },
    ],
  },
  {
    label: 'Slide 2 — The Process',
    heading: 'Four steps to mapping your stakeholders',
    icon: <ListChecks className="h-16 w-16 text-clay-500" />,
    bgGradient: 'from-clay-50 via-concrete-50 to-stratosphere-50',
    blocks: [
      {
        type: 'steps',
        items: [
          {
            title: "Identify who's involved",
            description: 'List the individuals, communities and organisations who affect, or are affected by, this work.',
          },
          {
            title: 'Understand their interests and concerns',
            description: 'What do they stand to gain, lose, or worry about?',
          },
          {
            title: 'Map their influence and impact',
            description: "Who can shape this project's success, and who will feel its effects most?",
          },
          {
            title: 'Let this shape how you engage',
            description: "Use what you've learned to plan consultation and communication that actually fits.",
          },
        ],
      },
    ],
  },
  {
    label: 'Slide 3 — Project-Level vs. Site-Level',
    heading: 'Two levels of stakeholders',
    icon: <Map className="h-16 w-16 text-sky-500" />,
    bgGradient: 'from-sky-50 via-grass-50 to-grass-50',
    blocks: [
      {
        type: 'paragraph',
        text: "Map project-level stakeholders here — people and groups whose influence or impact spans the whole project, across every site. Think national agencies, international partners, or community groups with project-wide reach.",
      },
      {
        type: 'paragraph',
        text: "Once you're working within a specific site, you'll map the stakeholders unique to that location there instead.",
      },
      {
        type: 'paragraph',
        text: 'Keeping the two separate helps you see clearly who matters — and where.',
      },
    ],
  },
  {
    label: "Slide 4 — What You'll Capture",
    heading: "For each stakeholder, you'll record:",
    icon: <ClipboardList className="h-16 w-16 text-grass-500" />,
    bgGradient: 'from-grass-50 via-forest-50 to-sky-50',
    blocks: [
      {
        type: 'bullets',
        items: [
          "Who they are, and how you'd categorise them",
          'Their interests, concerns and expectations',
          'The benefits and risks this project could bring them',
          'How much influence they have, and how much the project affects them',
        ],
      },
    ],
  },
  {
    label: 'Slide 5 — Best Practices',
    heading: 'Four things to keep in mind',
    icon: <ShieldCheck className="h-16 w-16 text-sand-500" />,
    bgGradient: 'from-sand-50 via-clay-50 to-ochre-50',
    blocks: [
      {
        type: 'steps',
        items: [
          {
            title: 'Organise by category.',
            description: 'Group stakeholders logically from the start — it makes analysis and reporting far easier later on.',
          },
          {
            title: 'Be inclusive.',
            description: "Actively look for groups who might be affected but don't have a strong voice — not just the loudest stakeholders.",
          },
          {
            title: 'Keep it alive.',
            description: "This isn't a one-off exercise. Revisit your mapping as you learn more or circumstances change.",
          },
          {
            title: 'Document as you go.',
            description: 'Clear records protect institutional memory and support safer, more consistent engagement.',
          },
          {
            title: "Protect people's data.",
            description: 'Get proper consent before collecting anyone\'s information, and handle it in line with data protection rules.',
          },
        ],
      },
    ],
  },
  {
    label: 'Slide 6 — Ready to Start',
    heading: 'Ready to map your stakeholders?',
    icon: <PlayCircle className="h-16 w-16 text-sky-500" />,
    bgGradient: 'from-sky-50 via-grass-50 to-grass-50',
    blocks: [
      {
        type: 'paragraph',
        text: "You now know what to capture and why it matters. It's time to get started.",
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
              <div className="h-1.5 w-1.5 rounded-full bg-ochre-500 mt-2.5 flex-shrink-0" />
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
        <div key={index} className="space-y-4">
          {block.items.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ochre-500 text-white flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 bg-white rounded-lg p-4 border border-ochre-500/10">
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

const StakeholderMappingGuidePage = ({ params }: { params: PageParams }) => {
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

      // Cover
      doc.setFontSize(22);
      doc.text('Stakeholder Mapping Guide', margin, y);
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

      doc.save(`stakeholder-mapping-guide${project?.name ? `-${project.name.replace(/\s+/g, '-')}` : ''}.pdf`);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ochre-500"></div>
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
                href={`/dashboard/project/${projectId}/stakeholders`}
                className="flex items-center text-sky-500 hover:text-stratosphere-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back to Stakeholder Mapping</span>
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
                  className="border-ochre-500/30 text-ochre-500 hover:bg-ochre-50"
                >
                  <Download size={16} className="mr-2" />
                  {downloadingPDF ? 'Preparing PDF...' : 'Download PDF'}
                </Button>
                <Link href={`/dashboard/stakeholders/project/${projectId}`}>
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
                <Button
                  size="lg"
                  className="w-full bg-ochre-500 hover:bg-ochre-600 text-white"
                  onClick={() => (window.location.href = `/dashboard/stakeholders/project/${projectId}`)}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Begin Stakeholder Mapping
                </Button>
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
                className="bg-ochre-500 hover:bg-ochre-600 text-white"
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

export default StakeholderMappingGuidePage;
