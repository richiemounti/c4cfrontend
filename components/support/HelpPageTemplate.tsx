// components/support/HelpPageTemplate.tsx
import { FC, ReactNode } from 'react';
import Link from 'next/link';
import BreadcrumbNav from './BreadcrumbNav';
import RelatedTopics from './RelatedTopics';
import FeedbackWidget from './FeedbackWidget';
import TableOfContents from './TableOfContents';
import { HelpTopicMetadata } from '@/types';

interface HelpPageTemplateProps {
  metadata: HelpTopicMetadata;
  content: ReactNode;
}

const HelpPageTemplate: FC<HelpPageTemplateProps> = ({
  metadata,
  content
}) => {
  const { title, description, lastUpdated, section, relatedTopics } = metadata;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-sky-tint">
      <BreadcrumbNav section={section} title={title} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-semibold mb-3 text-stratosphere">{title}</h1>
            <p className="text-stratosphere/80 mb-6 text-lg">{description}</p>
            <div className="text-sm text-stratosphere/70 mb-8">Last updated: {lastUpdated}</div>
            
            <div className="prose prose-blue max-w-none">
              {content}
            </div>
          </div>
          
          <FeedbackWidget />
          
          {relatedTopics && relatedTopics.length > 0 && (
            <RelatedTopics topics={relatedTopics} />
          )}
          
          <div className="mt-8 text-center">
            <Link 
              href="/support" 
              className="inline-flex items-center text-sky hover:text-sky-500 font-medium"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back to Help Center
            </Link>
          </div>
        </div>
        
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <TableOfContents />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPageTemplate;