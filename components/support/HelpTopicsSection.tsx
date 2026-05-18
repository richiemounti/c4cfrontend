// components/support/HelpTopicsSection.tsx
import { FC, useState } from 'react';
import HelpTopic from './HelpTopic';
import { helpTopicsRegistry } from '@/data/helpTopicsRegistry';

// Map of section IDs to display titles
const sectionTitles: Record<string, string> = {
  'project-setup': 'Set up your project',
  'stakeholder-mapping': 'Stakeholder Mapping',
  'theory-of-change': 'Theory of Change',
  // Add any other sections here
};

const HelpTopicsSection: FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('project-setup');

  const toggleSection = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  // Group topics by section
  const sectionGroups: Record<string, Array<{
    title: string;
    href: string;
  }>> = {};

  // Populate section groups from registry
  Object.entries(helpTopicsRegistry).forEach(([id, topic]) => {
    if (!sectionGroups[topic.section]) {
      sectionGroups[topic.section] = [];
    }
    
    sectionGroups[topic.section].push({
      title: topic.title,
      href: `/support/${id}`
    });
  });

  // Create topics array for rendering
  const topics = Object.entries(sectionGroups).map(([sectionId, subTopics]) => ({
    id: sectionId,
    title: sectionTitles[sectionId] || sectionId,
    subTopics,
    hasExpansion: true
  }));

  return (
    <div className="mb-10">
      <h3 className="text-lg font-medium mb-4 text-stratosphere">Browse Help Topics</h3>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {topics.map((topic) => (
          <HelpTopic
            key={topic.id}
            id={topic.id}
            title={topic.title}
            isExpanded={expandedSection === topic.id}
            toggleExpand={toggleSection}
            subTopics={topic.subTopics}
            hasExpansion={topic.hasExpansion}
          />
        ))}
      </div>
    </div>
  );
};

export default HelpTopicsSection;