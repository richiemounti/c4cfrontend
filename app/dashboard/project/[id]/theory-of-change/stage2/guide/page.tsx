// app/dashboard/project/[id]/theory-of-change/stage2/guide/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  ListChecks,
  Quote,
  ShieldCheck,
  PlayCircle,
  CheckSquare,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getProject } from '@/lib/api/project';

type GuideBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'checklist'; items: string[] }
  | { type: 'steps'; items: { title: string; description: string }[] }
  | { type: 'examples'; items: { quote: string; meta: string }[] };

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
    heading: 'Welcome to your Stage 2 Guide',
    icon: <TrendingUp className="h-16 w-16 text-forest-500" />,
    bgGradient: 'from-forest-50 via-sky-50 to-grass-50',
    blocks: [
      {
        type: 'paragraph',
        text: "Set out what actually changes for the people you work with — the outcomes you're aiming for, and the risks you need to manage along the way.",
      },
      {
        type: 'paragraph',
        text: 'Stage 2 is external-facing. Where Stage 1 was about what your team will do, this stage centres on what stakeholders will experience as a result.',
      },
      { type: 'subheading', text: "What you'll learn in this guide" },
      {
        type: 'checklist',
        items: [
          'How Stage 2 differs from Stage 1',
          'What to define for each outcome',
          'How to document risks honestly, not just the upside',
          'Best practices for writing outcomes that hold up to scrutiny',
        ],
      },
    ],
  },
  {
    label: 'Slide 2 — Stage 1 vs. Stage 2',
    heading: 'Two stages, two perspectives',
    icon: <ListChecks className="h-16 w-16 text-sky-500" />,
    bgGradient: 'from-sky-50 via-grass-50 to-grass-50',
    blocks: [
      { type: 'subheading', text: 'Stage 1 — Actions' },
      {
        type: 'bullets',
        items: [
          'What you will do',
          "Your team's activities",
          'Your responsibilities',
          'Your accountability',
        ],
      },
      { type: 'subheading', text: 'Stage 2 — Outcomes' },
      {
        type: 'bullets',
        items: [
          'What stakeholders experience',
          'Changes in their lives and communities',
          'The benefits and the risks',
          'The wider social impact',
        ],
      },
    ],
  },
  {
    label: "Slide 3 — What You'll Define",
    heading: 'Five things, for every outcome',
    icon: <ListChecks className="h-16 w-16 text-clay-500" />,
    bgGradient: 'from-clay-50 via-concrete-50 to-stratosphere-50',
    blocks: [
      {
        type: 'steps',
        items: [
          {
            title: 'Stakeholder group',
            description: 'Who will experience this outcome.',
          },
          {
            title: 'Theme and subtheme',
            description: 'e.g. Wellbeing → Psychosocial Support, to keep things organised.',
          },
          {
            title: 'Description',
            description: "Written from the stakeholder's perspective: what will change for them, not what you'll do.",
          },
          {
            title: 'Risks',
            description: 'Potential negative consequences, rated by severity, with a mitigation plan for each.',
          },
          {
            title: 'Impact areas',
            description: 'Tag relevant frameworks (e.g. SDGs) to show how this connects to the bigger picture.',
          },
        ],
      },
    ],
  },
  {
    label: 'Slide 4 — Example Outcomes',
    heading: 'What a well-defined outcome looks like',
    icon: <Quote className="h-16 w-16 text-forest-500" />,
    bgGradient: 'from-forest-50 via-sky-50 to-grass-50',
    blocks: [
      {
        type: 'examples',
        items: [
          {
            quote: 'Care-experienced young people report increased confidence in managing independent living',
            meta: 'Stakeholder: Care-Experienced Young People · Theme: Wellbeing → Life Skills · Risk: Some may disengage if support feels too intensive (Medium severity) · Mitigation: Offer flexible pacing; check in regularly on workload · SDGs: Quality Education, Reduced Inequalities',
          },
          {
            quote: "Risk: Some young people may feel pressure to appear 'resolved' too early in mentoring relationships",
            meta: 'Stakeholder: Care-Experienced Young People · Theme: Wellbeing → Psychosocial Support · Risk Severity: High · Mitigation: Train mentors to normalise setbacks; build in no-pressure check-ins',
          },
          {
            quote: 'Young people gain a stronger voice in decisions that affect their care',
            meta: 'Stakeholder: Youth Participants · Theme: Participation → Youth Leadership · Risk: Tokenistic involvement without real influence (Medium severity) · Mitigation: Build in feedback loops showing how youth input shaped decisions · SDGs: Reduced Inequalities, Peace, Justice and Strong Institutions',
          },
        ],
      },
    ],
  },
  {
    label: 'Slide 5 — Best Practices',
    heading: 'Five things to keep in mind',
    icon: <ShieldCheck className="h-16 w-16 text-sand-500" />,
    bgGradient: 'from-sand-50 via-clay-50 to-ochre-50',
    blocks: [
      {
        type: 'steps',
        items: [
          {
            title: "Write from the stakeholder's perspective.",
            description: 'Focus on what they will experience — "they will," not "we will."',
          },
          {
            title: 'Document both positive and negative.',
            description: 'Naming the risks honestly is what makes this useful, not a liability.',
          },
          {
            title: 'Be specific and measurable.',
            description: 'Where you can, include something trackable — not just a general aspiration.',
          },
          {
            title: 'Rate risk severity honestly.',
            description: 'High-severity risks need a real mitigation plan, not a token line.',
          },
          {
            title: 'Link to the bigger picture.',
            description: "Connecting outcomes to frameworks like the SDGs shows how your work fits the wider goals you're contributing to.",
          },
        ],
      },
    ],
  },
  {
    label: 'Slide 6 — Ready to Start',
    heading: 'Ready to define your outcomes?',
    icon: <PlayCircle className="h-16 w-16 text-forest-500" />,
    bgGradient: 'from-forest-50 via-sky-50 to-grass-50',
    blocks: [
      {
        type: 'paragraph',
        text: "You'll enter the Stage 2 workspace, where you can document outcomes and risks for every stakeholder group — and come back to refine them anytime.",
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
    case 'examples':
      return (
        <div key={index} className="space-y-4 mb-6">
          {block.items.map((example, i) => (
            <div key={i} className="bg-forest-50 rounded-lg p-4 border border-forest-500/10">
              <p className="font-medium text-stratosphere-900 mb-2">&ldquo;{example.quote}&rdquo;</p>
              <p className="text-xs text-sky-500">{example.meta}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default function Stage2GuidePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const siteId = searchParams.get('siteId');
  const siteQuery = siteId ? `?siteId=${siteId}` : '';

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
      doc.text('Theory of Change — Stage 2 Guide', margin, y);
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
          } else if (block.type === 'examples') {
            block.items.forEach((example) => {
              writeParagraph(`"${example.quote}"`);
              writeParagraph(example.meta, 9, 5);
            });
          }
        });

        y += 6;
      });

      doc.save(`theory-of-change-stage2-guide${project?.name ? `-${project.name.replace(/\s+/g, '-')}` : ''}.pdf`);
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
                href={`/dashboard/project/${projectId}/theory-of-change/stage2/intro${siteQuery}`}
                className="flex items-center text-sky-500 hover:text-stratosphere-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back to Stage 2</span>
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
                <Link href={`/dashboard/project/${projectId}/theory-of-change/stage2${siteQuery}`}>
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
                <Link href={`/dashboard/project/${projectId}/theory-of-change/stage2${siteQuery}`}>
                  <Button size="lg" className="w-full bg-forest-500 hover:bg-forest-600 text-white">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Define Stage 2 Outcomes
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
}
