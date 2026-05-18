// components/support/HelpTopic.tsx
import { FC } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SubTopic {
  title: string;
  href: string;
}

interface HelpTopicProps {
  title: string;
  id: string;
  isExpanded: boolean;
  toggleExpand: (id: string) => void;
  subTopics?: SubTopic[];
  hasExpansion?: boolean;
}

const HelpTopic: FC<HelpTopicProps> = ({ 
  title, 
  id, 
  isExpanded, 
  toggleExpand, 
  subTopics = [],
  hasExpansion = true
}) => {
  return (
    <div className="border-b border-grey-400">
      <button 
        className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-grey-50 text-stratosphere"
        onClick={() => toggleExpand(id)}
      >
        <span className="font-medium">{title}</span>
        <ChevronRight 
          className={`h-5 w-5 text-grey-500 transition-transform ${
            isExpanded && hasExpansion ? 'transform rotate-90' : ''
          }`} 
        />
      </button>
      
      {isExpanded && hasExpansion && subTopics.length > 0 && (
        <div className="bg-blue-50 p-4">
          <ul className="space-y-3">
            {subTopics.map((topic: any, index) => (
              <li key={index}>
                <Link href={topic.href} className="block text-grey-600 hover:text-stratosphere-500">
                  {topic.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HelpTopic;