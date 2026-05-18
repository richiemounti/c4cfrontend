// components/support/RelatedTopics.tsx
import { FC } from 'react';
import Link from 'next/link';
import { helpTopicsRegistry } from '@/data/helpTopicsRegistry';

interface RelatedTopicsProps {
  topics: string[];
}

const RelatedTopics: FC<RelatedTopicsProps> = ({ topics }) => {
  // Filter out any topics that don't exist in the registry
  const validTopics = topics.filter(topicId => helpTopicsRegistry[topicId]);

  if (validTopics.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium mb-4 text-gray-800">Related Topics</h3>
      <ul className="space-y-3">
        {validTopics.map((topicId) => {
          const topic = helpTopicsRegistry[topicId];
          return (
            <li key={topicId}>
              <Link 
                href={`/support/${topicId}`} 
                className="text-stratosphere-500 hover:text-stratosphere-900 flex items-start"
              >
                <span className="inline-block mr-2">→</span>
                <span>{topic.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RelatedTopics;